import { describe, expect, it } from "vitest";
import { getDemoPartnerLocation, isValidFuelCoordinates, normalizeFuelCoordinates } from "../client/src/services/routingService";

describe("FuelNow coordinate safety", () => {
  it("rejects NaN, Infinity, and out-of-range coordinates", () => {
    expect(isValidFuelCoordinates({ lat: Number.NaN, lng: 77.2 })).toBe(false);
    expect(isValidFuelCoordinates({ lat: 28.6, lng: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isValidFuelCoordinates({ lat: 91, lng: 77.2 })).toBe(false);
    expect(isValidFuelCoordinates({ lat: 28.6, lng: 77.2 })).toBe(true);
  });

  it("falls back safely and clamps invalid demo progress", () => {
    const fallback = { lat: 28.6139, lng: 77.209 };
    expect(normalizeFuelCoordinates({ lat: Number.NaN, lng: Number.NaN }, fallback)).toEqual(fallback);
    expect(getDemoPartnerLocation({ lat: Number.NaN, lng: Number.NaN }, Number.NaN)).toEqual({ lat: 28.6399, lng: 77.179 });
    expect(getDemoPartnerLocation(fallback, 2)).toEqual(fallback);
  });
});
