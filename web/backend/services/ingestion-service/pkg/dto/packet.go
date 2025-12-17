package dto

import "time"

type TelemetryPacket struct {
	VehicleID  int64   `json:"vehicle_id"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Speed      int     `json:"speed"`
	EngineTemp int     `json:"engine_temp"`
	FuelLevel  int     `json:"fuel_level"`
	Heading    int     `json:"heading"`

	Time       time.Time `json:"time"` 
}