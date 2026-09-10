/**
 * FuelNow — Unified Shared Types
 */

export type UserRole = "customer" | "rider" | "fuel_station" | "admin";

export type FuelType = "Petrol" | "Diesel";

export type RequestStatus =
  | "pending"
  | "searching"
  | "assigned"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "delivered"
  | "cancelled";

export type RiderAvailability = "available" | "busy" | "offline";

export type StationStatus = "active" | "inactive" | "closed";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface FuelStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  status: StationStatus;
  available_petrol: number;
  available_diesel: number;
  created_at?: string;
}

export interface Rider {
  id: string;
  profile_id?: string | null;
  station_id?: string | null;
  vehicle_number: string;
  availability_status: RiderAvailability;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_update?: string | null;
  created_at?: string;
  // Joined fields for UI convenience
  profile?: Profile;
  station?: FuelStation;
}

export interface FuelRequest {
  id: string;
  user_id: string;
  fuel_type: FuelType;
  quantity_liters: number;
  latitude: number;
  longitude: number;
  address?: string | null;
  status: RequestStatus;
  assigned_station_id?: string | null;
  assigned_rider_id?: string | null;
  estimated_distance?: number | null;
  estimated_time?: number | null; // minutes
  created_at: string;
  updated_at: string;
  // Joined relation fields for convenience
  station?: FuelStation;
  rider?: Rider;
  user?: Profile;
}

export interface DeliveryTracking {
  id: string;
  request_id: string;
  rider_id?: string | null;
  latitude: number;
  longitude: number;
  status: string;
  recorded_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  request_id?: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ETAPredictionInput {
  distanceKm: number;
  timeOfDayHour?: number;
  trafficMultiplier?: number;
  riderAvailabilityScore?: number;
  weatherFactor?: number;
  historicalAvgMinutes?: number;
}

export interface ETAPredictionResult {
  estimatedMinutes: number;
  confidence: number;
  distanceKm: number;
  breakdown: {
    transitMinutes: number;
    dispatchPrepMinutes: number;
    trafficDelayMinutes: number;
  };
}

export interface PartnerMatchResult {
  station: FuelStation;
  rider: Rider;
  distanceKm: number;
  etaMinutes: number;
  score: number;
}

export interface DemandHeatmapPoint {
  region: string;
  latitude: number;
  longitude: number;
  intensity: number; // 0-1
  level: "low" | "medium" | "high";
  requestCount: number;
}

export interface DemandAnalytics {
  requestsToday: number;
  activeDeliveries: number;
  completedDeliveries: number;
  averageEtaMinutes: number;
  mostRequestedFuel: FuelType;
  petrolPercentage: number;
  dieselPercentage: number;
  highDemandRegions: string[];
}
