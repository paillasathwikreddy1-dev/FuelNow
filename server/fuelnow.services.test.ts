import { describe, expect, it } from "vitest";
import { forecastDemand, getEmergencyHeatmap, mapProviderConfig, optimizeRoute, predictEta, recommendPartner } from "../client/src/services/fuelServices";

describe("FuelNow demo service contracts", () => {
  it("uses the mock map provider without a hardcoded API key", () => {
    expect(mapProviderConfig.provider).toBe("mock");
    expect(optimizeRoute(null, null).provider).toBe("mock");
  });
  it("returns explicit demo ETA and matching data", () => {
    expect(predictEta(null, null)).toEqual({ minutes: 18, confidence: "demo" });
    expect(recommendPartner(null).status).toBe("assigned");
  });
  it("returns structured demand and heatmap records", () => {
    expect(forecastDemand()[0]).toHaveProperty("region");
    expect(getEmergencyHeatmap()[0]).toHaveProperty("level");
  });
});
