import type { Vehicle } from "../types/vehicle";

export type FilterType = "all" | "normal" | "alert";

interface VehicleSidebarProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onDoubleClickVehicle?: (vehicle: Vehicle) => void;
  isFollowing?: boolean;
  followingVehicleId?: string | null;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  speedLimit: number;
  tempLimit: number;
}

function isVehicleAlert(vehicle: Vehicle, speedLimit: number, tempLimit: number): boolean {
  return vehicle.speed > speedLimit || 
         vehicle.temperature > tempLimit || 
         vehicle.isOutOfBounds === true;
}

export default function VehicleSidebar({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onDoubleClickVehicle,
  isFollowing,
  followingVehicleId,
  filter,
  onFilterChange,
  speedLimit,
  tempLimit
}: VehicleSidebarProps) {

  const alertCount = vehicles.filter(v => isVehicleAlert(v, speedLimit, tempLimit)).length;
  const normalCount = vehicles.length - alertCount;


  const filteredVehicles = vehicles.filter(vehicle => {
    const hasAlert = isVehicleAlert(vehicle, speedLimit, tempLimit);
    if (filter === "alert") return hasAlert;
    if (filter === "normal") return !hasAlert;
    return true;
  });

  return (
    <aside className="sidebar-container" aria-label="Araç listesi paneli">
      {/* Header */}
      <header className="sidebar-header">
        <h2>🚌 Araç Listesi</h2>
        <p>Toplam {vehicles.length} araç</p>
      </header>

      {/* Filtreler */}
      <nav className="sidebar-filters" aria-label="Araç filtreleri">
        <span className="sidebar-filters-label" id="filter-label">Filtrele</span>
        <div className="sidebar-filters-buttons" role="group" aria-labelledby="filter-label">
          <button
            className="filter-btn"
            style={{
              backgroundColor: filter === "all" ? "#3b82f6" : "#f3f4f6",
              color: filter === "all" ? "white" : "#374151"
            }}
            onClick={() => onFilterChange("all")}
            aria-pressed={filter === "all"}
            aria-label={`Tüm araçları göster, ${vehicles.length} araç`}
          >
            Tümü ({vehicles.length})
          </button>
          <button
            className="filter-btn"
            style={{
              backgroundColor: filter === "normal" ? "#22c55e" : "#f3f4f6",
              color: filter === "normal" ? "white" : "#374151"
            }}
            onClick={() => onFilterChange("normal")}
            aria-pressed={filter === "normal"}
            aria-label={`Normal araçları göster, ${normalCount} araç`}
          >
            Normal ({normalCount})
          </button>
          <button
            className="filter-btn"
            style={{
              backgroundColor: filter === "alert" ? "#ef4444" : "#f3f4f6",
              color: filter === "alert" ? "white" : "#374151"
            }}
            onClick={() => onFilterChange("alert")}
            aria-pressed={filter === "alert"}
            aria-label={`Uyarılı araçları göster, ${alertCount} araç`}
          >
            Uyarı ({alertCount})
          </button>
        </div>
      </nav>

      {/* Araç Listesi */}
      <ul className="sidebar-list" role="listbox" aria-label="Araç listesi">
        {filteredVehicles.map(vehicle => {
          const hasAlert = isVehicleAlert(vehicle, speedLimit, tempLimit);
          const isSelected = selectedVehicle?.id === vehicle.id;
          const isBeingFollowed = isFollowing && followingVehicleId === vehicle.id;

          const itemClasses = [
            "vehicle-item",
            isSelected && "selected",
            isBeingFollowed && "following"
          ].filter(Boolean).join(" ");

          return (
            <li
              key={vehicle.id}
              className={itemClasses}
              onClick={() => onSelectVehicle(vehicle)}
              onDoubleClick={() => onDoubleClickVehicle?.(vehicle)}
              role="option"
              aria-selected={isSelected}
              aria-label={`${vehicle.plateNumber}, ${vehicle.route}, ${vehicle.speed} km/h${hasAlert ? ', uyarı var' : ''}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectVehicle(vehicle);
                }
              }}
            >
              {isBeingFollowed && (
                <div className="vehicle-following-badge" aria-live="polite">📍 TAKİP EDİLİYOR</div>
              )}
              <div className="vehicle-item-header">
                <div className="vehicle-item-info">
                  <span 
                    className={`vehicle-status-dot ${hasAlert ? "alert" : "normal"}`}
                    aria-hidden="true"
                  />
                  <span className="vehicle-plate">{vehicle.plateNumber}</span>
                </div>
                <span className="vehicle-speed">{vehicle.speed} km/h</span>
              </div>
              <div className="vehicle-route">{vehicle.route}</div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
