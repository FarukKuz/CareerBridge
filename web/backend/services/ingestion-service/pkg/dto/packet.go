package dto



type TelemetryPacket struct {
	VehicleID   string  `json:"vehicle_id"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Speed       float64 `json:"speed"`
	Temperature float64 `json:"temperature"`
	Timestamp   string  `json:"timestamp"`
}