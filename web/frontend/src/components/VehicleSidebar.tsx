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
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb"
      }}>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
          🚌 Araç Listesi
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>
          Toplam {vehicles.length} araç
        </p>
      </div>

      {/* Filtreler */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Filtrele</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <FilterButton
            active={filter === "all"}
            onClick={() => onFilterChange("all")}
            color="#3b82f6"
          >
            Tümü ({vehicles.length})
          </FilterButton>
          <FilterButton
            active={filter === "normal"}
            onClick={() => onFilterChange("normal")}
            color="#22c55e"
          >
            Normal ({normalCount})
          </FilterButton>
          <FilterButton
            active={filter === "alert"}
            onClick={() => onFilterChange("alert")}
            color="#ef4444"
          >
            Uyarı ({alertCount})
          </FilterButton>
        </div>
      </div>

      {/* Araç Listesi */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px"
      }}>
        {filteredVehicles.map(vehicle => {
          const hasAlert = isVehicleAlert(vehicle, speedLimit, tempLimit);
          const isSelected = selectedVehicle?.id === vehicle.id;
          const isBeingFollowed = isFollowing && followingVehicleId === vehicle.id;

          return (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              onDoubleClick={() => onDoubleClickVehicle?.(vehicle)}
              style={{
                padding: "12px",
                marginBottom: "8px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: isSelected ? "#eff6ff" : "#f9fafb",
                border: isBeingFollowed 
                  ? "2px solid #8b5cf6" 
                  : isSelected 
                    ? "2px solid #3b82f6" 
                    : "1px solid #e5e7eb",
                transition: "all 0.15s ease"
              }}
            >
              {isBeingFollowed && (
                <div style={{ 
                  fontSize: "10px", 
                  color: "#8b5cf6", 
                  marginBottom: "4px",
                  fontWeight: 600
                }}>
                  📍 TAKİP EDİLİYOR
                </div>
              )}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: hasAlert ? "#ef4444" : "#22c55e"
                  }} />
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>
                    {vehicle.plateNumber}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {vehicle.speed} km/h
                </span>
              </div>
              <div style={{ 
                marginTop: "4px", 
                fontSize: "12px", 
                color: "#666",
                paddingLeft: "18px"
              }}>
                {vehicle.route}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function FilterButton({ 
  children, 
  active, 
  onClick, 
  color 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void; 
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 10px",
        fontSize: "11px",
        fontWeight: 500,
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        backgroundColor: active ? color : "#f3f4f6",
        color: active ? "white" : "#374151",
        transition: "all 0.15s ease"
      }}
    >
      {children}
    </button>
  );
}
