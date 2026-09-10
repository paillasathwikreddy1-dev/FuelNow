import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  matchNearestPartner,
  predictETA,
} from "./dataScienceService";
import type {
  AppNotification,
  Coordinates,
  DeliveryTracking,
  FuelRequest,
  FuelStation,
  FuelType,
  RequestStatus,
  Rider,
  RiderAvailability,
  StationStatus,
} from "@shared/types";

// =============================================================
// Seed Initial In-Memory State (Offline / Zero-Config Mode)
// =============================================================
const SEED_STATIONS: FuelStation[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Central Express Fuel Hub",
    address: "Ring Road Sector 4, Connaught Hub",
    latitude: 28.6315,
    longitude: 77.2167,
    phone: "+91 98765 43210",
    status: "active",
    available_petrol: 4200.0,
    available_diesel: 5100.0,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Apex Highway Petroleum Hub",
    address: "NH-48 Corridor Mile 12, South Gate",
    latitude: 28.5823,
    longitude: 77.1645,
    phone: "+91 98765 43211",
    status: "active",
    available_petrol: 3800.0,
    available_diesel: 4100.0,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Metro Rapid Response Depot",
    address: "Outer Bypass Junction, Sector 21",
    latitude: 28.6582,
    longitude: 77.2412,
    phone: "+91 98765 43212",
    status: "active",
    available_petrol: 5100.0,
    available_diesel: 6000.0,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "West Highway Fuel Point",
    address: "Ring Road West Expressway KM 4",
    latitude: 28.6189,
    longitude: 77.1234,
    phone: "+91 98765 43213",
    status: "active",
    available_petrol: 2900.0,
    available_diesel: 3200.0,
  },
];

const SEED_RIDERS: Rider[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    station_id: "11111111-1111-1111-1111-111111111111",
    vehicle_number: "DL-01-FN-1082",
    availability_status: "available",
    current_latitude: 28.638,
    current_longitude: 77.21,
    profile: {
      id: "rider-1",
      full_name: "Vikram Malhotra",
      phone: "+91 98111 22334",
      role: "rider",
    },
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    station_id: "22222222-2222-2222-2222-222222222222",
    vehicle_number: "DL-04-FN-2048",
    availability_status: "available",
    current_latitude: 28.589,
    current_longitude: 77.171,
    profile: {
      id: "rider-2",
      full_name: "Arjun Sharma",
      phone: "+91 98222 33445",
      role: "rider",
    },
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    station_id: "33333333-3333-3333-3333-333333333333",
    vehicle_number: "DL-07-FN-3091",
    availability_status: "available",
    current_latitude: 28.662,
    current_longitude: 77.235,
    profile: {
      id: "rider-3",
      full_name: "Karan Verma",
      phone: "+91 98333 44556",
      role: "rider",
    },
  },
];

// Persistent local cache in browser session/localstorage
const STORAGE_PREFIX = "fuelnow_store_";

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    }
  } catch {
    // In-memory fallback
  }
}

let localStations: FuelStation[] = loadStorage("stations", SEED_STATIONS);
let localRiders: Rider[] = loadStorage("riders", SEED_RIDERS);
let localRequests: FuelRequest[] = loadStorage("requests", [
  {
    id: "req-init-1",
    user_id: "demo-user-1",
    fuel_type: "Petrol",
    quantity_liters: 5,
    latitude: 28.6139,
    longitude: 77.209,
    address: "Vasant Vihar Marg, Ring Road Mile 4",
    status: "on_the_way",
    assigned_station_id: "11111111-1111-1111-1111-111111111111",
    assigned_rider_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    estimated_distance: 2.8,
    estimated_time: 11,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    station: SEED_STATIONS[0],
    rider: SEED_RIDERS[0],
  },
]);
let localTracking: DeliveryTracking[] = loadStorage("tracking", [
  {
    id: "track-init-1",
    request_id: "req-init-1",
    rider_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    latitude: 28.625,
    longitude: 77.215,
    status: "on_the_way",
    recorded_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
]);
let localNotifications: AppNotification[] = loadStorage("notifications", []);

// =============================================================
// Fuel Data Service Methods
// =============================================================

export const fuelDataService = {
  /**
   * Fetch all registered fuel stations
   */
  async getStations(): Promise<FuelStation[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("fuel_stations")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data && data.length > 0) return data as FuelStation[];
    }
    return localStations;
  },

  /**
   * Fetch all delivery riders
   */
  async getRiders(): Promise<Rider[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("riders")
        .select("*, profile:profiles(*), station:fuel_stations(*)");
      if (!error && data && data.length > 0) return data as Rider[];
    }
    return localRiders;
  },

  /**
   * Create emergency fuel request:
   * 1. Finds optimal station & available rider via Data Science Matching
   * 2. Predicts ETA
   * 3. Persists request in Supabase or local store
   * 4. Logs tracking and notification
   */
  async createRequest(params: {
    userId: string;
    fuelType: FuelType;
    quantityLiters: number;
    latitude: number;
    longitude: number;
    address?: string;
  }): Promise<FuelRequest> {
    const stations = await this.getStations();
    const riders = await this.getRiders();

    const userCoords: Coordinates = {
      lat: params.latitude,
      lng: params.longitude,
    };

    // Data Science Feature 2: Partner Matching
    const match = matchNearestPartner(
      userCoords,
      params.fuelType,
      params.quantityLiters,
      stations,
      riders
    );

    // Data Science Feature 1: Multi-Factor ETA
    const eta = predictETA({
      distanceKm: match ? match.distanceKm : 3.2,
      timeOfDayHour: new Date().getHours(),
    });

    const newRequest: FuelRequest = {
      id: crypto.randomUUID(),
      user_id: params.userId,
      fuel_type: params.fuelType,
      quantity_liters: params.quantityLiters,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address || "GPS Stranded Location",
      status: match ? "assigned" : "searching",
      assigned_station_id: match?.station.id || null,
      assigned_rider_id: match?.rider.id || null,
      estimated_distance: match ? match.distanceKm : 3.2,
      estimated_time: eta.estimatedMinutes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      station: match?.station,
      rider: match?.rider,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("fuel_requests")
          .insert({
            id: newRequest.id,
            user_id: newRequest.user_id,
            fuel_type: newRequest.fuel_type,
            quantity_liters: newRequest.quantity_liters,
            latitude: newRequest.latitude,
            longitude: newRequest.longitude,
            address: newRequest.address,
            status: newRequest.status,
            assigned_station_id: newRequest.assigned_station_id,
            assigned_rider_id: newRequest.assigned_rider_id,
            estimated_distance: newRequest.estimated_distance,
            estimated_time: newRequest.estimated_time,
          })
          .select()
          .single();

        if (!error && data) {
          // Log initial tracking
          if (match?.rider) {
            await supabase.from("delivery_tracking").insert({
              request_id: newRequest.id,
              rider_id: match.rider.id,
              latitude: match.rider.current_latitude || match.station.latitude,
              longitude: match.rider.current_longitude || match.station.longitude,
              status: newRequest.status,
            });
          }
          return { ...newRequest, ...data };
        }
      } catch (err) {
        console.warn("[FuelNow Supabase] Insert request error:", err);
      }
    }

    // Local persistent state update
    localRequests.unshift(newRequest);
    saveStorage("requests", localRequests);

    // Add initial tracking coordinate
    if (match?.rider) {
      const track: DeliveryTracking = {
        id: crypto.randomUUID(),
        request_id: newRequest.id,
        rider_id: match.rider.id,
        latitude: match.rider.current_latitude || match.station.latitude,
        longitude: match.rider.current_longitude || match.station.longitude,
        status: newRequest.status,
        recorded_at: new Date().toISOString(),
      };
      localTracking.push(track);
      saveStorage("tracking", localTracking);
    }

    // Add initial notification
    const notif: AppNotification = {
      id: crypto.randomUUID(),
      user_id: params.userId,
      request_id: newRequest.id,
      title: "Emergency Request Dispatched",
      message: `${params.quantityLiters}L of ${params.fuelType} is scheduled. Partner assigned.`,
      read: false,
      created_at: new Date().toISOString(),
    };
    localNotifications.unshift(notif);
    saveStorage("notifications", localNotifications);

    return newRequest;
  },

  /**
   * Update request status (strictly adheres to the status enum)
   */
  async updateStatus(
    requestId: string,
    status: RequestStatus,
    riderLocation?: Coordinates
  ): Promise<FuelRequest | null> {
    const updatedTimestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("fuel_requests")
          .update({ status, updated_at: updatedTimestamp })
          .eq("id", requestId)
          .select("*, station:fuel_stations(*), rider:riders(*)")
          .single();

        if (!error && data) {
          if (riderLocation && data.assigned_rider_id) {
            await supabase.from("delivery_tracking").insert({
              request_id: requestId,
              rider_id: data.assigned_rider_id,
              latitude: riderLocation.lat,
              longitude: riderLocation.lng,
              status,
            });
          }
          return data as FuelRequest;
        }
      } catch (err) {
        console.warn("[FuelNow Supabase] updateStatus error:", err);
      }
    }

    // Local update
    const idx = localRequests.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      localRequests[idx] = {
        ...localRequests[idx],
        status,
        updated_at: updatedTimestamp,
      };

      // If rider location provided, log tracking
      if (riderLocation) {
        localTracking.push({
          id: crypto.randomUUID(),
          request_id: requestId,
          rider_id: localRequests[idx].assigned_rider_id,
          latitude: riderLocation.lat,
          longitude: riderLocation.lng,
          status,
          recorded_at: updatedTimestamp,
        });
        saveStorage("tracking", localTracking);
      }

      // If delivered, deduct station fuel stock
      if (status === "delivered" && localRequests[idx].assigned_station_id) {
        const stationIdx = localStations.findIndex(
          (s) => s.id === localRequests[idx].assigned_station_id
        );
        if (stationIdx !== -1) {
          if (localRequests[idx].fuel_type === "Petrol") {
            localStations[stationIdx].available_petrol = Math.max(
              0,
              localStations[stationIdx].available_petrol -
                localRequests[idx].quantity_liters
            );
          } else {
            localStations[stationIdx].available_diesel = Math.max(
              0,
              localStations[stationIdx].available_diesel -
                localRequests[idx].quantity_liters
            );
          }
          saveStorage("stations", localStations);
        }
      }

      saveStorage("requests", localRequests);
      return localRequests[idx];
    }
    return null;
  },

  /**
   * Get single request by ID
   */
  async getRequestById(requestId: string): Promise<FuelRequest | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("fuel_requests")
        .select("*, station:fuel_stations(*), rider:riders(*, profile:profiles(*))")
        .eq("id", requestId)
        .single();
      if (!error && data) return data as FuelRequest;
    }
    const found = localRequests.find((r) => r.id === requestId);
    if (found) {
      const station = localStations.find((s) => s.id === found.assigned_station_id);
      const rider = localRiders.find((r) => r.id === found.assigned_rider_id);
      return { ...found, station, rider };
    }
    return null;
  },

  /**
   * Get all requests for a customer
   */
  async getCustomerRequests(userId: string): Promise<FuelRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("fuel_requests")
          .select("*, station:fuel_stations(*), rider:riders(*)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) return data as FuelRequest[];
      } catch {
        // Fall through to local cache
      }
    }

    localRequests = loadStorage("requests", localRequests);
    const userMatches = localRequests.filter(
      (r) => r.user_id === userId || r.user_id === "demo-user-1" || r.user_id === "demo-driver-1"
    );
    if (userMatches.length > 0) return userMatches;
    return localRequests;
  },

  /**
   * Get the primary active or latest request to track on map
   */
  async getActiveRequest(userId?: string): Promise<FuelRequest | null> {
    const all = userId ? await this.getCustomerRequests(userId) : await this.getAllRequests();
    
    // Check if an explicit active request id was stored
    if (typeof window !== "undefined") {
      const savedId = window.localStorage.getItem("fuelnow_active_request_id");
      if (savedId) {
        const matched = all.find((r) => r.id === savedId);
        if (matched) return matched;
      }
    }

    // Find in-progress request
    const inProgress = all.find((r) =>
      ["pending", "searching", "assigned", "accepted", "on_the_way", "arrived"].includes(r.status)
    );
    if (inProgress) return inProgress;

    return all[0] || null;
  },

  /**
   * Get active requests for a rider
   */
  async getRiderRequests(riderId: string): Promise<FuelRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("fuel_requests")
        .select("*, station:fuel_stations(*)")
        .eq("assigned_rider_id", riderId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as FuelRequest[];
    }
    return localRequests.filter((r) => r.assigned_rider_id === riderId);
  },

  /**
   * Get requests for a fuel station
   */
  async getStationRequests(stationId: string): Promise<FuelRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("fuel_requests")
        .select("*, rider:riders(*)")
        .eq("assigned_station_id", stationId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as FuelRequest[];
    }
    return localRequests.filter((r) => r.assigned_station_id === stationId);
  },

  /**
   * Get all requests (for Admin)
   */
  async getAllRequests(): Promise<FuelRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("fuel_requests")
        .select("*, station:fuel_stations(*), rider:riders(*)")
        .order("created_at", { ascending: false });
      if (!error && data) return data as FuelRequest[];
    }
    return localRequests;
  },

  /**
   * Update rider availability and location
   */
  async updateRiderStatus(
    riderId: string,
    status: RiderAvailability,
    coords?: Coordinates
  ) {
    const updateObj: Record<string, unknown> = {
      availability_status: status,
      last_location_update: new Date().toISOString(),
    };
    if (coords) {
      updateObj.current_latitude = coords.lat;
      updateObj.current_longitude = coords.lng;
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("riders").update(updateObj).eq("id", riderId);
    }

    const idx = localRiders.findIndex((r) => r.id === riderId);
    if (idx !== -1) {
      localRiders[idx] = {
        ...localRiders[idx],
        availability_status: status,
        ...(coords
          ? { current_latitude: coords.lat, current_longitude: coords.lng }
          : {}),
      };
      saveStorage("riders", localRiders);
    }
  },

  /**
   * Update fuel station inventory
   */
  async updateStationStock(
    stationId: string,
    petrolLiters: number,
    dieselLiters: number,
    status?: StationStatus
  ) {
    const updateObj: Record<string, unknown> = {
      available_petrol: petrolLiters,
      available_diesel: dieselLiters,
    };
    if (status) updateObj.status = status;

    if (isSupabaseConfigured && supabase) {
      await supabase.from("fuel_stations").update(updateObj).eq("id", stationId);
    }

    const idx = localStations.findIndex((s) => s.id === stationId);
    if (idx !== -1) {
      localStations[idx] = {
        ...localStations[idx],
        available_petrol: petrolLiters,
        available_diesel: dieselLiters,
        ...(status ? { status } : {}),
      };
      saveStorage("stations", localStations);
    }
  },

  /**
   * Fetch user notifications
   */
  async getNotifications(userId: string): Promise<AppNotification[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as AppNotification[];
    }
    return localNotifications.filter((n) => n.user_id === userId);
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    }
    const idx = localNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      localNotifications[idx].read = true;
      saveStorage("notifications", localNotifications);
    }
  },
};
