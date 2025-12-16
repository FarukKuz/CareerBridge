import { useEffect, useRef, useState, useCallback } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { mockVehicles, updateVehiclePositions } from "../data/mockVehicles";
import type { Vehicle } from "../types/vehicle";
import VehicleDetailPanel from "../components/VehicleDetailPanel";
import VehicleSidebar, { type FilterType } from "../components/VehicleSidebar";

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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isFollowing, setIsFollowing] = useState<boolean>(false); // Takip modu

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


  const vehiclesToShow = selectedVehicle 
    ? filteredVehicles.filter(v => v.id === selectedVehicle.id)
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
    const interval = setInterval(() => {
      setVehicles(prev => updateVehiclePositions(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const currentSelectedVehicle = selectedVehicle 
    ? vehicles.find(v => v.id === selectedVehicle.id) || null
    : null;


  useEffect(() => {
    if (isFollowing && currentSelectedVehicle && map.current) {
      map.current.panTo([currentSelectedVehicle.lat, currentSelectedVehicle.lng], {
        animate: false
      });
    }
  }, [isFollowing, currentSelectedVehicle]);


  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFollowing(false);
    if (map.current) {
      map.current.setView([vehicle.lat, vehicle.lng], 18);
    }
  };


  const handleDoubleClickVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFollowing(true);
    if (map.current) {
      map.current.setView([vehicle.lat, vehicle.lng], 18);
    }
  };

  return (
    <div style={{
      display: "flex",
      gap: "16px",
      height: "100vh",
      width: "100%",
      padding: "16px",
      boxSizing: "border-box",
      backgroundColor: "#f5f5f5"
    }}>
      {/* Sol Sidebar */}
      <VehicleSidebar
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={handleSelectVehicle}
        onDoubleClickVehicle={handleDoubleClickVehicle}
        isFollowing={isFollowing}
        filter={filter}
        onFilterChange={setFilter}
        speedLimit={SPEED_LIMIT}
        tempLimit={TEMP_LIMIT}
      />

      {/* Harita Container */}
      <div style={{ 
        flex: 1, 
        position: "relative",
        height: "100%"
      }}>
        <div 
          ref={mapContainer} 
          style={{ 
            height: "100%", 
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
          }} 
        />
        
        {/* Araç Detay Paneli */}
        <VehicleDetailPanel
          vehicle={currentSelectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          speedLimit={SPEED_LIMIT}
          tempLimit={TEMP_LIMIT}
        />
      </div>
    </div>
  );
}
