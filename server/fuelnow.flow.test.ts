import { describe, expect, it } from "vitest";
import { nextRequestState, resolveLocationState } from "../client/src/services/requestFlow";

describe("FuelNow emergency request flow", () => {
  it("moves from request confirmation to tracking and delivery", () => {
    expect(nextRequestState("idle", "confirm")).toBe("tracking");
    expect(nextRequestState("tracking", "complete")).toBe("delivered");
    expect(nextRequestState("delivered", "reset")).toBe("idle");
  });
  it("handles geolocation permission and availability states", () => {
    expect(resolveLocationState(false, null)).toBe("unavailable");
    expect(resolveLocationState(true, null)).toBe("loading");
    expect(resolveLocationState(true, false)).toBe("denied");
    expect(resolveLocationState(true, true)).toBe("ready");
  });
});
