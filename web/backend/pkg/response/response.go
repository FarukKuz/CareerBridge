package response

import (
	"encoding/json"
	"net/http"
)

type Response struct {
	Success bool        `json:"success"`           
	Message string      `json:"message,omitempty"` 
	Data    interface{} `json:"data,omitempty"`    
}

func jsonResponse(w http.ResponseWriter, status int, payload Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	
	json.NewEncoder(w).Encode(payload)
}

func Success(w http.ResponseWriter, message string, data interface{}) {
	jsonResponse(w, http.StatusOK, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Error(w http.ResponseWriter, status int, message string) {
	jsonResponse(w, status, Response{
		Success: false,
		Message: message,
		Data:    nil,
	})
}

func Created(w http.ResponseWriter, message string, data interface{}) {
	jsonResponse(w, http.StatusCreated, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}