package main

import (
	"fmt"
	"telemetry-system/services/ingestion-service/internal/handlers"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	
	mux.HandleFunc("/api/v1/ingest", handlers.IngestTelemetry)

	fmt.Println("Ingestion Service listening port 8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		fmt.Println(err)
	}
}