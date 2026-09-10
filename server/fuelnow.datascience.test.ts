import { describe, expect, it } from "vitest";
import {
  calculateHaversineDistance,
  computeDemandAnalytics,
  generateDemandHeatmap,
  matchNearestPartner,
  predictETA,
} from "../client/src/services/dataScienceService";
import type { FuelRequest, FuelStation, Rider } from "../shared/types";

describe("FuelNow Data Science Modules", () => {
  it("calculates accurate haversine geographic distance", () => {
    // Connaught Place to India Gate ~2.3 km
    const dist = calculateHaversineDistance(
      { lat: 28.6315, lng: 77.2167 },
      { lat: 28.6129, lng: 77.2295 }
    );
    expect(dist).toBeGreaterThan(1.8);
    expect(dist).toBeLessThan(3.0);
  });

  it("predicts multi-factor ETA accounting for distance and time of day", () => {
    const morningRush = predictETA({
      distanceKm: 5,
      timeOfDayHour: 9, // Peak rush hour
      trafficMultiplier: 1.2,
    });

    const nightDelivery = predictETA({
      distanceKm: 5,
      timeOfDayHour: 2, // Late night
      trafficMultiplier: 1.0,
    });

    expect(morningRush.estimatedMinutes).toBeGreaterThan(10);
    expect(morningRush.confidence).toBeGreaterThan(0.7);
    expect(morningRush.breakdown.transitMinutes).toBeDefined();
    expect(morningRush.breakdown.dispatchPrepMinutes).toBeGreaterThan(0);
    expect(morningRush.estimatedMinutes).toBeGreaterThanOrEqual(nightDelivery.estimatedMinutes);
  });

  it("matches nearest partner based on proximity, fuel stock, and availability", () => {
    const stations: FuelStation[] = [
      {
        id: "stn-1",
        name: "Station Alpha",
        address: "Road 1",
        latitude: 28.6139,
        longitude: 77.209,
        status: "active",
        available_petrol: 1000,
        available_diesel: 1000,
      },
      {
        id: "stn-2",
        name: "Station Far",
        address: "Road 20",
        latitude: 28.9,
        longitude: 77.5,
        status: "active",
        available_petrol: 5000,
        available_diesel: 5000,
      },
    ];

    const riders: Rider[] = [
      {
        id: "r-1",
        station_id: "stn-1",
        vehicle_number: "DL-01-FN-11",
        availability_status: "available",
        current_latitude: 28.615,
        current_longitude: 77.21,
      },
    ];

    const match = matchNearestPartner(
      { lat: 28.614, lng: 77.2092 },
      "Petrol",
      5,
      stations,
      riders
    );

    expect(match).not.toBeNull();
    expect(match?.station.id).toBe("stn-1");
    expect(match?.rider.id).toBe("r-1");
    expect(match?.distanceKm).toBeLessThan(2);
  });

  it("generates spatial demand heatmap clusters", () => {
    const heatmap = generateDemandHeatmap([]);
    expect(heatmap.length).toBeGreaterThan(0);
    expect(heatmap[0]).toHaveProperty("intensity");
    expect(["low", "medium", "high"]).toContain(heatmap[0].level);
  });

  it("computes operational demand analytics accurately", () => {
    const sampleRequests: FuelRequest[] = [
      {
        id: "1",
        user_id: "u1",
        fuel_type: "Petrol",
        quantity_liters: 5,
        latitude: 28.6,
        longitude: 77.2,
        status: "delivered",
        estimated_time: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: "u2",
        fuel_type: "Diesel",
        quantity_liters: 10,
        latitude: 28.61,
        longitude: 77.21,
        status: "on_the_way",
        estimated_time: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const stats = computeDemandAnalytics(sampleRequests);
    expect(stats.requestsToday).toBeGreaterThan(0);
    expect(stats.activeDeliveries).toBe(1);
    expect(stats.completedDeliveries).toBe(1);
    expect(stats.averageEtaMinutes).toBe(18); // (15 + 20) / 2 = 17.5 -> 18
  });
});
