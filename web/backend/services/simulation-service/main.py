import time
import json
import random
import requests
import os
import signal
import sys

# Configuration
INGESTION_URL = os.getenv("INGESTION_URL", "http://localhost:8080/api/telemetry")
NUM_VEHICLES = int(os.getenv("NUM_VEHICLES", "5"))

# Istanbul Coordinates (approximate center)
CENTER_LAT = 41.0082
CENTER_LON = 28.9784

vehicles = []

def init_vehicles():
    for i in range(1, NUM_VEHICLES + 1):
        vehicles.append({
            "vehicle_id": f"vehicle-{i}",
            "lat": CENTER_LAT + random.uniform(-0.05, 0.05),
            "lon": CENTER_LON + random.uniform(-0.05, 0.05),
            "speed": random.uniform(0, 100),
            "temperature": random.uniform(20, 95),
            "driver_name": f"Driver {i}"
        })

def update_vehicle(v):
    # Simulate movement
    v["lat"] += random.uniform(-0.0005, 0.0005)
    v["lon"] += random.uniform(-0.0005, 0.0005)
    
    # Simulate speed changes
    v["speed"] += random.uniform(-5, 5)
    v["speed"] = max(0, min(180, v["speed"])) # Clamp speed
    
    # Simulate temp changes
    v["temperature"] += random.uniform(-1, 1)
    v["temperature"] = max(10, min(120, v["temperature"])) # Clamp temp

    return v

def send_telemetry(v):
    payload = {
        "vehicle_id": v["vehicle_id"],
        "latitude": v["lat"],
        "longitude": v["lon"],
        "speed": round(v["speed"], 2),
        "temperature": round(v["temperature"], 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    
    try:
        response = requests.post(INGESTION_URL, json=payload, timeout=1)
        # print(f"Sent {v['vehicle_id']}: {response.status_code}")
    except Exception as e:
        print(f"Error sending data for {v['vehicle_id']}: {e}")

def signal_handler(sig, frame):
    print('Stopping simulation...')
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print(f"Starting simulation with {NUM_VEHICLES} vehicles...")
    print(f"Target URL: {INGESTION_URL}")
    
    init_vehicles()
    
    while True:
        for v in vehicles:
            update_vehicle(v)
            send_telemetry(v)
        
        # 1Hz loop (approx)
        time.sleep(1.0)
