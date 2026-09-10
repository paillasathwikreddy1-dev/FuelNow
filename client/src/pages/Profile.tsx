import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Mail, Phone, Save, Shield, User } from "lucide-react";

export default function Profile() {
  const { user, profile, updateRole } = useAuth();

  const [name, setName] = useState(user?.fullName || "Rajesh Kumar");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [vehicle, setVehicle] = useState("Hyundai Creta · DL-09-CA-4421");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-2">
            <User size={12} />
            Account Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            User Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal contact info and registered vehicle identity
          </p>
        </div>

        {savedNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Profile information saved successfully.</span>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || "driver@fuelnow.io"}
                className="w-full h-11 px-4 bg-slate-950/50 border border-slate-800 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Phone Number (Emergency Contact)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Registered Vehicle (Make, Model, License Plate)
            </label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="e.g. Maruti Swift Dzire · DL-03-AB-1234"
              className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Platform Role
            </label>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase font-bold">
                {user?.role || "Customer"}
              </span>
              <span className="text-[11px] text-slate-500">
                Contact ops admin to modify regulatory access level.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-10 px-5 flex items-center gap-2"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
