export type FuelCoordinates = { lat: number; lng: number };

export function isValidFuelCoordinates(value: FuelCoordinates | null | undefined): value is FuelCoordinates {
  return Boolean(value && Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180);
}

export function normalizeFuelCoordinates(value: FuelCoordinates | null | undefined, fallback: FuelCoordinates): FuelCoordinates {
  return isValidFuelCoordinates(value) ? value : fallback;
}
export type RoutePoint = FuelCoordinates | [number, number];
export type RouteResult = { points: RoutePoint[]; distanceKm: number; etaMinutes: number; provider: "demo" | "provider" };

export interface RoutingProvider {
  getRoute(origin: FuelCoordinates, destination: FuelCoordinates): Promise<RouteResult>;
}

const demoProvider: RoutingProvider = {
  async getRoute(origin, destination) {
    const midpoint = { lat: (origin.lat + destination.lat) / 2 + 0.004, lng: (origin.lng + destination.lng) / 2 - 0.003 };
    return { points: [[origin.lat, origin.lng], [midpoint.lat, midpoint.lng], [destination.lat, destination.lng]], distanceKm: 3.4, etaMinutes: 12, provider: "demo" };
  },
};

export async function getFuelRoute(origin: FuelCoordinates, destination: FuelCoordinates, provider: RoutingProvider = demoProvider) {
  if (!isValidFuelCoordinates(origin) || !isValidFuelCoordinates(destination)) throw new Error("Invalid route coordinates");
  return provider.getRoute(origin, destination);
}

export function getDemoPartnerLocation(user: FuelCoordinates, progress: number): FuelCoordinates {
  const safeUser = normalizeFuelCoordinates(user, { lat: 28.6139, lng: 77.209 });
  const safeProgress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const start = { lat: safeUser.lat + 0.026, lng: safeUser.lng - 0.03 };
  return { lat: start.lat + (safeUser.lat - start.lat) * safeProgress, lng: start.lng + (safeUser.lng - start.lng) * safeProgress };
}
