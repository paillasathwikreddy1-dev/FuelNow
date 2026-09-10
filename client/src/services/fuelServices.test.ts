import { describe, expect, it } from "vitest";
import { forecastDemand, getEmergencyHeatmap, mapProviderConfig, optimizeRoute, predictEta, recommendPartner } from "./fuelServices";

describe("FuelNow service interfaces", () => {
  it("defaults to a safe mock map provider without requiring an API key", () => {
    expect(mapProviderConfig.provider).toBe("mock");
    expect(optimizeRoute(null, null).provider).toBe("mock");
  });
  it("returns explicit demo values for ETA and partner matching", () => {
    expect(predictEta(null, null)).toMatchObject({ minutes: 18, confidence: "demo" });
    expect(recommendPartner(null)).toMatchObject({ status: "assigned", distanceKm: 2.4 });
  });
  it("exposes structured demand and heatmap data for future APIs", () => {
    expect(forecastDemand().length).toBeGreaterThan(0);
    expect(getEmergencyHeatmap().every((point) => ["low", "medium", "high"].includes(point.level))).toBe(true);
  });
});
