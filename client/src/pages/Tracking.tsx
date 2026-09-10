import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FuelNowMap from "@/components/map/FuelNowMap";
import { fuelDataService } from "@/services/fuelDataService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Fuel,
  MapPin,
  Navigation,
  Phone,
  Radio,
  ShieldCheck,
  Truck,
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
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<FuelRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fuelDataService.getCustomerRequests(user.id).then((reqs) => {
      // Find latest active or latest completed request
      const active = reqs.find((r) =>
        ["pending", "searching", "assigned", "accepted", "on_the_way", "arrived"].includes(
          r.status
        )
      );
      setActiveRequest(active || reqs[0] || null);
      setLoading(false);
    });
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
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
        </div>

        {activeRequest ? (
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
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
                  {activeRequest.status}
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
                        {activeRequest.rider?.vehicle_number || "Arjun Sharma (DL-04-FN-2048)"}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        Assigned Certified Fuel Partner
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                    onClick={() => alert("Calling partner: +91 98222 33445")}
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
                      {activeRequest.estimated_distance || 3.2} km
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Estimated Arrival
                    </span>
                    <strong className="text-amber-400">
                      {activeRequest.estimated_time || 14} mins
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Map View */}
            <div className="lg:col-span-7">
              <FuelNowMap
                height="480px"
                userLocation={{
                  lat: activeRequest.latitude,
                  lng: activeRequest.longitude,
                }}
                assignedRider={activeRequest.rider}
                tracking
                requestStatus={activeRequest.status}
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60">
            <Fuel size={32} className="mx-auto mb-3 text-slate-500" />
            <h3 className="text-base font-bold text-white">No active requests</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              You do not have any pending emergency fuel orders. Dispatch fuel immediately from
              your dashboard.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              Request Fuel Now
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
