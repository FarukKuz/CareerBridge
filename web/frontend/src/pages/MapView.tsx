import { useEffect, useRef, useState, useCallback } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type { Vehicle } from "../types/vehicle";
import VehicleDetailPanel from "../components/VehicleDetailPanel";
import VehicleSidebar, { type FilterType } from "../components/VehicleSidebar";
import PulseChat from "../components/PulseChat";

declare module "leaflet" {
  interface Marker {
    vehicleData?: Vehicle;
  }
}

const ISTANBUL_CENTER: L.LatLngExpression = [41.0082, 28.9784];
const DEFAULT_ZOOM = 12;

// Load limits from localStorage or defaults
const SPEED_LIMIT = Number(localStorage.getItem("SPEED_LIMIT")) || 50;
const TEMP_LIMIT = Number(localStorage.getItem("TEMP_LIMIT")) || 25;

function isVehicleAlert(vehicle: Vehicle): boolean {
  return vehicle.speed > SPEED_LIMIT ||
    vehicle.temperature > TEMP_LIMIT ||
    vehicle.isOutOfBounds === true;
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
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followingVehicleId, setFollowingVehicleId] = useState<string | null>(null);

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


  const filteredVehicles = vehicles.filter(vehicle => {
    const hasAlert = isVehicleAlert(vehicle);
    if (filter === "alert") return hasAlert;
    if (filter === "normal") return !hasAlert;
    return true;
  });

  const followingVehicle = followingVehicleId
    ? vehicles.find(v => v.id === followingVehicleId)
    : null;


  const focusedVehicleId = selectedVehicle?.id || followingVehicleId;
  const vehiclesToShow = focusedVehicleId
    ? filteredVehicles.filter(v => v.id === focusedVehicleId)
    : filteredVehicles;


  useEffect(() => {
    if (!markerClusterRef.current) return;

    markerClusterRef.current.clearLayers();


    vehiclesToShow.forEach((vehicle) => {
      const hasAlert = isVehicleAlert(vehicle);
      const icon = createColoredIcon(hasAlert);

      const marker = L.marker([vehicle.lat, vehicle.lng], { icon });
      marker.vehicleData = vehicle;

      marker.on("click", () => {
        setSelectedVehicle(vehicle);
      });

      markerClusterRef.current!.addLayer(marker);
    });
  }, [vehiclesToShow]);


  useEffect(() => {
    // WebSocket Bağlantısı
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("Connected to Telemetry WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Payload, Ingestion servisinden gelen TelemetryPacket yapısında olmalı
        // JSON: { vehicle_id, speed, latitude, longitude, temp, ... }

        setVehicles(prevVehicles => {
          const vehicleIndex = prevVehicles.findIndex(v => v.id === payload.vehicle_id);

          if (vehicleIndex === -1) {
            // Yeni araç ekle
            const newVehicle: Vehicle = {
              id: payload.vehicle_id,
              plateNumber: payload.vehicle_id, // Default to ID
              lat: payload.latitude,
              lng: payload.longitude,
              speed: payload.speed,
              temperature: payload.temperature,
              driverName: "Simulated Driver",
              route: "Istanbul Route",
              name: `Vehicle ${payload.vehicle_id}`,
              status: "active",
              lastUpdate: new Date().toISOString(),
              isOutOfBounds: false,
              driver: {
                name: "Simulated Driver",
                status: "active"
              },
              geofence: { // Default geofence logic needed for UI
                centerLat: 41.0082,
                centerLng: 28.9784,
                radius: 5000
              }
            };
            return [...prevVehicles, newVehicle];
          }

          // Mevcut aracı güncelle
          const updatedVehicles = [...prevVehicles];
          updatedVehicles[vehicleIndex] = {
            ...updatedVehicles[vehicleIndex],
            lat: payload.latitude,
            lng: payload.longitude,
            speed: payload.speed,
            temperature: payload.temperature,
            lastUpdate: new Date().toISOString()
          };
          return updatedVehicles;
        });

      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    ws.onclose = () => {
      console.log("Telemetry WebSocket Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);


  const currentSelectedVehicle = selectedVehicle
    ? vehicles.find(v => v.id === selectedVehicle.id) || null
    : null;

  const activeVehicle = currentSelectedVehicle || followingVehicle;

  useEffect(() => {
    if (!map.current) return;

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.remove();
      geofenceCircleRef.current = null;
    }

    if (activeVehicle && activeVehicle.geofence) {
      const isOutside = activeVehicle.isOutOfBounds;

      geofenceCircleRef.current = L.circle(
        [activeVehicle.geofence.centerLat, activeVehicle.geofence.centerLng],
        {
          radius: activeVehicle.geofence.radius,
          color: isOutside ? '#ef4444' : '#3b82f6',
          fillColor: isOutside ? '#ef4444' : '#3b82f6',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: isOutside ? '5, 5' : undefined
        }
      ).addTo(map.current);
    }
  }, [activeVehicle]);


  useEffect(() => {
    if (isFollowing && followingVehicle && map.current) {
      map.current.panTo([followingVehicle.lat, followingVehicle.lng], {
        animate: false
      });
    }
  }, [isFollowing, followingVehicle]);


  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFollowing(false);
    setFollowingVehicleId(null);
    if (map.current) {
      map.current.setView([vehicle.lat, vehicle.lng], 18);
    }
  };


  const handleDoubleClickVehicle = (vehicle: Vehicle) => {
    setIsFollowing(true);
    setFollowingVehicleId(vehicle.id);
    setSelectedVehicle(null);
    if (map.current) {
      map.current.setView([vehicle.lat, vehicle.lng], 18);
    }
  };




  const handleStopFollowing = () => {
    setIsFollowing(false);
    setFollowingVehicleId(null);
  };

  return (
    <div className="main-container">
      {/* Sol Sidebar */}
      <div className="sidebar">
        <VehicleSidebar
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={handleSelectVehicle}
          onDoubleClickVehicle={handleDoubleClickVehicle}
          isFollowing={isFollowing}
          followingVehicleId={followingVehicleId}
          filter={filter}
          onFilterChange={setFilter}
          speedLimit={SPEED_LIMIT}
          tempLimit={TEMP_LIMIT}
        />
      </div>

      {/* Harita Container */}
      <div className="map-container">
        <div
          ref={mapContainer}
          className="map-wrapper"
        />

        {/* Araç Detay Paneli */}
        {currentSelectedVehicle && (
          <div className="detail-panel">
            {selectedVehicle && (
              <VehicleDetailPanel
                vehicle={currentSelectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                onFocusVehicle={() => {
                  if (activeVehicle && map.current) {
                    map.current.setView([activeVehicle.lat, activeVehicle.lng], 15);
                  }
                }}
                onFollowVehicle={() => setIsFollowing(!isFollowing)}
                isFollowing={isFollowing}
                speedLimit={SPEED_LIMIT}
                tempLimit={TEMP_LIMIT}
              />
            )}    </div>
        )}

        {/* Takip Modu Floating Butonu - Panel kapalıyken göster */}
        {isFollowing && followingVehicle && !currentSelectedVehicle && (
          <div className="follow-mode-overlay">
            <div className="follow-mode-info">
              <button
                className="follow-mode-vehicle"
                onClick={() => setSelectedVehicle(followingVehicle)}
                title="Detayları göster"
              >
                🚌 {followingVehicle.plateNumber}
              </button>
              <span className="follow-mode-status">takip ediliyor</span>
              <button
                className="follow-mode-stop-btn"
                onClick={handleStopFollowing}
              >
                Durdur
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pulse Chat */}
      <PulseChat />
    </div>
  );
}
