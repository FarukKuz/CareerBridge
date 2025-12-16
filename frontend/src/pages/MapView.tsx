import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockVehicles } from "../data/mockVehicles";
import type { Vehicle } from "../types/vehicle";

const ISTANBUL_CENTER: L.LatLngExpression = [41.0082, 28.9784];
const DEFAULT_ZOOM = 12;

const SPEED_LIMIT = 50;
const TEMP_LIMIT = 25;

function isVehicleAlert(vehicle: Vehicle): boolean {
  return vehicle.speed > SPEED_LIMIT || vehicle.temperature > TEMP_LIMIT;
}

function createColoredIcon(isAlert: boolean): L.DivIcon {
  const color = isAlert ? "#ef4444" : "#22c55e"; // kırmızı veya yeşil
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView(ISTANBUL_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map.current);


    mockVehicles.forEach((vehicle) => {
      const hasAlert = isVehicleAlert(vehicle);
      const icon = createColoredIcon(hasAlert);
      
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon }).addTo(map.current!);
      
      const statusText = hasAlert ? "⚠️ UYARI" : "✅ Normal";
      marker.bindPopup(`
        <strong>${vehicle.plateNumber}</strong><br/>
        <span style="color: ${hasAlert ? '#ef4444' : '#22c55e'}">${statusText}</span><br/>
        Sürücü: ${vehicle.driverName}<br/>
        Güzergah: ${vehicle.route}<br/>
        Hız: ${vehicle.speed} km/h ${vehicle.speed > SPEED_LIMIT ? "⚠️" : ""}<br/>
        Sıcaklık: ${vehicle.temperature}°C ${vehicle.temperature > TEMP_LIMIT ? "⚠️" : ""}
      `);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center" ,
      alignItems: "flex-start",
      height: "100vh",
      width: "100%",
      padding: "10px",
      boxSizing: "border-box",
      backgroundColor: "#f5f5f5"
    }}>
      <div 
        ref={mapContainer} 
        style={{ 
          height: "70%", 
          width: "90%",
          maxWidth: "2500px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
        }} 
      />
    </div>
  );
}
