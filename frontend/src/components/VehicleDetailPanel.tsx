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
  const isGeofenceAlert = vehicle.isOutOfBounds === true;
  const hasAlert = isSpeedAlert || isTempAlert || isGeofenceAlert;

  return (
    <article 
      className="panel-container"
      role="dialog"
      aria-label={`${vehicle.plateNumber} araç detayları`}
      aria-modal="false"
    >
      {/* Header */}
      <header className={`panel-header ${hasAlert ? "alert" : "normal"}`}>
        <div className="panel-header-title">
          <h3>{vehicle.plateNumber}</h3>
          <span role="status" aria-live="polite">
            {hasAlert ? "⚠️ Uyarı Durumunda" : "✅ Normal"}
          </span>
        </div>
        <button 
          className="panel-close-btn" 
          onClick={onClose}
          aria-label="Paneli kapat"
        >
          ✕
        </button>
      </header>

      {/* Content */}
      <div className="panel-content">
        {/* Sürücü Bilgisi */}
        <div className="panel-field">
          <label>Sürücü</label>
          <span className="panel-field-value">{vehicle.driverName}</span>
        </div>

        {/* Güzergah */}
        <div className="panel-field">
          <label>Güzergah</label>
          <span className="panel-field-value">{vehicle.route}</span>
        </div>

        {/* Hız ve Sıcaklık Grid */}
        <div className="panel-metrics">
          {/* Hız */}
          <div className={`panel-metric ${isSpeedAlert ? "alert" : "normal"}`}>
            <label>Hız</label>
            <span className={`panel-metric-value ${isSpeedAlert ? "alert" : "normal"}`}>
              {vehicle.speed}
            </span>
            <span className="panel-metric-unit"> km/h</span>
            {isSpeedAlert && <span> ⚠️</span>}
          </div>

          {/* Sıcaklık */}
          <div className={`panel-metric ${isTempAlert ? "alert" : "normal"}`}>
            <label>Sıcaklık</label>
            <span className={`panel-metric-value ${isTempAlert ? "alert" : "normal"}`}>
              {vehicle.temperature}
            </span>
            <span className="panel-metric-unit">°C</span>
            {isTempAlert && <span> ⚠️</span>}
          </div>
        </div>

        {/* Konum */}
        <div className="panel-info-box location">
          <label>Konum</label>
          <span>📍 {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}</span>
        </div>

        {/* Geofence Durumu */}
        <div className={`panel-info-box geofence ${isGeofenceAlert ? "alert" : "normal"}`}>
          <label>Bölge Durumu</label>
          <div>
            {isGeofenceAlert ? (
              <>⚠️ Bölge Dışında ({vehicle.geofence.radius}m sınır)</>
            ) : (
              <>✅ Bölge İçinde ({vehicle.geofence.radius}m sınır)</>
            )}
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="panel-actions" role="group" aria-label="Araç işlemleri">
          <button 
            className="panel-btn primary" 
            onClick={onFocusVehicle}
            aria-label={`${vehicle.plateNumber} konumuna git`}
          >
            📍 Konuma Git
          </button>
          <button 
            className={`panel-btn ${isFollowing ? "stop" : "follow"}`}
            onClick={onFollowVehicle}
            aria-pressed={isFollowing}
            aria-label={isFollowing ? `${vehicle.plateNumber} takibini durdur` : `${vehicle.plateNumber} aracını takip et`}
          >
            {isFollowing ? "🔴 Takibi Durdur" : "📡 Takip Et"}
          </button>
        </div>
      </div>
    </article>
  );
}
