import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FuelNowMap from "@/components/map/FuelNowMap";
import { useAuth } from "@/contexts/AuthContext";
import { fuelDataService } from "@/services/fuelDataService";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  Fuel,
  MapPin,
  Navigation,
  Phone,
  Power,
  Radio,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import type { Coordinates, FuelRequest, Rider, RiderAvailability } from "@shared/types";

export default function RiderDashboard() {
  const { user } = useAuth();

  const [rider, setRider] = useState<Rider | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<RiderAvailability>("available");
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({
    lat: 28.638,
    lng: 77.21,
  });
  const [assignedRequests, setAssignedRequests] = useState<FuelRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<FuelRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load rider details and assigned requests
  useEffect(() => {
    fuelDataService.getRiders().then((riders) => {
      const current = riders[0] || null;
      setRider(current);
      if (current) {
        setOnlineStatus(current.availability_status);
        if (current.current_latitude && current.current_longitude) {
          setCurrentCoords({
            lat: current.current_latitude,
            lng: current.current_longitude,
          });
        }
      }
    });

    fuelDataService.getAllRequests().then((all) => {
      const forRider = all.filter((r) =>
        ["assigned", "accepted", "on_the_way", "arrived"].includes(r.status)
      );
      setAssignedRequests(forRider);
      if (forRider.length > 0) setActiveRequest(forRider[0]);
    });
  }, []);

  // Periodic Real GPS Location Updates when active (No fake movement)
  useEffect(() => {
    if (onlineStatus !== "available" || !rider) return;

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        };
        setCurrentCoords(coords);
        fuelDataService.updateRiderStatus(rider.id, "available", coords);
      },
      (err) => console.warn("[Rider GPS] Location update notice:", err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onlineStatus, rider]);

  // Status transition handler for rider action buttons
  const handleStatusUpdate = async (nextStatus: "accepted" | "on_the_way" | "arrived" | "delivered") => {
    if (!activeRequest) return;
    setIsUpdating(true);

    const updated = await fuelDataService.updateStatus(
      activeRequest.id,
      nextStatus,
      currentCoords
    );
    setIsUpdating(false);

    if (updated) {
      setActiveRequest(updated);
      if (nextStatus === "delivered") {
        // Refresh request queue
        setAssignedRequests((prev) => prev.filter((r) => r.id !== activeRequest.id));
      }
    }
  };

  const toggleOnline = async () => {
    if (!rider) return;
    const next: RiderAvailability = onlineStatus === "available" ? "offline" : "available";
    setOnlineStatus(next);
    await fuelDataService.updateRiderStatus(rider.id, next, currentCoords);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Rider Profile & Status Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 grid place-items-center flex-shrink-0">
              <Truck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {rider?.profile?.full_name || user?.fullName || "Arjun Sharma"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 font-bold">
                  {rider?.vehicle_number || "DL-04-FN-2048"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <MapPin size={12} className="text-emerald-400" />
                Current GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Online / Offline Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Dispatch Status
              </span>
              <strong
                className={`text-xs font-bold uppercase tracking-wider ${
                  onlineStatus === "available" ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {onlineStatus === "available" ? "● Online & Receiving" : "○ Offline"}
              </strong>
            </div>
            <Button
              onClick={toggleOnline}
              className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 ${
                onlineStatus === "available"
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              <Power size={14} />
              <span>{onlineStatus === "available" ? "Go Offline" : "Go Online"}</span>
            </Button>
          </div>
        </div>

        {/* Active Emergency Request Panel */}
        {activeRequest ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Request Details & Actions */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-500 tracking-wider font-bold block">
                    Active Assigned Task
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Emergency Refuel Dispatch
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
                  {activeRequest.status}
                </span>
              </div>

              {/* Customer & Location Facts */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Stranded Customer
                  </span>
                  <strong className="text-slate-100 text-sm block mt-0.5">
                    {activeRequest.user?.full_name || "Stranded Driver"}
                  </strong>
                  <span className="text-slate-400 mt-1 block">
                    {activeRequest.address || "Highway Corridor"}
                  </span>
                  <span className="text-[11px] font-mono text-sky-400 block mt-1">
                    GPS: {activeRequest.latitude.toFixed(4)}, {activeRequest.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Requested Fuel
                    </span>
                    <strong className="text-amber-400 text-base font-bold block mt-0.5">
                      {activeRequest.quantity_liters}L {activeRequest.fuel_type}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Estimated Distance
                    </span>
                    <strong className="text-slate-100 text-base font-bold block mt-0.5">
                      {activeRequest.estimated_distance || 3.4} km
                    </strong>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Accept Request -> Start Delivery -> Arrived -> Delivered */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
                  Delivery Action Protocol:
                </span>

                {activeRequest.status === "assigned" && (
                  <Button
                    onClick={() => handleStatusUpdate("accepted")}
                    disabled={isUpdating}
                    className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl"
                  >
                    Accept Emergency Request
                  </Button>
                )}

                {activeRequest.status === "accepted" && (
                  <Button
                    onClick={() => handleStatusUpdate("on_the_way")}
                    disabled={isUpdating}
                    className="w-full h-11 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <Navigation size={15} />
                    <span>Start Delivery (En Route)</span>
                  </Button>
                )}

                {activeRequest.status === "on_the_way" && (
                  <Button
                    onClick={() => handleStatusUpdate("arrived")}
                    disabled={isUpdating}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <MapPin size={15} />
                    <span>Mark as Arrived at Vehicle</span>
                  </Button>
                )}

                {activeRequest.status === "arrived" && (
                  <Button
                    onClick={() => handleStatusUpdate("delivered")}
                    disabled={isUpdating}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} />
                    <span>Confirm Fuel Delivered</span>
                  </Button>
                )}

                {activeRequest.status === "delivered" && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-bold">
                    ✓ Handover Complete! Safe travels logged.
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Map */}
            <div className="lg:col-span-7">
              <FuelNowMap
                height="440px"
                userLocation={{
                  lat: activeRequest.latitude,
                  lng: activeRequest.longitude,
                }}
                assignedRider={rider}
                tracking
                requestStatus={activeRequest.status}
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 grid place-items-center mx-auto mb-3">
              <Radio size={22} className="animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No active dispatches right now</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Keep your status set to <b className="text-emerald-400">Online</b>. Incoming
              emergency fuel requests within your sector will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
