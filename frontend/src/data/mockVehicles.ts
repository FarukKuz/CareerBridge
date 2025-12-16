import type { Vehicle } from "../types/vehicle";

function generateVehicles(count: number): Vehicle[] {
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

export const mockVehicles: Vehicle[] = generateVehicles(50);
