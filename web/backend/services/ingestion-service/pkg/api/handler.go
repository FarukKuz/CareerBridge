// services/ingestion/pkg/api/handler.go
package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/FarukKuz/CareerBridge/services/ingestion/pkg/dto"
	"github.com/FarukKuz/CareerBridge/services/ingestion/pkg/producer"
)

type TelemetryHandler struct {
	Pub *producer.Publisher
}

func NewTelemetryHandler(pub *producer.Publisher) *TelemetryHandler {
	return &TelemetryHandler{Pub: pub}
}

// Handle: POST /api/telemetry
func (h *TelemetryHandler) Handle(w http.ResponseWriter, r *http.Request) {
	// 1. Sadece POST kabul et
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 2. JSON'u Parse Et
	var packet dto.TelemetryPacket
	if err := json.NewDecoder(r.Body).Decode(&packet); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// 3. Basit Validasyon (Şartname 5.1.2 - Validation)
	if packet.VehicleID == 0 {
		http.Error(w, "Missing vehicle_id", http.StatusBadRequest)
		return
	}
	// Zaman bilgisi yoksa sunucu zamanını ekle
	if packet.Time.IsZero() {
		packet.Time = time.Now()
	}

	// 4. Producer'a Gönder (Redis veya Disk)
	if err := h.Pub.Publish(r.Context(), &packet); err != nil {
		// Diske bile yazamadıysa 500 dön (Çok nadir)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 5. Başarılı
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"status":"queued"}`))
}