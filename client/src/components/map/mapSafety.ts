import { getDemoPartnerLocation, normalizeFuelCoordinates, type FuelCoordinates } from "@/services/routingService";

export const DEFAULT_MAP_CENTER: FuelCoordinates = { lat: 28.6139, lng: 77.209 };

export function getSafeMapInputs(location: FuelCoordinates | null | undefined, demoGps: FuelCoordinates | null | undefined, progress: number) {
  const safeLocation = normalizeFuelCoordinates(location, normalizeFuelCoordinates(demoGps, DEFAULT_MAP_CENTER));
  const safePartner = getDemoPartnerLocation(safeLocation, progress);
  return { center: safeLocation, partner: safePartner };
}
