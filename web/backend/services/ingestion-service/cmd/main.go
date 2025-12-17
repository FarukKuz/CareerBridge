// services/ingestion/cmd/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/FarukKuz/CareerBridge/web/backend/services/ingestion-service/pkg/api"
	"github.com/FarukKuz/CareerBridge/web/backend/services/ingestion-service/pkg/producer"
	"github.com/FarukKuz/CareerBridge/web/backend/services/ingestion-service/pkg/websocket"
	"github.com/redis/go-redis/v9"
)

func main() {
	// 1. Ayarları Ortam Değişkenlerinden Al
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379" // Local dev fallback
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	// Dosya yolu: Container içinde shared volume'e yazmalı
	// veya lokal testte proje kök dizinine.
	offlineFile := "offline_data.log" 
	streamKey := "telemetry_stream"

	log.Printf("🚀 Ingestion Service Başlatılıyor. Port: %s, Redis: %s", port, redisAddr)

	// 2. Redis Bağlantısı
	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// 3. Bileşenleri Başlat
	pub := producer.NewPublisher(rdb, streamKey, offlineFile)
	handler := api.NewTelemetryHandler(pub)

	// WebSocket Hub Setup
	hub := websocket.NewHub()
	go hub.Run()

	// Redis PubSub Subscribe & Broadcast to WS
	go func() {
		ctx := context.Background()
		sub := rdb.Subscribe(ctx, "telemetry_live")
		ch := sub.Channel()
		for msg := range ch {
			hub.Broadcast <- []byte(msg.Payload)
		}
	}()

	// 4. Rotaları Tanımla
	http.HandleFunc("/api/telemetry", handler.Handle)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, w, r)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	log.Fatal(http.ListenAndServe(":"+port, nil))
}