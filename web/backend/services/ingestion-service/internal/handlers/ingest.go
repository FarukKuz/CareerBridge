package handlers

import (
	"encoding/json"
	"telemetry-system/services/ingestion-service/internal/models"
	"telemetry-system/pkg/response"
	"net/http"
)

func IngestTelemetry(w http.ResponseWriter, r *http.Request) {
	// 1. Sadece POST kabul et
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Only POST method valid")
		return
	}

	// 2. JSON Decode (Body -> Struct)
	var data models.TelemetryData
	// Decode işlemi başarısızsa (örn: sayı yerine harf gelirse) hata döner
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		response.Error(w, http.StatusBadRequest, "JSON format incorrect")
		return
	}

	// 3. Validasyon (Yazdığımız methodu çağırıyoruz)
	if err := data.Validate(); err != nil {
		// Hata varsa, hatanın mesajını (err.Error()) istemciye dönüyoruz
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	// --- TODO: İleride buraya Redis ve Disk Buffer kodu gelecek ---
	
	// Şimdilik başarılı olduğunu görelim
	response.Success(w, "Data validated and accepted", data)
}