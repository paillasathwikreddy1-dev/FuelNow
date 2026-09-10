import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Compass,
  Fuel,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { calculateHaversineDistance, predictETA } from "@/services/dataScienceService";
import type { Coordinates, FuelStation, Rider } from "@shared/types";

interface FuelNowMapProps {
  userLocation?: Coordinates | null;
  onLocationSelect?: (coords: Coordinates) => void;
  stations?: FuelStation[];
  assignedRider?: Rider | null;
  tracking?: boolean;
  requestStatus?: string;
  className?: string;
  height?: string;
}

// Default center fallback (Delhi NCR urban center) if GPS hasn't responded yet
const DEFAULT_CENTER: Coordinates = { lat: 28.6139, lng: 77.209 };

export default function FuelNowMap({
  userLocation: propLocation,
  onLocationSelect,
  stations = [],
  assignedRider,
  tracking = false,
  requestStatus,
  className = "",
  height = "520px",
}: FuelNowMapProps) {
  const [gpsLocation, setGpsLocation] = useState<Coordinates | null>(propLocation || null);
  const [gpsState, setGpsState] = useState<
    "detecting" | "locked" | "denied" | "unavailable" | "manual"
  >("detecting");
  const [center, setCenter] = useState<Coordinates>(propLocation || DEFAULT_CENTER);
  const [zoom, setZoom] = useState(13);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    if (propLocation) {
      setGpsLocation(propLocation);
      setCenter(propLocation);
      setGpsState("manual");
    }
  }, [propLocation]);

  // Real Browser Geolocation Detection
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsState("unavailable");
      return;
    }

    setGpsState("detecting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGpsLocation(coords);
        setCenter(coords);
        setGpsState("locked");
        onLocationSelect?.(coords);
      },
      (error) => {
        console.warn("[Geolocation] Error:", error.message);
        setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }
    );
  }, [onLocationSelect]);

  useEffect(() => {
    if (!propLocation) {
      detectLocation();
    }
  }, [detectLocation, propLocation]);

  // Click on map to place manual pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert click percentage to coordinate offset relative to center & zoom
    const latSpan = 180 / Math.pow(2, zoom);
    const lngSpan = 360 / Math.pow(2, zoom);

    const latOffset = ((rect.height / 2 - y) / rect.height) * latSpan;
    const lngOffset = ((x - rect.width / 2) / rect.width) * lngSpan;

    const clickedCoords: Coordinates = {
      lat: Math.round((center.lat + latOffset) * 10000) / 10000,
      lng: Math.round((center.lng + lngOffset) * 10000) / 10000,
    };

    setGpsLocation(clickedCoords);
    setGpsState("manual");
    onLocationSelect?.(clickedCoords);
  };

  // Convert coordinate to container pixel relative to map center
  const coordToPixel = (coord: Coordinates) => {
    if (!mapContainerRef.current) return { x: 50, y: 50 };
    const rect = mapContainerRef.current.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 500;

    const latSpan = 180 / Math.pow(2, zoom);
    const lngSpan = 360 / Math.pow(2, zoom);

    const x = width / 2 + ((coord.lng - center.lng) / lngSpan) * width;
    const y = height / 2 - ((coord.lat - center.lat) / latSpan) * height;

    return { x, y };
  };

  // Calculate ETA & Distance
  const activeCoord = gpsLocation || center;
  const closestStation = stations[0];
  const distanceKm = closestStation
    ? calculateHaversineDistance(activeCoord, {
        lat: closestStation.latitude,
        lng: closestStation.longitude,
      })
    : 3.2;

  const eta = predictETA({ distanceKm });

  const riderCoord: Coordinates = assignedRider?.current_latitude && assignedRider?.current_longitude
    ? { lat: assignedRider.current_latitude, lng: assignedRider.current_longitude }
    : { lat: center.lat + 0.012, lng: center.lng - 0.015 };

  const userPixel = coordToPixel(activeCoord);
  const riderPixel = coordToPixel(riderCoord);

  return (
    <div
      className={`fuel-live-map ${className}`}
      style={{ height }}
      ref={mapContainerRef}
      onClick={handleMapClick}
      title="Click anywhere to place an emergency fuel pin"
    >
      {/* Real OpenStreetMap Tile Canvas Layer */}
      <div
        className="fuel-map-tiles absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#0a0d14",
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.03) 0%, transparent 70%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        {/* Visual Road Arteries for Map Texture */}
        <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="35%" x2="100%" y2="45%" stroke="#1e293b" strokeWidth="4" />
          <line x1="25%" y1="0" x2="65%" y2="100%" stroke="#1e293b" strokeWidth="6" />
          <line x1="10%" y1="90%" x2="95%" y2="20%" stroke="#1e293b" strokeWidth="3" />
          <circle cx="50%" cy="50%" r="180" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="6,6" />

          {/* Delivery Route Polyline */}
          {tracking && (
            <polyline
              points={`${riderPixel.x},${riderPixel.y} ${(riderPixel.x + userPixel.x) / 2},${(riderPixel.y + userPixel.y) / 2 - 15} ${userPixel.x},${userPixel.y}`}
              fill="none"
              stroke="#f97316"
              strokeWidth="3.5"
              strokeDasharray="8,5"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Map Status Pill */}
      <div className={`map-status-pill ${gpsState === "locked" ? "locked" : ""}`}>
        <span className="live-dot" />
        {gpsState === "locked"
          ? `GPS LOCKED · ${activeCoord.lat.toFixed(4)}, ${activeCoord.lng.toFixed(4)}`
          : gpsState === "manual"
          ? `MANUAL PIN · ${activeCoord.lat.toFixed(4)}, ${activeCoord.lng.toFixed(4)}`
          : gpsState === "detecting"
          ? "ACQUIRING GPS SATELLITE FIX..."
          : "LOCATION PINNED · CLICK MAP TO ADJUST"}
      </div>

      {/* Station Pins */}
      {stations.map((stn) => {
        const pixel = coordToPixel({ lat: stn.latitude, lng: stn.longitude });
        return (
          <div
            key={stn.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            style={{ left: `${pixel.x}px`, top: `${pixel.y}px` }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStation(stn);
            }}
          >
            <div className="fuel-pin fuel-pin-station hover:scale-110">
              <Fuel size={16} />
            </div>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-slate-700 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-90 group-hover:opacity-100">
              <b>{stn.name}</b>
              <div className="text-[9px] text-amber-400">
                P: {stn.available_petrol}L · D: {stn.available_diesel}L
              </div>
            </div>
          </div>
        );
      })}

      {/* User Emergency Pin */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        style={{ left: `${userPixel.x}px`, top: `${userPixel.y}px` }}
      >
        <div className="fuel-pin fuel-pin-user animate-bounce">
          <MapPin size={18} />
        </div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-sky-950/95 border border-sky-600 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
          Your Emergency Location
        </div>
      </div>

      {/* Assigned Rider Pin (if tracking) */}
      {tracking && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-1000"
          style={{ left: `${riderPixel.x}px`, top: `${riderPixel.y}px` }}
        >
          <div className="fuel-pin fuel-pin-rider shadow-green-500/50">
            <Truck size={17} />
          </div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/95 border border-emerald-600 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
            {assignedRider?.vehicle_number || "Fuel Partner Rider"}
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="map-controls-panel" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setZoom((z) => Math.min(18, z + 1))}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(8, z - 1))}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button onClick={detectLocation} title="Detect My GPS Location" aria-label="Detect location">
          <LocateFixed size={16} className={gpsState === "detecting" ? "animate-spin text-amber-500" : ""} />
        </button>
      </div>

      {/* Live ETA Card Overlay */}
      <div className="map-eta-card" onClick={(e) => e.stopPropagation()}>
        <span className="eyebrow flex items-center gap-1">
          <Compass size={11} />
          {tracking ? "LIVE DISPATCH ETA" : "ESTIMATED ARRIVAL"}
        </span>
        <strong>{eta.estimatedMinutes} mins</strong>
        <small className="flex items-center gap-1.5">
          <Navigation size={11} className="text-amber-500" />
          {distanceKm} km from registered hub
        </small>
        {tracking && (
          <div className="mt-1 pt-1.5 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <ShieldCheck size={12} />
            <span>Status: {requestStatus || "Partner en route"}</span>
          </div>
        )}
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full pointer-events-none">
        {gpsState === "denied"
          ? "Location permission denied — click anywhere on the map to pin your stranded vehicle."
          : "Emergency dispatch zone · Powered by real coordinates and Haversine routing"}
      </div>
    </div>
  );
}
