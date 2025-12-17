// services/ingestion/pkg/producer/publisher.go
package producer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/FarukKuz/CareerBridge/services/ingestion/pkg/dto"
	"github.com/redis/go-redis/v9"
)

type Publisher struct {
	RedisClient *redis.Client
	StreamKey   string
	OfflineFile string
	fileMu      sync.Mutex // Dosyaya aynı anda yazılmasını önlemek için kilit
}

func NewPublisher(rdb *redis.Client, stream string, file string) *Publisher {
	return &Publisher{
		RedisClient: rdb,
		StreamKey:   stream,
		OfflineFile: file,
	}
}

// Publish: Veriyi Redis'e, olmazsa Diske yazar.
func (p *Publisher) Publish(ctx context.Context, packet *dto.TelemetryPacket) error {
	// 1. Veriyi JSON byte dizisine çevir
	payload, err := json.Marshal(packet)
	if err != nil {
		return fmt.Errorf("marshalling error: %w", err)
	}

	// 2. ÖNCE REDIS'İ DENE (Happy Path)
	// Timeout koyuyoruz ki Redis yavaşsa servisi kitlemesin (200ms)
	redisCtx, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
	defer cancel()

	err = p.RedisClient.XAdd(redisCtx, &redis.XAddArgs{
		Stream: p.StreamKey,
		Values: map[string]interface{}{
			"payload": string(payload), // JSON'u string olarak gömüyoruz
			"ts":      time.Now().UnixMilli(),
		},
	}).Err()

	if err == nil {
		// Başarılıysa çık
		return nil
	}

	// 3. REDIS BAŞARISIZ -> B PLANI (DISK)
	log.Printf("⚠️ REDIS HATASI: %v. Veri diske yaziliyor...", err)
	return p.writeToDisk(payload)
}

// writeToDisk: Veriyi 'offline_data.log' dosyasına append eder.
func (p *Publisher) writeToDisk(data []byte) error {
	p.fileMu.Lock()         // Yazma sırasında kilitle
	defer p.fileMu.Unlock() // İş bitince kilidi aç

	// Dosyayı Append modunda aç, yoksa oluştur (0644 izniyle)
	f, err := os.OpenFile(p.OfflineFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("❌ DİSK HATASI: Dosya acilamadi! %v", err)
		return err
	}
	defer f.Close()

	// JSON verisini yaz ve satır atla (\n)
	if _, err := f.Write(data); err != nil {
		return err
	}
	if _, err := f.WriteString("\n"); err != nil {
		return err
	}

	return nil
}