import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Bookmark,
  Compass,
  FileText,
  Fuel,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Radio,
  Settings,
  Shield,
  Truck,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout, updateRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Request Fuel", href: "/request", icon: Fuel },
    { label: "Live Tracking", href: "/tracking", icon: Navigation },
    { label: "My Requests", href: "/my-requests", icon: History },
    { label: "Saved Locations", href: "/saved-locations", icon: Bookmark },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Help & Safety", href: "/help", icon: HelpCircle },
  ];

  return (
    <div className="fuel-app min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="fuel-header">
        <div className="container header-row">
          <Link href="/" className="fuel-logo">
            <span>
              <Fuel size={18} />
            </span>
            FUEL<b>NOW</b>
          </Link>

          {/* Quick Role View Switcher for Judges */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Active View:</span>
            <button
              onClick={() => updateRole("customer")}
              className={`px-2 py-0.5 rounded ${
                user?.role === "customer"
                  ? "bg-amber-500/20 text-amber-400 font-bold"
                  : "hover:text-slate-200"
              }`}
            >
              Customer
            </button>
            <span>•</span>
            <Link
              href="/rider"
              onClick={() => updateRole("rider")}
              className={`px-2 py-0.5 rounded ${
                user?.role === "rider" || location === "/rider"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold"
                  : "hover:text-slate-200"
              }`}
            >
              Rider
            </Link>
            <span>•</span>
            <Link
              href="/station"
              onClick={() => updateRole("fuel_station")}
              className={`px-2 py-0.5 rounded ${
                user?.role === "fuel_station" || location === "/station"
                  ? "bg-sky-500/20 text-sky-400 font-bold"
                  : "hover:text-slate-200"
              }`}
            >
              Station
            </Link>
            <span>•</span>
            <Link
              href="/admin"
              onClick={() => updateRole("admin")}
              className={`px-2 py-0.5 rounded ${
                user?.role === "admin" || location === "/admin"
                  ? "bg-purple-500/20 text-purple-400 font-bold"
                  : "hover:text-slate-200"
              }`}
            >
              Admin Ops
            </Link>
          </div>

          <div className="header-right">
            <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-white">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {user?.fullName || "Guest Driver"}
                </div>
                <div className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">
                  {user?.role || "Customer"}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="text-xs h-8 border-slate-700 bg-slate-900 text-slate-300 hover:text-white hidden sm:flex items-center gap-1"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </Button>

            <button
              className="menu-button p-1 md:hidden text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-6 py-4 flex flex-col gap-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Menu Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 font-bold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Switch Role View
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <Link
                  href="/dashboard"
                  onClick={() => {
                    updateRole("customer");
                    setMobileMenuOpen(false);
                  }}
                  className="py-1 text-center bg-slate-900 rounded text-slate-300"
                >
                  Driver
                </Link>
                <Link
                  href="/rider"
                  onClick={() => {
                    updateRole("rider");
                    setMobileMenuOpen(false);
                  }}
                  className="py-1 text-center bg-slate-900 rounded text-slate-300"
                >
                  Rider
                </Link>
                <Link
                  href="/station"
                  onClick={() => {
                    updateRole("fuel_station");
                    setMobileMenuOpen(false);
                  }}
                  className="py-1 text-center bg-slate-900 rounded text-slate-300"
                >
                  Station
                </Link>
                <Link
                  href="/admin"
                  onClick={() => {
                    updateRole("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="py-1 text-center bg-slate-900 rounded text-slate-300"
                >
                  Admin
                </Link>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="mt-2 text-xs border-slate-700 bg-slate-900 text-red-400"
            >
              Sign out
            </Button>
          </div>
        )}
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="dashboard-shell flex-1">
        {/* Desktop Left Sidebar */}
        <aside className="dashboard-sidebar hidden md:flex">
          <div className="text-[10px] font-mono uppercase text-slate-500 px-3 mb-2 tracking-wider">
            Emergency Mobility
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mt-auto pt-6 border-t border-slate-800/80 flex flex-col gap-2">
            <div className="text-[10px] font-mono uppercase text-slate-500 px-3 tracking-wider">
              Role Workspaces
            </div>
            <Link
              href="/rider"
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-900/50"
            >
              <Truck size={14} className="text-emerald-400" />
              <span>Rider Dashboard</span>
            </Link>
            <Link
              href="/station"
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 hover:text-sky-400 rounded-lg hover:bg-slate-900/50"
            >
              <Fuel size={14} className="text-sky-400" />
              <span>Station Depot</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-900/50"
            >
              <Shield size={14} className="text-purple-400" />
              <span>Admin Console</span>
            </Link>
          </div>
        </aside>

        {/* Dynamic Page Content */}
        <main className="dashboard-main flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
