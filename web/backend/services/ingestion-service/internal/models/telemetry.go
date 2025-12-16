package models

import (
	"errors"
)

type TelemetryData struct {
	DeviceID  string  `json:"device_id"`
	Timestamp int64   `json:"timestamp"`
	Lat       float64 `json:"lat"`
	Lon       float64 `json:"lon"`
	Speed     float64 `json:"speed"`
}

func (t *TelemetryData) Validate() error {
	if t.DeviceID == "" {
		return errors.New("Device id can't be empty")
	}

	if t.Timestamp <= 0 {
		return errors.New("Invalid timestamp")
	}

	if t.Lat < -90 || t.Lat > 90 {
		return errors.New("Invalid latitude")
	}

	if t.Lon < -180 || t.Lon > 180 {
		return errors.New("Invalid longitude")
	}

	if t.Speed < 0 {
		return errors.New("Speed can't be negative")
	}

	return nil
}