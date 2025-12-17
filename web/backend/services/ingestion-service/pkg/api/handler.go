// services/ingestion/pkg/api/handler.go
package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/FarukKuz/CareerBridge/web/backend/services/ingestion-service/pkg/dto"
	"github.com/FarukKuz/CareerBridge/web/backend/services/ingestion-service/pkg/producer"
)

type TelemetryHandler struct {
	Pub *producer.Publisher
}

func NewTelemetryHandler(pub *producer.Publisher) *TelemetryHandler {
	return &TelemetryHandler{Pub: pub}
}

func (h *TelemetryHandler) Handle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var packet dto.TelemetryPacket
	if err := json.NewDecoder(r.Body).Decode(&packet); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if packet.VehicleID == "" {
		http.Error(w, "Missing vehicle_id", http.StatusBadRequest)
		return
	}

	if packet.Timestamp == "" {
		packet.Timestamp = time.Now().Format(time.RFC3339)
	}

	if err := h.Pub.Publish(r.Context(), &packet); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"status":"queued"}`))
}
