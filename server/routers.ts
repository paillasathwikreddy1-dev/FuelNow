import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllFuelRequests,
  getAvailableRiders,
  getFuelRequestsForUser,
  getFuelStations,
  getUserNotifications,
} from "./db";
import {
  computeDemandAnalytics,
  generateDemandHeatmap,
  matchNearestPartner,
  predictETA,
} from "../client/src/services/dataScienceService";
import type { FuelRequest } from "@shared/types";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // FuelNow Emergency Requests
  fuelRequests: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      return getFuelRequestsForUser(ctx.user.id);
    }),
    all: protectedProcedure.query(async () => {
      return getAllFuelRequests();
    }),
  }),

  // Fuel Stations
  stations: router({
    list: publicProcedure.query(async () => {
      return getFuelStations();
    }),
  }),

  // Riders
  riders: router({
    available: publicProcedure.query(async () => {
      return getAvailableRiders();
    }),
  }),

  // Notifications
  notifications: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      return getUserNotifications(ctx.user.id);
    }),
  }),

  // Data Science endpoints
  dataScience: router({
    predictEta: publicProcedure
      .input(
        z.object({
          distanceKm: z.number().positive(),
          timeOfDayHour: z.number().min(0).max(23).optional(),
          trafficMultiplier: z.number().positive().optional(),
        })
      )
      .query(({ input }) => {
        return predictETA(input);
      }),

    matchPartner: publicProcedure
      .input(
        z.object({
          lat: z.number(),
          lng: z.number(),
          fuelType: z.enum(["Petrol", "Diesel"]),
          quantityLiters: z.number().positive(),
        })
      )
      .query(async ({ input }) => {
        // Fallback matching helper
        const userLoc = { lat: input.lat, lng: input.lng };
        const stations = await getFuelStations();
        const riders = await getAvailableRiders();
        // Convert to standard format
        return matchNearestPartner(
          userLoc,
          input.fuelType,
          input.quantityLiters,
          stations.map((s) => ({
            id: String(s.id),
            name: s.name,
            address: s.address,
            latitude: s.latitude,
            longitude: s.longitude,
            status: s.status as any,
            available_petrol: s.availablePetrol,
            available_diesel: s.availableDiesel,
          })),
          riders.map((r) => ({
            id: String(r.id),
            vehicle_number: r.vehicleNumber,
            availability_status: r.availabilityStatus as any,
            current_latitude: r.currentLatitude,
            current_longitude: r.currentLongitude,
          }))
        );
      }),

    demandHeatmap: publicProcedure.query(async () => {
      const requests = await getAllFuelRequests();
      const mapped: FuelRequest[] = requests.map((r) => ({
        id: String(r.id),
        user_id: String(r.userId),
        fuel_type: r.fuelType as any,
        quantity_liters: r.quantityLiters,
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
      return generateDemandHeatmap(mapped);
    }),

    analytics: publicProcedure.query(async () => {
      const requests = await getAllFuelRequests();
      const mapped: FuelRequest[] = requests.map((r) => ({
        id: String(r.id),
        user_id: String(r.userId),
        fuel_type: r.fuelType as any,
        quantity_liters: r.quantityLiters,
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
      return computeDemandAnalytics(mapped);
    }),
  }),
});

export type AppRouter = typeof appRouter;
