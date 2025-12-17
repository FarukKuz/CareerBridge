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
  geofence?: Geofence; // Make optional
  isOutOfBounds?: boolean;

  // New fields used in MapView
  name?: string;
  status?: string;
  lastUpdate?: string;
  driver?: {
    name: string;
    status: string;
  };
}
