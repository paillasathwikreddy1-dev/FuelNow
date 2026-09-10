import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fuelDataService } from "@/services/fuelDataService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Clock,
  ExternalLink,
  Fuel,
  History,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FuelRequest } from "@shared/types";

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fuelDataService.getCustomerRequests(user.id).then((reqs) => {
      setRequests(reqs);
      setLoading(false);
    });
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-2">
            <History size={12} />
            Emergency History
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            My Fuel Requests
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log of all past and active emergency fuel deliveries
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60">
            <History size={32} className="mx-auto mb-3 text-slate-500" />
            <h3 className="text-base font-bold text-white">No request history</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Your previous roadside fuel assistance dispatches will appear here.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              Request Fuel Now
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">
                      {req.quantity_liters}L {req.fuel_type} Canister
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        req.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-sky-400" />
                      {req.address || "Highway Location"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(req.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Dispatched Partner
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {req.rider?.vehicle_number || "Certified Partner (DL-04-FN-2048)"}
                    </span>
                  </div>

                  <Button
                    onClick={() => (window.location.href = "/tracking")}
                    size="sm"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    View Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
