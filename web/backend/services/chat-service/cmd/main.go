package main

import (
	"log"
	"net/http"
	"os"

	"github.com/FarukKuz/CareerBridge/web/backend/services/chat-service/pkg/websocket"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	hub := websocket.NewHub()
	go hub.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, w, r)
	})

	log.Printf("💬 Chat Service Started on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
