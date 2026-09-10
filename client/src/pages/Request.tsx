import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import FuelNowMap from "@/components/map/FuelNowMap";
import { useAuth } from "@/contexts/AuthContext";
import { fuelDataService } from "@/services/fuelDataService";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Fuel,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Coordinates, FuelRequest, FuelStation, FuelType, Rider } from "@shared/types";

export default function Request() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [fuelType, setFuelType] = useState<FuelType>("Petrol");
  const [quantityLiters, setQuantityLiters] = useState<number>(5);
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({
    lat: 28.6139,
    lng: 77.209,
  });
  const [address, setAddress] = useState<string>("");
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fuelDataService.getStations().then(setStations);
    fuelDataService.getRiders().then(setRiders);
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fuelDataService.createRequest({
        userId: user?.id || "demo-driver-1",
        fuelType,
        quantityLiters,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        address: address || "Pinned GPS Location",
      });
      setLocation("/dashboard");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Form */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-500 tracking-wider font-bold block">
                Emergency Roadside Service
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Dispatch Emergency Fuel
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter canister requirements and confirm stranded location.
              </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Fuel Type
                </label>
                <div className="choice-grid">
                  <button
                    type="button"
                    onClick={() => setFuelType("Petrol")}
                    className={fuelType === "Petrol" ? "selected" : ""}
                  >
                    <Fuel size={15} /> Petrol
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType("Diesel")}
                    className={fuelType === "Diesel" ? "selected" : ""}
                  >
                    <Fuel size={15} /> Diesel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Canister Size
                </label>
                <div className="choice-grid quantities">
                  {[2, 5, 10].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantityLiters(qty)}
                      className={quantityLiters === qty ? "selected" : ""}
                    >
                      {qty}L
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Landmark / Vehicle Note
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. NH-48 Expressway KM 14, Silver WagonR"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Target Coordinates:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Dispatching..." : "Confirm & Launch Dispatch"}</span>
                <ArrowRight size={15} />
              </Button>
            </form>
          </div>

          {/* Interactive Map Column */}
          <div className="lg:col-span-7">
            <FuelNowMap
              height="440px"
              userLocation={currentCoords}
              onLocationSelect={(c) => setCurrentCoords(c)}
              stations={stations}
              assignedRider={riders[0]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
