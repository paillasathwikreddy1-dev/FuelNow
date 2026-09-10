import { describe, expect, it } from "vitest";
import { googleMapFallback } from "../client/src/components/map/mapFallback";

describe("FuelNow Google Maps fallback", () => {
  it("provides actionable unavailable-map copy and retry label", () => {
    expect(googleMapFallback.eyebrow).toBe("MAP UNAVAILABLE");
    expect(googleMapFallback.title).toBeTruthy();
    expect(googleMapFallback.body).toContain("GPS");
    expect(googleMapFallback.retryLabel).toBe("Retry Google Maps");
  });
});
