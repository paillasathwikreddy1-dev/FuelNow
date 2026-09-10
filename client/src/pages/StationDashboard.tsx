import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fuelDataService } from "@/services/fuelDataService";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Edit3,
  Fuel,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  Truck,
  Users,
} from "lucide-react";
import type { FuelRequest, FuelStation, Rider, StationStatus } from "@shared/types";

export default function StationDashboard() {
  const [station, setStation] = useState<FuelStation | null>(null);
  const [stationsList, setStationsList] = useState<FuelStation[]>([]);
  const [petrolStock, setPetrolStock] = useState<number>(4200);
  const [dieselStock, setDieselStock] = useState<number>(5100);
  const [stationStatus, setStationStatus] = useState<StationStatus>("active");
  const [stationRequests, setStationRequests] = useState<FuelRequest[]>([]);
  const [stationRiders, setStationRiders] = useState<Rider[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    fuelDataService.getStations().then((stns) => {
      setStationsList(stns);
      if (stns.length > 0) {
        const current = stns[0];
        setStation(current);
        setPetrolStock(current.available_petrol);
        setDieselStock(current.available_diesel);
        setStationStatus(current.status);
      }
    });

    fuelDataService.getRiders().then(setStationRiders);
    fuelDataService.getAllRequests().then(setStationRequests);
  }, []);

  const handleSaveStock = async () => {
    if (!station) return;
    setIsSaving(true);
    await fuelDataService.updateStationStock(
      station.id,
      petrolStock,
      dieselStock,
      stationStatus
    );
    setIsSaving(false);
    setSaveNotice("Stock levels and availability updated in Supabase database.");
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleRestock = (fuelType: "petrol" | "diesel", amount: number) => {
    if (fuelType === "petrol") setPetrolStock((prev) => prev + amount);
    else setDieselStock((prev) => prev + amount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 grid place-items-center flex-shrink-0">
              <Fuel size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {station?.name || "Central Express Fuel Hub"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400 font-bold uppercase">
                  Station Depot #01
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin size={12} className="text-sky-400" />
                {station?.address || "Ring Road Sector 4, Connaught Hub"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={stationStatus}
              onChange={(e) => setStationStatus(e.target.value as StationStatus)}
              className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold uppercase"
            >
              <option value="active">● Station Active</option>
              <option value="inactive">○ Maintenance</option>
              <option value="closed">✕ Closed</option>
            </select>

            <Button
              onClick={handleSaveStock}
              disabled={isSaving}
              className="h-10 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving..." : "Save Stock"}</span>
            </Button>
          </div>
        </div>

        {saveNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Real-time Fuel Reserves Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Petrol Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-500 tracking-wider font-bold block">
                  Reserve Tank 01
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Petrol Inventory</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400">{petrolStock}L</span>
                <span className="text-[10px] text-slate-400 block">Current Capacity</span>
              </div>
            </div>

            {/* Visual Level Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (petrolStock / 5000) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Adjust Liters:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRestock("petrol", 500)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-amber-500 text-[11px]"
                >
                  +500L Refill
                </button>
                <button
                  type="button"
                  onClick={() => handleRestock("petrol", 1000)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-amber-500 text-[11px]"
                >
                  +1000L Refill
                </button>
              </div>
            </div>
          </div>

          {/* Diesel Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-500 tracking-wider font-bold block">
                  Reserve Tank 02
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Diesel Inventory</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-sky-400">{dieselStock}L</span>
                <span className="text-[10px] text-slate-400 block">Current Capacity</span>
              </div>
            </div>

            {/* Visual Level Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-sky-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dieselStock / 6000) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Adjust Liters:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRestock("diesel", 500)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-sky-500 text-[11px]"
                >
                  +500L Refill
                </button>
                <button
                  type="button"
                  onClick={() => handleRestock("diesel", 1000)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:border-sky-500 text-[11px]"
                >
                  +1000L Refill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Riders & Catchment Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assigned Riders */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck size={17} className="text-emerald-400" />
                <span>Assigned Fleet Riders</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {stationRiders.length} Registered
              </span>
            </div>

            <div className="space-y-3">
              {stationRiders.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">
                      {r.profile?.full_name || "Certified Partner"}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {r.vehicle_number}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      r.availability_status === "available"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {r.availability_status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Incoming Emergency Requests Queue */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fuel size={17} className="text-amber-500" />
                <span>Sector Emergency Requests</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {stationRequests.length} Total Logged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {stationRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        {req.quantity_liters}L {req.fuel_type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        · {req.address || "Highway Corridor"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      GPS: {req.latitude.toFixed(3)}, {req.longitude.toFixed(3)}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      req.status === "delivered"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
