import { describe, expect, it } from "vitest";
import { fuelDataService } from "../client/src/services/fuelDataService";
import type { RequestStatus } from "../shared/types";

describe("FuelNow Emergency Request Flow & Transitions", () => {
  it("creates an emergency fuel request and matches partner", async () => {
    const req = await fuelDataService.createRequest({
      userId: "test-driver-1",
      fuelType: "Petrol",
      quantityLiters: 5,
      latitude: 28.6315,
      longitude: 77.2167,
      address: "Connaught Outer Ring Mile 2",
    });

    expect(req).toBeDefined();
    expect(req.id).toBeTruthy();
    expect(req.fuel_type).toBe("Petrol");
    expect(req.quantity_liters).toBe(5);
    expect(["searching", "assigned"]).toContain(req.status);
    expect(req.estimated_time).toBeGreaterThan(0);
  });

  it("updates request through the standard status lifecycle", async () => {
    const req = await fuelDataService.createRequest({
      userId: "test-driver-2",
      fuelType: "Diesel",
      quantityLiters: 10,
      latitude: 28.5823,
      longitude: 77.1645,
    });

    const statuses: RequestStatus[] = [
      "accepted",
      "on_the_way",
      "arrived",
      "delivered",
    ];

    for (const st of statuses) {
      const updated = await fuelDataService.updateStatus(req.id, st, {
        lat: 28.583,
        lng: 77.165,
      });
      expect(updated?.status).toBe(st);
    }

    const fetched = await fuelDataService.getRequestById(req.id);
    expect(fetched?.status).toBe("delivered");
  });
});
