import {
  double,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * FuelNow — Emergency Fuel Delivery & Assistance Platform
 * Drizzle ORM Database Schema
 */

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["customer", "rider", "fuel_station", "admin", "user"])
    .default("customer")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const fuelStations = mysqlTable("fuel_stations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  phone: varchar("phone", { length: 32 }),
  status: mysqlEnum("status", ["active", "inactive", "closed"])
    .default("active")
    .notNull(),
  availablePetrol: double("availablePetrol").default(2500).notNull(),
  availableDiesel: double("availableDiesel").default(3500).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const riders = mysqlTable("riders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stationId: int("stationId"),
  vehicleNumber: varchar("vehicleNumber", { length: 64 }).notNull(),
  availabilityStatus: mysqlEnum("availabilityStatus", [
    "available",
    "busy",
    "offline",
  ])
    .default("available")
    .notNull(),
  currentLatitude: double("currentLatitude"),
  currentLongitude: double("currentLongitude"),
  lastLocationUpdate: timestamp("lastLocationUpdate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const fuelRequests = mysqlTable("fuel_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fuelType: mysqlEnum("fuelType", ["Petrol", "Diesel"]).notNull(),
  quantityLiters: double("quantityLiters").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  address: text("address"),
  status: mysqlEnum("status", [
    "pending",
    "searching",
    "assigned",
    "accepted",
    "on_the_way",
    "arrived",
    "delivered",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  assignedStationId: int("assignedStationId"),
  assignedRiderId: int("assignedRiderId"),
  estimatedDistance: double("estimatedDistance"),
  estimatedTime: int("estimatedTime"), // minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deliveryTracking = mysqlTable("delivery_tracking", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  riderId: int("riderId"),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  requestId: int("requestId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: int("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DbFuelStation = typeof fuelStations.$inferSelect;
export type DbRider = typeof riders.$inferSelect;
export type DbFuelRequest = typeof fuelRequests.$inferSelect;
export type DbDeliveryTracking = typeof deliveryTracking.$inferSelect;
export type DbNotification = typeof notifications.$inferSelect;
