import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Fuel,
  Gauge,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Radio,
  RotateCcw,
  ShieldCheck,
  Truck,
  X,
  Zap,
} from "lucide-react";
import FuelNowMap from "@/components/map/FuelNowMap";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fuelDataService } from "@/services/fuelDataService";
import { predictETA } from "@/services/dataScienceService";
import { Button } from "@/components/ui/button";
import type {
  Coordinates,
  FuelRequest,
  FuelStation,
  FuelType,
  RequestStatus,
  Rider,
} from "@shared/types";

// Standard 5-step status system required for the visual progress tracker
const STATUS_STEPS: { key: RequestStatus; title: string; desc: string }[] = [
  { key: "pending", title: "Request Created", desc: "Dispatch ticket generated" },
  { key: "searching", title: "Searching Nearby", desc: "Evaluating stations & riders" },
  { key: "assigned", title: "Partner Assigned", desc: "Certified rider dispatched" },
  { key: "on_the_way", title: "Fuel On The Way", desc: "En route to GPS coordinate" },
  { key: "delivered", title: "Delivered", desc: "Safe canister handover complete" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Emergency Form State
  const [fuelType, setFuelType] = useState<FuelType>("Petrol");
  const [quantityLiters, setQuantityLiters] = useState<number>(5);
  const [customQty, setCustomQty] = useState<string>("");
  const [addressNote, setAddressNote] = useState<string>("");

  // Location State
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({
    lat: 28.6139,
    lng: 77.209,
  });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusText, setGpsStatusText] = useState<string>("Detect GPS Location");

  // Live Emergency Dispatch State
  const [activeRequest, setActiveRequest] = useState<FuelRequest | null>(null);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fuelDataService.getStations().then(setStations);
    fuelDataService.getRiders().then(setRiders);

    // Load any active requests for current user
    if (user?.id) {
      fuelDataService.getCustomerRequests(user.id).then((reqs) => {
        const inProgress = reqs.find((r) =>
          ["pending", "searching", "assigned", "accepted", "on_the_way", "arrived"].includes(
            r.status
          )
        );
        if (inProgress) setActiveRequest(inProgress);
      });
    }
  }, [user?.id]);

  // Real Browser GPS Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusText("GPS not supported in browser");
      return;
    }
    setIsDetectingGps(true);
    setGpsStatusText("Locking GPS satellite fix...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        };
        setCurrentCoords(coords);
        setIsDetectingGps(false);
        setGpsStatusText(`GPS Locked: ${coords.lat}, ${coords.lng}`);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsStatusText(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — click map to pin"
            : "Location unavailable — click map to pin"
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit Emergency Fuel Request
  const handleCreateRequest = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const effectiveQty = customQty ? parseFloat(customQty) : quantityLiters;
    if (isNaN(effectiveQty) || effectiveQty <= 0) {
      setErrorMessage("Please enter a valid fuel quantity (liters).");
      setIsSubmitting(false);
      return;
    }

    try {
      const created = await fuelDataService.createRequest({
        userId: user?.id || "demo-driver-1",
        fuelType,
        quantityLiters: effectiveQty,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        address: addressNote || "Near GPS Landmark",
      });

      setActiveRequest(created);
      setIsSubmitting(false);

      // Automated Demo Simulation Progression if not already advanced
      // (Transitions from assigned -> on_the_way -> arrived -> delivered)
      if (created.status === "assigned" || created.status === "searching") {
        setTimeout(async () => {
          const updated = await fuelDataService.updateStatus(created.id, "on_the_way", {
            lat: currentCoords.lat + 0.005,
            lng: currentCoords.lng - 0.006,
          });
          if (updated) setActiveRequest(updated);
        }, 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch emergency request.");
      setIsSubmitting(false);
    }
  };

  // Determine current step index for the visual progress tracker
  const getActiveStepIndex = (status?: RequestStatus) => {
    if (!status) return -1;
    if (status === "pending") return 0;
    if (status === "searching") return 1;
    if (status === "assigned" || status === "accepted") return 2;
    if (status === "on_the_way" || status === "arrived") return 3;
    if (status === "delivered") return 4;
    return 0;
  };

  const currentStepIdx = getActiveStepIndex(activeRequest?.status);

  // Calculate ETA for display
  const etaCalc = predictETA({
    distanceKm: activeRequest?.estimated_distance || 3.4,
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* =============================================================
            TOP SECTION (ABOVE THE FOLD): WELCOME / LOCATION & PRIMARY ACTION
        ============================================================= */}
        <div className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-2">
                <Zap size={13} className="text-amber-400 animate-pulse" />
                Emergency Roadside Dispatch Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Need fuel right now?
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Pin your vehicle coordinates, pick your fuel type, and dispatch nearest certified partner.
              </p>
            </div>

            {/* Detect My Location Action */}
            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
              <Button
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="h-11 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-950/50"
              >
                <LocateFixed size={16} className={isDetectingGps ? "animate-spin" : ""} />
                <span>{isDetectingGps ? "Acquiring Fix..." : "Detect My Location"}</span>
              </Button>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <MapPin size={12} className="text-sky-400" />
                <span>{gpsStatusText}</span>
              </div>
            </div>
          </div>

          {/* =============================================================
              MAIN EMERGENCY REQUEST CARD
          ============================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            {/* Form Controls Column */}
            <div className="lg:col-span-5 space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Fuel Type Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Select Fuel Type
                </label>
                <div className="choice-grid">
                  <button
                    type="button"
                    onClick={() => setFuelType("Petrol")}
                    className={fuelType === "Petrol" ? "selected" : ""}
                  >
                    <Fuel size={16} />
                    <span>Petrol</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType("Diesel")}
                    className={fuelType === "Diesel" ? "selected" : ""}
                  >
                    <Fuel size={16} />
                    <span>Diesel</span>
                  </button>
                </div>
              </div>

              {/* Quantity Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Emergency Canister Quantity
                </label>
                <div className="choice-grid quantities">
                  {[2, 5, 10].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => {
                        setQuantityLiters(qty);
                        setCustomQty("");
                      }}
                      className={quantityLiters === qty && !customQty ? "selected" : ""}
                    >
                      {qty} Liters
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomQty("15")}
                    className={customQty ? "selected" : ""}
                  >
                    Custom
                  </button>
                </div>
                {customQty !== "" && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={customQty}
                      onChange={(e) => setCustomQty(e.target.value)}
                      placeholder="Liters (max 25)"
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                    />
                    <span className="text-xs text-slate-400">Liters</span>
                  </div>
                )}
              </div>

              {/* Location Note / Landmark */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Stranded Location / Landmark Note
                </label>
                <input
                  type="text"
                  value={addressNote}
                  onChange={(e) => setAddressNote(e.target.value)}
                  placeholder="e.g. Highway Exit 14, blue Hyundai i20"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Summary Stats */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Estimated Transit
                  </span>
                  <strong className="text-white text-sm font-bold">
                    {etaCalc.estimatedMinutes} Mins · {etaCalc.distanceKm} km
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Canister Total
                  </span>
                  <strong className="text-amber-400 text-sm font-bold">
                    {customQty || quantityLiters}L {fuelType}
                  </strong>
                </div>
              </div>

              {/* PRIMARY BUTTON: Dominant Action */}
              <Button
                onClick={handleCreateRequest}
                disabled={isSubmitting}
                className="w-full h-13 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition-all cursor-pointer"
              >
                <Fuel size={18} />
                <span>
                  {isSubmitting
                    ? "Dispatching Certified Partner..."
                    : "Request Emergency Fuel"}
                </span>
                {!isSubmitting && <ArrowRight size={17} />}
              </Button>
            </div>

            {/* Map Column */}
            <div className="lg:col-span-7 flex flex-col">
              <FuelNowMap
                height="380px"
                userLocation={currentCoords}
                onLocationSelect={(coords) => setCurrentCoords(coords)}
                stations={stations}
                assignedRider={activeRequest?.rider || riders[0]}
                tracking={Boolean(activeRequest)}
                requestStatus={activeRequest?.status}
              />
            </div>
          </div>
        </div>

        {/* =============================================================
            STATUS PROGRESSION SECTION
            Request created -> Searching nearby fuel partners -> Partner assigned -> Fuel on the way -> Delivered
        ============================================================= */}
        {activeRequest && (
          <div className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-xs font-mono uppercase text-amber-400 tracking-wider font-bold">
                    Active Emergency Request #{activeRequest.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeRequest.status === "delivered"
                    ? "Fuel Handover Completed"
                    : "Emergency Dispatch in Progress"}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveRequest(null)}
                  className="text-xs border-slate-700 bg-slate-950 text-slate-300"
                >
                  <X size={14} className="mr-1" /> Clear View
                </Button>
              </div>
            </div>

            {/* 5-Step Animated Progress Tracker */}
            <div className="status-tracker">
              {STATUS_STEPS.map((step, idx) => {
                const isComplete = idx < currentStepIdx || activeRequest.status === "delivered";
                const isActive = idx === currentStepIdx && activeRequest.status !== "delivered";

                return (
                  <div
                    key={step.key}
                    className={`status-step ${isComplete ? "complete" : ""} ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <div className="status-step-bar" />
                    <div className="flex items-center gap-1.5 mt-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isComplete
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "bg-amber-500 text-slate-950 animate-pulse"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isComplete ? <Check size={11} /> : idx + 1}
                      </div>
                    </div>
                    <span className="status-step-title">{step.title}</span>
                    <span className="text-[9px] text-slate-400 hidden sm:block">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live Dispatch Detail Card */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Assigned Partner
                </span>
                <strong className="text-slate-100 text-sm block mt-0.5">
                  {activeRequest.rider?.vehicle_number || "DL-04-FN-2048 (Arjun)"}
                </strong>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <ShieldCheck size={12} /> Certified Canister Rider
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Origin Hub
                </span>
                <strong className="text-slate-100 text-sm block mt-0.5">
                  {activeRequest.station?.name || "Central Express Depot"}
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {activeRequest.estimated_distance || 3.2} km away
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Estimated Arrival
                </span>
                <strong className="text-amber-400 text-sm block mt-0.5">
                  {activeRequest.estimated_time || 14} Minutes
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Predictive Traffic Sync
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Rider Contact
                  </span>
                  <strong className="text-slate-200 text-xs mt-0.5 block">
                    +91 98222 33445
                  </strong>
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 mt-2"
                  onClick={() => alert("Calling delivery partner Arjun (+91 98222 33445)...")}
                >
                  <Phone size={12} /> Call Partner
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Guidelines Card */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 grid place-items-center flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong className="text-slate-200 text-sm block">Stranded Roadside Safety</strong>
              <span>
                Turn on hazard warning lights, stay inside your vehicle if on high-speed expressway,
                and await partner arrival.
              </span>
            </div>
          </div>
          <Link href="/help">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-slate-700 bg-slate-900 text-slate-300"
            >
              Emergency Hotline & Tips
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
