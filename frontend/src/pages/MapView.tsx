import { useEffect, useRef, useState, useCallback } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { mockVehicles, updateVehiclePositions } from "../data/mockVehicles";
import type { Vehicle } from "../types/vehicle";

declare module "leaflet" {
  interface Marker {
    vehicleData?: Vehicle;
  }
}

const ISTANBUL_CENTER: L.LatLngExpression = [41.0082, 28.9784];
const DEFAULT_ZOOM = 12;

const SPEED_LIMIT = 50;
const TEMP_LIMIT = 25;

function isVehicleAlert(vehicle: Vehicle): boolean {
  return vehicle.speed > SPEED_LIMIT || vehicle.temperature > TEMP_LIMIT;
}

function createColoredIcon(isAlert: boolean): L.DivIcon {
  const color = isAlert ? "#ef4444" : "#22c55e";
  
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
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);

  const createClusterIcon = useCallback((cluster: L.MarkerCluster) => {
    const markers = cluster.getAllChildMarkers();
    const total = markers.length;

    let alertCount = 0;
    let normalCount = 0;
    
    markers.forEach((marker) => {
      const vehicle = marker.vehicleData;
      if (vehicle && isVehicleAlert(vehicle)) {
        alertCount++;
      } else {
        normalCount++;
      }
    });

    let size = 40;
    if (total > 10) size = 50;
    if (total > 25) size = 60;

    return L.divIcon({
      html: `
        <div class="custom-cluster" style="
          width: ${size}px;
          height: ${size}px;
          background-color: #3b82f6;
          border: 4px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${total}
        </div>
        <div class="cluster-tooltip" style="
          display: none;
          position: absolute;
          bottom: ${size + 8}px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          white-space: nowrap;
          font-size: 12px;
          z-index: 1000;
        ">
          <span style="color: #22c55e;">● ${normalCount} Normal</span><br/>
          <span style="color: #ef4444;">● ${alertCount} Uyarı</span>
        </div>
      `,
      className: "custom-cluster-wrapper",
      iconSize: L.point(size, size),
      iconAnchor: L.point(size / 2, size / 2)
    });
  }, []);

  // Harita başlatma
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView(ISTANBUL_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map.current);

    markerClusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: createClusterIcon
    });

    map.current.addLayer(markerClusterRef.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [createClusterIcon]);

  // Araçları haritaya ekle/güncelle
  useEffect(() => {
    if (!markerClusterRef.current) return;

    // Mevcut markerları temizle
    markerClusterRef.current.clearLayers();

    // Yeni markerları ekle
    vehicles.forEach((vehicle) => {
      const hasAlert = isVehicleAlert(vehicle);
      const icon = createColoredIcon(hasAlert);
      
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon });
      marker.vehicleData = vehicle;
      
      const statusText = hasAlert ? "⚠️ UYARI" : "✅ Normal";
      marker.bindPopup(`
        <strong>${vehicle.plateNumber}</strong><br/>
        <span style="color: ${hasAlert ? '#ef4444' : '#22c55e'}">${statusText}</span><br/>
        Sürücü: ${vehicle.driverName}<br/>
        Güzergah: ${vehicle.route}<br/>
        Hız: ${vehicle.speed} km/h ${vehicle.speed > SPEED_LIMIT ? "⚠️" : ""}<br/>
        Sıcaklık: ${vehicle.temperature}°C ${vehicle.temperature > TEMP_LIMIT ? "⚠️" : ""}
      `);

      markerClusterRef.current!.addLayer(marker);
    });
  }, [vehicles]);

  // 1Hz canlı güncelleme simülasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => updateVehiclePositions(prev));
    }, 1000); // 1 saniyede bir güncelle

    return () => clearInterval(interval);
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
