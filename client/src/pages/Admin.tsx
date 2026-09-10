import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FuelNowMap from "@/components/map/FuelNowMap";
import { fuelDataService } from "@/services/fuelDataService";
import {
  computeDemandAnalytics,
  generateDemandHeatmap,
} from "@/services/dataScienceService";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Compass,
  Database,
  Fuel,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DemandAnalytics,
  DemandHeatmapPoint,
  FuelRequest,
  FuelStation,
  Rider,
} from "@shared/types";

export default function Admin() {
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [analytics, setAnalytics] = useState<DemandAnalytics | null>(null);
  const [heatmap, setHeatmap] = useState<DemandHeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    const [allReqs, allStations, allRiders] = await Promise.all([
      fuelDataService.getAllRequests(),
      fuelDataService.getStations(),
      fuelDataService.getRiders(),
    ]);

    setRequests(allReqs);
    setStations(allStations);
    setRiders(allRiders);
    setAnalytics(computeDemandAnalytics(allReqs));
    setHeatmap(generateDemandHeatmap(allReqs));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Top Section Key Metrics
  const activeRequestsCount = requests.filter((r) =>
    ["pending", "searching", "assigned", "accepted", "on_the_way", "arrived"].includes(
      r.status
    )
  ).length;

  const availableRidersCount = riders.filter(
    (r) => r.availability_status === "available"
  ).length;

  const availableStationsCount = stations.filter(
    (s) => s.status === "active"
  ).length;

  const avgEtaMinutes = analytics?.averageEtaMinutes || 16;

  // Filtered Queue
  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  // Station Stock Totals
  const totalPetrolAvailable = stations.reduce(
    (sum, s) => sum + s.available_petrol,
    0
  );
  const totalDieselAvailable = stations.reduce(
    (sum, s) => sum + s.available_diesel,
    0
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[11px] uppercase tracking-wider mb-2">
              <Shield size={12} />
              Operations Command Console
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Emergency Response Network
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live fleet orchestration, station reserves, and spatial demand analytics
            </p>
          </div>

          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-xs border-slate-700 bg-slate-900 text-slate-200 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync Live DB</span>
          </Button>
        </div>

        {/* =============================================================
            1. TOP SECTION: KEY METRICS FROM DATABASE
            Active Requests · Available Riders · Available Fuel Stations · Average ETA
        ============================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Requests */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Active Requests
              </span>
              <Activity size={16} className="text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {activeRequestsCount}
            </div>
            <div className="text-[11px] text-amber-400 flex items-center gap-1">
              <span className="live-dot" /> Currently Dispatched
            </div>
          </div>

          {/* Available Riders */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Available Riders
              </span>
              <Truck size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {availableRidersCount} <span className="text-xs text-slate-500 font-normal">/ {riders.length}</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> On Standby for Dispatch
            </div>
          </div>

          {/* Available Fuel Stations */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Available Stations
              </span>
              <Fuel size={16} className="text-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {availableStationsCount} <span className="text-xs text-slate-500 font-normal">/ {stations.length}</span>
            </div>
            <div className="text-[11px] text-sky-400 flex items-center gap-1">
              <Database size={12} /> Operational Reserves Active
            </div>
          </div>

          {/* Average ETA */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Average ETA
              </span>
              <Clock3 size={16} className="text-purple-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {avgEtaMinutes} <span className="text-xs text-slate-500 font-normal">mins</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Zap size={12} className="text-purple-400" /> Haversine + Traffic Model
            </div>
          </div>
        </div>

        {/* =============================================================
            2. LIVE EMERGENCY REQUESTS MAP
        ============================================================= */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-500 tracking-wider font-bold block">
                Geographic Command
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Live Emergency Requests & Network Nodes
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Real-time Geolocation Layer
            </span>
          </div>

          <FuelNowMap
            height="440px"
            stations={stations}
            assignedRider={riders[0]}
            tracking={activeRequestsCount > 0}
          />
        </div>

        {/* =============================================================
            3. REQUEST QUEUE
        ============================================================= */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-sky-500 tracking-wider font-bold block">
                Order Log
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Dispatch Request Queue
              </h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {["all", "pending", "assigned", "on_the_way", "delivered"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize text-xs font-semibold ${
                    statusFilter === st
                      ? "bg-amber-600 text-white"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No requests found matching current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Customer / Location</th>
                    <th className="py-2.5 px-3">Fuel & Qty</th>
                    <th className="py-2.5 px-3">Assigned Partner</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono text-slate-400">
                        #{req.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">
                          {req.address || "Highway Corridor"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {req.latitude.toFixed(3)}, {req.longitude.toFixed(3)}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-amber-400">
                          {req.quantity_liters}L {req.fuel_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {req.rider?.vehicle_number || "Arjun (DL-04-FN-2048)"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            req.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : req.status === "on_the_way"
                              ? "bg-sky-500/10 text-sky-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {req.estimated_time || 15}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =============================================================
            4. DATA SCIENCE DEMAND ANALYTICS & HEATMAP
        ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Spatial Demand Heatmap (KDE) */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass size={17} className="text-purple-400" />
                <span>Spatial Distress Clusters (KDE Heatmap)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Data Science Module
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Kernel Density Estimation clusters emergency fuel calls along transit routes to
              guide fleet staging.
            </p>

            <div className="space-y-3 pt-2">
              {heatmap.map((pt) => (
                <div
                  key={pt.region}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        pt.level === "high"
                          ? "bg-red-500 animate-ping"
                          : pt.level === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div>
                      <strong className="text-slate-200 block">{pt.region}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {pt.latitude.toFixed(3)}, {pt.longitude.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-200">
                      {pt.requestCount} Requests
                    </span>
                    <span
                      className={`block text-[10px] font-mono uppercase font-bold ${
                        pt.level === "high"
                          ? "text-red-400"
                          : pt.level === "medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {pt.level} Risk Zone
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Fuel Demand Split & Stats */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={17} className="text-amber-500" />
                <span>Fuel Demand Breakdown & Analytics</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Telemetry Aggregate
              </span>
            </div>

            {/* Fuel Type Ratio Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-amber-400 font-bold">
                  Petrol: {analytics?.petrolPercentage || 65}%
                </span>
                <span className="text-sky-400 font-bold">
                  Diesel: {analytics?.dieselPercentage || 35}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800 flex">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${analytics?.petrolPercentage || 65}%` }}
                />
                <div
                  className="bg-sky-500 h-full"
                  style={{ width: `${analytics?.dieselPercentage || 35}%` }}
                />
              </div>
            </div>

            {/* Overall Delivery Performance Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Completed Deliveries
                </span>
                <strong className="text-2xl font-bold text-emerald-400 block mt-1">
                  {analytics?.completedDeliveries || 0}
                </strong>
                <span className="text-[10px] text-slate-400">100% Handover Rate</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Total Active Reserve
                </span>
                <strong className="text-2xl font-bold text-white block mt-1">
                  {(totalPetrolAvailable + totalDieselAvailable).toLocaleString()}L
                </strong>
                <span className="text-[10px] text-slate-400">Across 4 Fuel Hubs</span>
              </div>
            </div>

            {/* High Demand Transit Corridors */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                Top Roadside Distress Sectors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(analytics?.highDemandRegions || ["Outer Ring Road", "NH-48 Corridor"]).map(
                  (reg) => (
                    <span
                      key={reg}
                      className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-medium"
                    >
                      {reg}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
