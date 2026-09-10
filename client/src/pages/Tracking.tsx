import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import FuelNowMap from "@/components/map/FuelNowMap";
import { fuelDataService } from "@/services/fuelDataService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  FastForward,
  Fuel,
  MapPin,
  Navigation,
  Phone,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import type { FuelRequest, RequestStatus } from "@shared/types";

const STATUS_STAGES: { key: RequestStatus; label: string }[] = [
  { key: "pending", label: "Request Placed" },
  { key: "searching", label: "Searching Station" },
  { key: "assigned", label: "Rider Assigned" },
  { key: "on_the_way", label: "Fuel En Route" },
  { key: "delivered", label: "Handover Complete" },
];

export default function Tracking() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<FuelRequest | null>(null);
  const [allRequests, setAllRequests] = useState<FuelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);

  // Poll for latest tracking updates every 3 seconds
  useEffect(() => {
    let mounted = true;

    async function syncTracking() {
      try {
        const req = await fuelDataService.getActiveRequest(user?.id);
        const list = await fuelDataService.getCustomerRequests(user?.id || "");
        if (mounted) {
          if (req) setActiveRequest(req);
          setAllRequests(list);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[Tracking] Sync error:", err);
        if (mounted) setLoading(false);
      }
    }

    syncTracking();
    const interval = setInterval(syncTracking, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  const getStageIndex = (status?: RequestStatus) => {
    if (!status) return 0;
    if (status === "pending") return 0;
    if (status === "searching") return 1;
    if (status === "assigned" || status === "accepted") return 2;
    if (status === "on_the_way" || status === "arrived") return 3;
    if (status === "delivered") return 4;
    return 0;
  };

  const currentStage = getStageIndex(activeRequest?.status);

  // 1-Click Instant Dispatch from Tracking page
  const handleInstantDispatch = async () => {
    setIsSpawning(true);
    try {
      const newReq = await fuelDataService.createRequest({
        userId: user?.id || "demo-driver-1",
        fuelType: "Petrol",
        quantityLiters: 5,
        latitude: 28.6139,
        longitude: 77.209,
        address: "NH-48 Corridor, Mile 14 Emergency Pullout",
      });
      setActiveRequest(newReq);
      setAllRequests((prev) => [newReq, ...prev]);
    } catch (e) {
      console.error("[Tracking] Spawn dispatch failed:", e);
    } finally {
      setIsSpawning(false);
    }
  };

  // Step-through simulation advancement
  const handleAdvanceSimulation = async () => {
    if (!activeRequest) return;
    setIsAdvancing(true);

    const nextStatusMap: Record<RequestStatus, RequestStatus> = {
      pending: "searching",
      searching: "assigned",
      assigned: "on_the_way",
      accepted: "on_the_way",
      on_the_way: "arrived",
      arrived: "delivered",
      delivered: "pending",
      cancelled: "pending",
    };

    const nextStatus = nextStatusMap[activeRequest.status] || "on_the_way";
    try {
      const updated = await fuelDataService.updateStatus(activeRequest.id, nextStatus, {
        lat: activeRequest.latitude + (Math.random() - 0.5) * 0.005,
        lng: activeRequest.longitude + (Math.random() - 0.5) * 0.005,
      });
      if (updated) {
        setActiveRequest(updated);
        setAllRequests((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
      }
    } catch (e) {
      console.error("[Tracking] Advance simulation failed:", e);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with quick status pill and simulation advance button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[11px] uppercase tracking-wider mb-2">
              <Radio size={12} className="animate-pulse" />
              Live Telemetry Tracker
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Emergency Fuel Tracking
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live GPS coordinates, assigned vehicle identification, and real-time delivery ETA
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeRequest && (
              <Button
                size="sm"
                onClick={handleAdvanceSimulation}
                disabled={isAdvancing}
                className="h-9 px-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
              >
                <FastForward size={14} />
                <span>{isAdvancing ? "Updating..." : "Next Milestone"}</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleInstantDispatch}
              disabled={isSpawning}
              className="h-9 px-3.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
            >
              <Zap size={14} />
              <span>{isSpawning ? "Creating..." : "New Emergency Request"}</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <RefreshCw size={24} className="mx-auto text-amber-500 animate-spin mb-3" />
            <p className="text-xs text-slate-400">Connecting to telemetry stream...</p>
          </div>
        ) : activeRequest ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Tracking Status & Details */}
              <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-bold block">
                      Order Reference #{activeRequest.id.slice(0, 8)}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {activeRequest.quantity_liters}L {activeRequest.fuel_type} Canister
                    </h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-sky-400" />
                      {activeRequest.address || "GPS Stranded Location"}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
                    {activeRequest.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Step Timeline */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                    Handover Milestones:
                  </span>
                  {STATUS_STAGES.map((stg, idx) => {
                    const isDone = idx < currentStage || activeRequest.status === "delivered";
                    const isCurrent = idx === currentStage && activeRequest.status !== "delivered";

                    return (
                      <div key={stg.key} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-amber-500 text-slate-950 animate-pulse"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {isDone ? <Check size={13} /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isDone
                              ? "text-slate-200"
                              : isCurrent
                              ? "text-amber-400 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {stg.label}
                        </span>
                        {isCurrent && (
                          <span className="ml-auto text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Partner Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 grid place-items-center">
                        <Truck size={20} />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {activeRequest.rider?.vehicle_number || "Arjun Verma (DL-04-FN-2048)"}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          Assigned Certified Fuel Partner
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                      onClick={() => alert("Calling partner: +91 98111 22334")}
                    >
                      <Phone size={13} className="mr-1" /> Call
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">
                        Distance
                      </span>
                      <strong className="text-slate-200">
                        {activeRequest.estimated_distance || 2.8} km
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">
                        Estimated Arrival
                      </span>
                      <strong className="text-amber-400">
                        {activeRequest.estimated_time || 11} mins
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Quick Request Switcher if user has multiple */}
                {allRequests.length > 1 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
                      Recent Fuel Orders:
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {allRequests.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setActiveRequest(r);
                            if (typeof window !== "undefined") {
                              window.localStorage.setItem("fuelnow_active_request_id", r.id);
                            }
                          }}
                          className={`w-full p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                            r.id === activeRequest.id
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className="font-mono text-[11px]">#{r.id.slice(0, 8)}</span>
                          <span>{r.quantity_liters}L {r.fuel_type}</span>
                          <span className="font-mono text-[10px] uppercase">{r.status}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Map View */}
              <div className="lg:col-span-7">
                <FuelNowMap
                  height="480px"
                  userLocation={{
                    lat: activeRequest.latitude || 28.6139,
                    lng: activeRequest.longitude || 77.209,
                  }}
                  assignedRider={activeRequest.rider}
                  tracking
                  requestStatus={activeRequest.status}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 rounded-2xl border border-slate-800 bg-slate-900/50 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 grid place-items-center">
              <Fuel size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Active Emergency Requests</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                You do not have any pending emergency fuel orders. Dispatch fuel immediately to track live on the map.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleInstantDispatch}
                disabled={isSpawning}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 h-10 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-950/50"
              >
                <Zap size={14} />
                <span>{isSpawning ? "Spawning..." : "Dispatch Emergency Fuel Now"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="border-slate-700 text-slate-300 hover:text-white text-xs px-4 h-10 rounded-lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
