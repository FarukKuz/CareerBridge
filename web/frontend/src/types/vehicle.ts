export interface Geofence {
  centerLat: number;
  centerLng: number;
  radius: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  lat: number;
  lng: number;
  speed: number;
  temperature: number;
  driverName: string;
  route: string;
  geofence: Geofence;
  isOutOfBounds?: boolean;
}
