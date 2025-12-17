import type { Vehicle } from "../types/vehicle";

const routes = [
  "Kadıköy - Taksim",
  "Üsküdar - Beşiktaş",
  "Bakırköy - Eminönü",
  "Mecidiyeköy - Şişli",
  "Fatih - Aksaray",
  "Pendik - Kartal",
  "Beylikdüzü - Avcılar",
  "Sarıyer - Maslak",
  "Maltepe - Bostancı",
  "Zeytinburnu - Topkapı"
];

const drivers = [
  "Ahmet Yılmaz", "Mehmet Demir", "Ali Kaya", "Mustafa Öz",
  "Hasan Çelik", "Hüseyin Ak", "İbrahim Koç", "Osman Yurt",
  "Yusuf Aydın", "Emre Şahin", "Burak Kılıç", "Can Arslan"
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isOutsideGeofence(vehicle: Vehicle): boolean {
  if (!vehicle.geofence) return false;
  const distance = calculateDistance(
    vehicle.lat,
    vehicle.lng,
    vehicle.geofence.centerLat,
    vehicle.geofence.centerLng
  );
  return distance > vehicle.geofence.radius;
}

function generateVehicles(count: number): Vehicle[] {
  const vehicles: Vehicle[] = [];

  for (let i = 1; i <= count; i++) {
    const lat = 40.95 + Math.random() * 0.15;
    const lng = 28.80 + Math.random() * 0.35;

    const geofenceRadius = 500 + Math.floor(Math.random() * 1000);
    const startOutside = Math.random() < 0.2;
    const offsetLat = startOutside ? (Math.random() - 0.5) * 0.03 : 0;
    const offsetLng = startOutside ? (Math.random() - 0.5) * 0.03 : 0;

    const geofenceCenterLat = lat - offsetLat;
    const geofenceCenterLng = lng - offsetLng;

    const vehicle: Vehicle = {
      id: String(i),
      plateNumber: `34 ABC ${String(i).padStart(3, "0")}`,
      lat,
      lng,
      speed: Math.floor(Math.random() * 70),
      temperature: 18 + Math.floor(Math.random() * 12),
      driverName: drivers[Math.floor(Math.random() * drivers.length)],
      route: routes[Math.floor(Math.random() * routes.length)],
      geofence: {
        centerLat: geofenceCenterLat,
        centerLng: geofenceCenterLng,
        radius: geofenceRadius
      },
      isOutOfBounds: false
    };

    vehicle.isOutOfBounds = isOutsideGeofence(vehicle);

    vehicles.push(vehicle);
  }

  return vehicles;
}

export function updateVehiclePositions(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map(vehicle => {
    const latChange = (Math.random() - 0.5) * 0.002;
    const lngChange = (Math.random() - 0.5) * 0.002;

    const newLat = vehicle.lat + latChange;
    const newLng = vehicle.lng + lngChange;

    const speedChange = Math.floor((Math.random() - 0.5) * 10);
    let newSpeed = vehicle.speed + speedChange;
    newSpeed = Math.max(0, Math.min(80, newSpeed));

    const tempChange = Math.random() > 0.9 ? Math.floor((Math.random() - 0.5) * 4) : 0;
    let newTemp = vehicle.temperature + tempChange;
    newTemp = Math.max(15, Math.min(35, newTemp));

    const updatedVehicle: Vehicle = {
      ...vehicle,
      lat: newLat,
      lng: newLng,
      speed: newSpeed,
      temperature: newTemp
    };

    updatedVehicle.isOutOfBounds = isOutsideGeofence(updatedVehicle);

    return updatedVehicle;
  });
}

export const mockVehicles: Vehicle[] = generateVehicles(50);
