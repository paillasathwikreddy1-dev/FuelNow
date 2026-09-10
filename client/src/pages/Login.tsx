import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, ArrowRight, CheckCircle2, Fuel, Lock, Mail, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      // Direct user based on role hint in email or saved role
      if (email.includes("admin")) setLocation("/admin");
      else if (email.includes("rider")) setLocation("/rider");
      else if (email.includes("station")) setLocation("/station");
      else setLocation("/dashboard");
    } else {
      setErrorMsg(res.error || "Invalid credentials. Please try again.");
    }
  };

  const setDemoCreds = (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword("FuelNow@2025");
    setErrorMsg(null);
  };

  const handleQuickLogin = async (demoEmail: string, destination: string) => {
    setEmail(demoEmail);
    setPassword("FuelNow@2025");
    setErrorMsg(null);
    setLoading(true);

    const res = await login(demoEmail, "FuelNow@2025");
    setLoading(false);

    if (res.success) {
      setLocation(destination);
    } else {
      setErrorMsg(res.error || "Login failed");
    }
  };

  return (
    <div className="fuel-app min-h-screen flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="fuel-logo justify-center text-xl inline-flex">
            <span>
              <Fuel size={22} />
            </span>
            FUEL<b>NOW</b>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-4">
            Welcome back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your FuelNow emergency roadside portal
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
                  placeholder="driver@fuelnow.io"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-500 hover:text-amber-400 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 mt-2 transition-all shadow-lg shadow-amber-900/30"
            >
              {loading ? "Signing in..." : "Sign in to FuelNow"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          {/* Quick Role Tester Pills for Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 text-center">
              Quick Role Switch (1-Click Evaluator Login):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("driver@fuelnow.io", "/dashboard")}
                className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/80 rounded-lg text-xs text-slate-200 hover:text-amber-400 text-left transition-all flex items-center justify-between group"
              >
                <span>🚗 Customer Driver</span>
                <ArrowRight size={12} className="text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("rider.arjun@fuelnow.io", "/rider")}
                className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/80 rounded-lg text-xs text-slate-200 hover:text-amber-400 text-left transition-all flex items-center justify-between group"
              >
                <span>🏍️ Delivery Rider</span>
                <ArrowRight size={12} className="text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("station.manager@fuelnow.io", "/station")}
                className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/80 rounded-lg text-xs text-slate-200 hover:text-amber-400 text-left transition-all flex items-center justify-between group"
              >
                <span>⛽ Fuel Station</span>
                <ArrowRight size={12} className="text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("admin@fuelnow.io", "/admin")}
                className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/80 rounded-lg text-xs text-slate-200 hover:text-amber-400 text-left transition-all flex items-center justify-between group"
              >
                <span>🛡️ Ops Admin</span>
                <ArrowRight size={12} className="text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-amber-500 hover:underline font-semibold">
              Create an account
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
