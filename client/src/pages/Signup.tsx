import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Fuel,
  Lock,
  Mail,
  Phone,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@shared/types";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await signup({
      email,
      password,
      fullName,
      phone,
      role,
    });
    setLoading(false);

    if (res.success) {
      if (role === "rider") setLocation("/rider");
      else if (role === "fuel_station") setLocation("/station");
      else setLocation("/dashboard");
    } else {
      setErrorMsg(res.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="fuel-app min-h-screen flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="fuel-logo justify-center text-xl inline-flex">
            <span>
              <Fuel size={22} />
            </span>
            FUEL<b>NOW</b>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-4">
            Join the Emergency Network
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create your account as a driver, certified rider, or fuel station partner
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === "customer"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <User size={18} className="mx-auto mb-1" />
                  <div className="text-xs">Driver</div>
                  <div className="text-[10px] text-slate-500 font-normal">Need Fuel</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("rider")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === "rider"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Truck size={18} className="mx-auto mb-1" />
                  <div className="text-xs">Rider</div>
                  <div className="text-[10px] text-slate-500 font-normal">Deliver Fuel</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("fuel_station")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === "fuel_station"
                      ? "border-sky-500 bg-sky-500/10 text-sky-400 font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Fuel size={18} className="mx-auto mb-1" />
                  <div className="text-xs">Station</div>
                  <div className="text-[10px] text-slate-500 font-normal">Fuel Depot</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 mt-4 transition-all shadow-lg shadow-amber-900/30"
            >
              {loading ? "Creating Account..." : `Sign up as ${role === "customer" ? "Driver" : role === "rider" ? "Delivery Rider" : "Station Partner"}`}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-500 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-400">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
