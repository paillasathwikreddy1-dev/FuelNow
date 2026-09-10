import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bookmark, Briefcase, Home, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedPlace {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  type: "home" | "work" | "highway";
}

export default function SavedLocations() {
  const [places, setPlaces] = useState<SavedPlace[]>([
    {
      id: "1",
      label: "Home Garage",
      address: "Sector 14, Ring Road Residence",
      lat: 28.6139,
      lng: 77.209,
      type: "home",
    },
    {
      id: "2",
      label: "Office Tech Park",
      address: "NH-48 Expressway Tower B",
      lat: 28.5823,
      lng: 77.1645,
      type: "work",
    },
    {
      id: "3",
      label: "Frequent Highway Stretch",
      address: "Outer Bypass Toll Junction Mile 21",
      lat: 28.6582,
      lng: 77.2412,
      type: "highway",
    },
  ]);

  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newAddress) return;
    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      label: newLabel,
      address: newAddress,
      lat: 28.618,
      lng: 77.21,
      type: "highway",
    };
    setPlaces([...places, newPlace]);
    setNewLabel("");
    setNewAddress("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setPlaces(places.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-2">
              <Bookmark size={12} />
              Quick Dispatch Pins
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Saved Locations
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-saved coordinates for 1-click emergency refueling dispatch
            </p>
          </div>

          <Button
            onClick={() => setShowAdd(!showAdd)}
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
          >
            <Plus size={14} className="mr-1" /> Add Location
          </Button>
        </div>

        {showAdd && (
          <form
            onSubmit={handleAdd}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Save New Location Pin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g. Weekend Farmhouse)"
                required
                className="h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Address / Landmark description"
                required
                className="h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdd(false)}
                className="text-xs border-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs"
              >
                Save Pin
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {places.map((place) => (
            <div
              key={place.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 grid place-items-center">
                  {place.type === "home" ? (
                    <Home size={18} />
                  ) : place.type === "work" ? (
                    <Briefcase size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}
                </div>
                <div>
                  <strong className="text-sm text-slate-100 block">{place.label}</strong>
                  <span className="text-xs text-slate-400 block">{place.address}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    GPS: {place.lat}, {place.lng}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                >
                  Request Here
                </Button>
                <button
                  onClick={() => handleDelete(place.id)}
                  className="p-2 text-slate-500 hover:text-red-400"
                  aria-label="Delete location"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
