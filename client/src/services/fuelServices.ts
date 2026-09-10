import {
  generateDemandHeatmap,
  matchNearestPartner,
  predictETA as predictModelETA,
} from "./dataScienceService";

export const mapProviderConfig = {
  provider: "mock" as const,
};

export function optimizeRoute(origin: unknown, destination: unknown) {
  return {
    provider: "mock" as const,
    points: [[28.6139, 77.209], [28.6315, 77.2167]],
    distanceKm: 3.4,
    etaMinutes: 14,
  };
}

export function predictEta(origin: unknown, destination: unknown) {
  return {
    minutes: 18,
    confidence: "demo" as const,
  };
}

export function recommendPartner(request: unknown) {
  return {
    status: "assigned" as const,
    distanceKm: 2.4,
    partnerName: "Arjun Sharma",
    rating: 4.9,
    vehicleNumber: "DL-04-FN-2048",
  };
}

export function forecastDemand() {
  return [
    { region: "Outer Ring Road Express Corridor", requests: 42, trend: "+14%" },
    { region: "NH-48 Highway Junction Mile 12", requests: 38, trend: "+9%" },
    { region: "East Bypass Industrial Belt", requests: 24, trend: "-3%" },
    { region: "West Suburb Late-Night Transit Sector", requests: 19, trend: "+6%" },
    { region: "Central Commercial Ring", requests: 15, trend: "0%" },
  ];
}

export function getEmergencyHeatmap() {
  return generateDemandHeatmap([]);
}
