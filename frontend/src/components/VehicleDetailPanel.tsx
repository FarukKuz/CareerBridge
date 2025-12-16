import type { Vehicle } from "../types/vehicle";

interface VehicleDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onFocusVehicle?: () => void;
  onFollowVehicle?: () => void;
  isFollowing?: boolean;
  speedLimit: number;
  tempLimit: number;
}

export default function VehicleDetailPanel({ 
  vehicle, 
  onClose, 
  onFocusVehicle,
  onFollowVehicle,
  isFollowing,
  speedLimit, 
  tempLimit 
}: VehicleDetailPanelProps) {
  if (!vehicle) return null;

  const isSpeedAlert = vehicle.speed > speedLimit;
  const isTempAlert = vehicle.temperature > tempLimit;
  const hasAlert = isSpeedAlert || isTempAlert;

  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "white",
      overflow: "auto"
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: hasAlert ? "#ef4444" : "#22c55e",
        color: "white",
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>{vehicle.plateNumber}</h3>
          <span style={{ fontSize: "12px", opacity: 0.9 }}>
            {hasAlert ? "⚠️ Uyarı Durumunda" : "✅ Normal"}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {/* Sürücü Bilgisi */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#666", display: "block" }}>Sürücü</label>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>{vehicle.driverName}</span>
        </div>

        {/* Güzergah */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#666", display: "block" }}>Güzergah</label>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>{vehicle.route}</span>
        </div>

        {/* Hız ve Sıcaklık Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "12px",
          marginBottom: "16px"
        }}>
          {/* Hız */}
          <div style={{
            padding: "12px",
            backgroundColor: isSpeedAlert ? "#fef2f2" : "#f0fdf4",
            borderRadius: "8px",
            border: `1px solid ${isSpeedAlert ? "#fecaca" : "#bbf7d0"}`
          }}>
            <label style={{ fontSize: "11px", color: "#666", display: "block" }}>Hız</label>
            <span style={{ 
              fontSize: "24px", 
              fontWeight: "bold",
              color: isSpeedAlert ? "#ef4444" : "#22c55e"
            }}>
              {vehicle.speed}
            </span>
            <span style={{ fontSize: "12px", color: "#666" }}> km/h</span>
            {isSpeedAlert && <span style={{ marginLeft: "4px" }}>⚠️</span>}
          </div>

          {/* Sıcaklık */}
          <div style={{
            padding: "12px",
            backgroundColor: isTempAlert ? "#fef2f2" : "#f0fdf4",
            borderRadius: "8px",
            border: `1px solid ${isTempAlert ? "#fecaca" : "#bbf7d0"}`
          }}>
            <label style={{ fontSize: "11px", color: "#666", display: "block" }}>Sıcaklık</label>
            <span style={{ 
              fontSize: "24px", 
              fontWeight: "bold",
              color: isTempAlert ? "#ef4444" : "#22c55e"
            }}>
              {vehicle.temperature}
            </span>
            <span style={{ fontSize: "12px", color: "#666" }}>°C</span>
            {isTempAlert && <span style={{ marginLeft: "4px" }}>⚠️</span>}
          </div>
        </div>

        {/* Konum */}
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#f8fafc", 
          borderRadius: "8px",
          fontSize: "12px",
          color: "#666",
          marginBottom: "16px"
        }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Konum</label>
          <span>📍 {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}</span>
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ 
          display: "flex", 
          gap: "8px",
          flexDirection: "column"
        }}>
          {/* Konuma Git Butonu */}
          <button
            onClick={onFocusVehicle}
            style={{
              padding: "12px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            📍 Konuma Git
          </button>

          {/* Takip Et Butonu */}
          <button
            onClick={onFollowVehicle}
            style={{
              padding: "12px 16px",
              backgroundColor: isFollowing ? "#8b5cf6" : "#f3f4f6",
              color: isFollowing ? "white" : "#374151",
              border: isFollowing ? "none" : "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {isFollowing ? "🔴 Takibi Durdur" : "📡 Takip Et"}
          </button>
        </div>
      </div>
    </div>
  );
}
