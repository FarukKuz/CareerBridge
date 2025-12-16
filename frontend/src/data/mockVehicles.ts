import type { Vehicle } from "../types/vehicle";

export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    plateNumber: "34 ABC 001",
    lat: 41.0082,
    lng: 28.9784,
    speed: 45,
    temperature: 22,
    driverName: "Ahmet Yılmaz",
    route: "Kadıköy - Taksim"
  },
  {
    id: "2",
    plateNumber: "34 ABC 002",
    lat: 41.0422,
    lng: 29.0083,
    speed: 60,
    temperature: 24,
    driverName: "Mehmet Demir",
    route: "Üsküdar - Beşiktaş"
  },
  {
    id: "3",
    plateNumber: "34 ABC 003",
    lat: 40.9923,
    lng: 28.8765,
    speed: 38,
    temperature: 28,
    driverName: "Ali Kaya",
    route: "Bakırköy - Eminönü"
  },
  {
    id: "4",
    plateNumber: "34 ABC 004",
    lat: 41.0553,
    lng: 28.9491,
    speed: 52,
    temperature: 23,
    driverName: "Mustafa Öz",
    route: "Mecidiyeköy - Şişli"
  },
  {
    id: "5",
    plateNumber: "34 ABC 005",
    lat: 41.0136,
    lng: 28.9550,
    speed: 0,
    temperature: 19,
    driverName: "Hasan Çelik",
    route: "Fatih - Aksaray"
  }
];
