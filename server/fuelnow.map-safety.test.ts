import { describe, expect, it } from "vitest";
import { DEFAULT_MAP_CENTER, getSafeMapInputs } from "../client/src/components/map/mapSafety";

describe("FuelNow map input safety", () => {
  it("normalizes invalid location and demo inputs to a finite center and partner position", () => {
    const result = getSafeMapInputs({ lat: Number.NaN, lng: Number.NaN }, { lat: Number.POSITIVE_INFINITY, lng: Number.NaN }, Number.NaN);
    expect(result.center).toEqual(DEFAULT_MAP_CENTER);
    expect(Number.isFinite(result.center.lat)).toBe(true);
    expect(Number.isFinite(result.center.lng)).toBe(true);
    expect(Number.isFinite(result.partner.lat)).toBe(true);
    expect(Number.isFinite(result.partner.lng)).toBe(true);
  });

  it("preserves valid manual/demo coordinates", () => {
    const result = getSafeMapInputs({ lat: 17.385, lng: 78.4867 }, null, 0.5);
    expect(result.center).toEqual({ lat: 17.385, lng: 78.4867 });
    expect(result.partner.lat).not.toBeNaN();
    expect(result.partner.lng).not.toBeNaN();
  });

  it("falls back when a manual pin contains invalid values", () => {
    const result = getSafeMapInputs({ lat: Number.NaN, lng: 78.4867 }, null, 0.5);
    expect(result.center).toEqual(DEFAULT_MAP_CENTER);
    expect(Number.isFinite(result.partner.lat)).toBe(true);
    expect(Number.isFinite(result.partner.lng)).toBe(true);
  });
});
