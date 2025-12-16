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

function generateVehicles(count: number): Vehicle[] {
  const vehicles: Vehicle[] = [];

  for (let i = 1; i <= count; i++) {
    const lat = 40.95 + Math.random() * 0.15;
    const lng = 28.80 + Math.random() * 0.35;
    
    vehicles.push({
      id: String(i),
      plateNumber: `34 ABC ${String(i).padStart(3, "0")}`,
      lat,
      lng,
      speed: Math.floor(Math.random() * 70),
      temperature: 18 + Math.floor(Math.random() * 12),
      driverName: drivers[Math.floor(Math.random() * drivers.length)],
      route: routes[Math.floor(Math.random() * routes.length)]
    });
  }

  return vehicles;
}

export function updateVehiclePositions(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map(vehicle => {

    const latChange = (Math.random() - 0.5) * 0.002;
    const lngChange = (Math.random() - 0.5) * 0.002;
    

    const speedChange = Math.floor((Math.random() - 0.5) * 10);
    let newSpeed = vehicle.speed + speedChange;
    newSpeed = Math.max(0, Math.min(80, newSpeed));
    
    const tempChange = Math.random() > 0.9 ? Math.floor((Math.random() - 0.5) * 4) : 0;
    let newTemp = vehicle.temperature + tempChange;
    newTemp = Math.max(15, Math.min(35, newTemp));

    return {
      ...vehicle,
      lat: vehicle.lat + latChange,
      lng: vehicle.lng + lngChange,
      speed: newSpeed,
      temperature: newTemp
    };
  });
}

export const mockVehicles: Vehicle[] = generateVehicles(50);
