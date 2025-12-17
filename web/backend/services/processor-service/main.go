package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
)

// TelemetryPacket, Ingestion servisindeki yapı ile uyumlu olmalı
// JSON keys must match the incoming data
type TelemetryPacket struct {
	VehicleID   string  `json:"vehicle_id"`
	Speed       float64 `json:"speed"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Temperature float64 `json:"temperature"`
	Timestamp   string  `json:"timestamp"`
}

func main() {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Default to local dev
		dbURL = "postgres://postgres:password@localhost:5432/careerbridge?sslmode=disable"
	}

	streamKey := "telemetry_stream"
	groupName := "processor_group"
	consumerName := "worker_1"

	log.Printf("🔥 Processor Service Başlatılıyor. Redis: %s", redisAddr)

	// 0. DB Bağlantısı
	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())

	// Create Hypertable if not exists
	_, err = conn.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS telemetry (
			time TIMESTAMPTZ NOT NULL,
			vehicle_id TEXT NOT NULL,
			latitude DOUBLE PRECISION,
			longitude DOUBLE PRECISION,
			speed DOUBLE PRECISION,
			temperature DOUBLE PRECISION
		);
		SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);
	`)
	if err != nil {
		log.Printf("Tablo oluşturma hatası: %v", err)
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// 1. Tüketici Grubu Oluştur (Hata verirse yok say - zaten varsa hata verir)
	err = rdb.XGroupCreateMkStream(context.Background(), streamKey, groupName, "$").Err()
	if err != nil && err.Error() != "BUSYGROUP Consumer Group name already exists" {
		log.Printf("Grup oluşturma uyarısı: %v", err)
	}

	// 2. Sonsuz Döngü ile Veri Okuma
	for {
		entries, err := rdb.XReadGroup(context.Background(), &redis.XReadGroupArgs{
			Group:    groupName,
			Consumer: consumerName,
			Streams:  []string{streamKey, ">"},
			Count:    10,
			Block:    2000 * time.Millisecond,
		}).Result()

		if err == redis.Nil {
			continue // Veri yok
		} else if err != nil {
			log.Printf("Redis okuma hatası: %v", err)
			time.Sleep(1 * time.Second)
			continue
		}

		for _, stream := range entries {
			for _, msg := range stream.Messages {
				processMessage(conn, rdb, msg.Values) // Pass Redis Client
				// Mesajı işlendi olarak işaretle (ACK)
				rdb.XAck(context.Background(), streamKey, groupName, msg.ID)
			}
		}
	}
}

func processMessage(conn *pgx.Conn, rdb *redis.Client, values map[string]interface{}) {
	payloadStr, ok := values["payload"].(string)
	if !ok {
		return
	}

	var packet TelemetryPacket
	if err := json.Unmarshal([]byte(payloadStr), &packet); err != nil {
		log.Printf("JSON parse hatası: %v", err)
		return
	}

	// Persist to DB
	_, err := conn.Exec(context.Background(), `
		INSERT INTO telemetry (time, vehicle_id, latitude, longitude, speed, temperature)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, packet.Timestamp, packet.VehicleID, packet.Latitude, packet.Longitude, packet.Speed, packet.Temperature)
	
	if err != nil {
		log.Printf("DB insert hatası: %v", err)
	}

	// --- UYARI MOTORU ---
	// 1. Sıcaklık Kontrolü
	if packet.Temperature > 90.0 {
		sendAlert(rdb, packet.VehicleID, fmt.Sprintf("⚠️ ALERT: Vehicle %s - CRITICAL TEMP: %.2f°C", packet.VehicleID, packet.Temperature))
	}

	// 2. Hız Kontrolü
	if packet.Speed > 120.0 {
		sendAlert(rdb, packet.VehicleID, fmt.Sprintf("⚠️ ALERT: Vehicle %s - OVERSPEED: %.2f km/h", packet.VehicleID, packet.Speed))
	}
}

// ChatMessage structure used by Chat Service
type ChatMessage struct {
	Sender  string `json:"sender"`
	Content string `json:"content"`
	RoomID  string `json:"room_id"` // Optional, if we supported rooms
}

func sendAlert(rdb *redis.Client, vehicleID string, msg string) {
	log.Printf("🚨 ALARM [%s]: %s", vehicleID, msg)
	
	// Publish to Chat Service via Redis
	// We use the same channel that Chat Service listens/broadcasts to? 
	// Actually Chat Service typically listens to WebSocket and broadcasts to other WebSockets.
	// To inject a message, we might need to publish to the channel the Chat Service SUBSCRIBES to.
	// Looking at chat-service, it seems to handle logic internally. 
	// Simple approach: Publish to a "system_alerts" channel that Frontend *also* listens to via Ingestion?
	// OR: Publish to 'chat_room' if chat service subscribes to it.
	
	// Let's assume we publish to 'telemetry_live' which Ingestion Service forwards to Frontend.
	// But we want it as a proper "Alert" or "Message".
	
	// Better: Use the Chat Service's PubSub channel if it exists. 
	// Since we haven't implemented Redis subscription in Chat Service yet (it was simple hub), 
	// I will use `ingestion-service`'s `telemetry_live` channel but with a special `type` field in JSON.
	
	alertPayload := map[string]interface{}{
		"type": "ALERT",
		"vehicle_id": vehicleID,
		"message": msg,
		"timestamp": time.Now().Unix(),
	}
	
	jsonBytes, _ := json.Marshal(alertPayload)
	rdb.Publish(context.Background(), "telemetry_live", jsonBytes)
}
