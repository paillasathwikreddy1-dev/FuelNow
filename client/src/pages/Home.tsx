import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Compass,
  Fuel,
  Gauge,
  HelpCircle,
  Lock,
  MapPin,
  Menu,
  Navigation,
  Phone,
  Radio,
  Route,
  ShieldCheck,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import FuelNowMap from "@/components/map/FuelNowMap";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartRequest = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="fuel-app">
      {/* -------------------------------------------------------------
          NAVBAR
      ------------------------------------------------------------- */}
      <header className="fuel-header">
        <div className="container header-row">
          <Link href="/" className="fuel-logo">
            <span>
              <Fuel size={18} />
            </span>
            FUEL<b>NOW</b>
          </Link>

          <nav>
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#safety">Safety</a>
            <a href="#about">About</a>
            <Link href="/dashboard">Dashboard</Link>
            {user?.role === "admin" && <Link href="/admin">Admin Console</Link>}
            {user?.role === "rider" && <Link href="/rider">Rider Hub</Link>}
            {user?.role === "fuel_station" && <Link href="/station">Station Hub</Link>}
          </nav>

          <div className="header-right">
            <span className="availability">
              <span className="live-dot" /> 24/7 Response Active
            </span>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-slate-300 hover:text-white"
                >
                  {user.fullName} ({user.role})
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs h-8 border-slate-700 bg-slate-900 text-slate-300"
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-slate-300 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Button
                  className="header-cta"
                  onClick={handleStartRequest}
                >
                  Get Emergency Fuel
                </Button>
              </div>
            )}

            <button
              className="menu-button p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-6 py-4 flex flex-col gap-3">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 py-1"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 py-1"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 py-1"
            >
              Features
            </a>
            <a
              href="#safety"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 py-1"
            >
              Safety
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 py-1"
            >
              About
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-amber-500 py-1"
            >
              Go to Dashboard
            </Link>
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Button
                className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs h-9 font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleStartRequest();
                }}
              >
                Request Fuel Now
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------------------------------------
          HERO SECTION
      ------------------------------------------------------------- */}
      <section className="fuel-hero" id="home">
        <div className="container hero-layout">
          <div className="hero-text">
            <div className="fuel-kicker">
              <span>01</span> Emergency Roadside Fuel Network
            </div>
            <h1>
              Out of Fuel?<br />
              <em>We’ll Bring It To You.</em>
            </h1>
            <p>
              FuelNow connects stranded drivers with nearby registered fuel partners
              for fast, secure emergency fuel assistance directly to your live coordinates.
            </p>

            <div className="hero-buttons">
              <Button
                className="confirm-button hero-cta"
                onClick={handleStartRequest}
              >
                Request Emergency Fuel <ArrowRight size={17} />
              </Button>
              <a href="#how-it-works" className="quiet-link">
                How It Works <ChevronRight size={16} />
              </a>
            </div>

            {/* Small Trust Section */}
            <div className="hero-trust">
              <div className="hero-trust-item">
                <MapPin size={16} />
                <span>Location-based matching</span>
              </div>
              <div className="hero-trust-item">
                <ShieldCheck size={16} />
                <span>Registered fuel partners</span>
              </div>
              <div className="hero-trust-item">
                <Navigation size={16} />
                <span>Live delivery tracking</span>
              </div>
              <div className="hero-trust-item">
                <Lock size={16} />
                <span>Secure authentication</span>
              </div>
            </div>
          </div>

          {/* Hero Visual: Map & Status Preview */}
          <div className="hero-map-wrapper">
            <FuelNowMap
              height="480px"
              tracking
              requestStatus="Partner en route (Arjun)"
              stations={[
                {
                  id: "1",
                  name: "Central Fuel Hub",
                  address: "Ring Road Sector 4",
                  latitude: 28.6315,
                  longitude: 77.2167,
                  status: "active",
                  available_petrol: 4200,
                  available_diesel: 5100,
                },
              ]}
              assignedRider={{
                id: "r1",
                vehicle_number: "DL-04-FN-2048",
                availability_status: "available",
                current_latitude: 28.625,
                current_longitude: 77.212,
              }}
            />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          PROOF STRIP
      ------------------------------------------------------------- */}
      <section className="proof-strip">
        <div className="container">
          <span>
            <Gauge size={17} /> Bounded Emergency Quantities (1L - 10L)
          </span>
          <span>
            <Radio size={17} /> Real Browser GPS Pinpoint Precision
          </span>
          <span>
            <Clock3 size={17} /> Predictive Multi-Factor ETA
          </span>
          <span>
            <ShieldCheck size={17} /> Petroleum Safety Regulatory Compliant
          </span>
        </div>
      </section>

      {/* -------------------------------------------------------------
          HOW IT WORKS SECTION
      ------------------------------------------------------------- */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-title text-center max-w-2xl mx-auto">
            <div className="fuel-kicker">
              <span>02</span> Simple 3-Step Process
            </div>
            <h2>
              Request fuel.<br />
              <em>Track delivery. Get moving.</em>
            </h2>
            <p className="mx-auto">
              Stranded on a highway or in unfamiliar traffic? FuelNow simplifies the emergency
              response into three transparent steps.
            </p>
          </div>

          <div className="steps-grid mt-12">
            <div className="step-box">
              <span>STEP 01</span>
              <h3>Request in 10 Seconds</h3>
              <p>
                Select Petrol or Diesel, choose your emergency canister quantity (1L to 10L),
                and let browser GPS lock your stranded location with one tap.
              </p>
            </div>

            <div className="step-box">
              <span>STEP 02</span>
              <h3>Intelligent Partner Matching</h3>
              <p>
                Our data science matching algorithm ranks nearby certified stations and
                dispatches the closest available rider equipped with certified fuel canisters.
              </p>
            </div>

            <div className="step-box">
              <span>STEP 03</span>
              <h3>Track & Refuel</h3>
              <p>
                Follow the delivery partner on a live interactive map with real-time ETA,
                receive your fuel, and resume your journey with total peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          FEATURES SECTION
      ------------------------------------------------------------- */}
      <section className="request-section bg-slate-950/40" id="features">
        <div className="container">
          <div className="section-title">
            <div className="fuel-kicker">
              <span>03</span> Data-Driven Platform
            </div>
            <h2>
              Engineered for speed<br />
              <em>when seconds count.</em>
            </h2>
            <p>
              FuelNow is not just another delivery app. It is a specialized emergency mobility
              infrastructure platform with mathematical routing and demand forecasting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 grid place-items-center mb-4">
                <Clock3 size={20} />
              </div>
              <h4 className="text-base font-bold mb-2">Predictive ETA Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates real transit times based on distance curves, peak hour traffic multipliers,
                and station prep latencies.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 grid place-items-center mb-4">
                <Navigation size={20} />
              </div>
              <h4 className="text-base font-bold mb-2">Nearest Partner Matching</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-criteria scoring evaluates fuel availability, station proximity, and rider readiness
                to minimize driver wait time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 grid place-items-center mb-4">
                <Compass size={20} />
              </div>
              <h4 className="text-base font-bold mb-2">Spatial Demand Heatmap</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kernel Density Estimation clusters historical roadside distress signals to pre-position
                fuel reserves along high-risk highway corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          SAFETY SECTION
      ------------------------------------------------------------- */}
      <section className="safety-section" id="safety">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="fuel-kicker">
                <span>04</span> Safety First
              </div>
              <h2>
                Safety by design<br />
                <em>built for stressful moments.</em>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mt-4">
                Running out of fuel on a busy expressway or at 2:00 AM in an unfamiliar area
                is overwhelming. FuelNow keeps the workflow bounded and secure:
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 grid place-items-center flex-shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong className="text-sm block text-slate-200">
                      PESO-Compliant Sealed Canisters
                    </strong>
                    <p className="text-xs text-slate-400 mt-1">
                      Deliveries are strictly transported in anti-static, vapor-locked, certified fuel
                      canisters.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 grid place-items-center flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong className="text-sm block text-slate-200">
                      Confirmed Hazard-Free Handover
                    </strong>
                    <p className="text-xs text-slate-400 mt-1">
                      Drivers receive roadside safety hazard placement tips while waiting for dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 grid place-items-center flex-shrink-0">
                    <Lock size={18} />
                  </div>
                  <div>
                    <strong className="text-sm block text-slate-200">
                      Verified Rider & Station Identities
                    </strong>
                    <p className="text-xs text-slate-400 mt-1">
                      Every partner is registered with vehicle registration number, active phone, and
                      fuel station affiliation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80">
              <span className="text-xs font-mono uppercase text-amber-500 tracking-wider">
                Emergency Dispatch Protocol
              </span>
              <h3 className="text-2xl font-bold text-slate-100 mt-2 mb-4">
                Ready to get moving again?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Skip walking miles to a gas station with an unsafe bottle. Launch the emergency request
                flow now.
              </p>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 text-sm flex items-center justify-center gap-2"
                onClick={handleStartRequest}
              >
                Request Emergency Fuel Now <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          ABOUT SECTION
      ------------------------------------------------------------- */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="fuel-kicker">
                <span>05</span> Mission & Problem
              </div>
              <h2>
                Running out of fuel<br />
                <em>shouldn’t mean your journey ends.</em>
              </h2>
            </div>
            <div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Whether caused by unexpected traffic jams, broken fuel gauges, missed highway exits, or
                late-night station closures, thousands of drivers find themselves stranded every day.
                FuelNow solves the last-mile emergency fuel distribution bottleneck through real-time
                matching and algorithmic routing.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  "Expressways",
                  "Late Night Stranded",
                  "Remote Roads",
                  "Heavy Traffic",
                  "Broken Fuel Gauges",
                  "Unfamiliar Routes",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-[11px] text-slate-300 font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          FOOTER
      ------------------------------------------------------------- */}
      <footer className="py-12 border-t border-slate-800/80 bg-slate-950">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="fuel-logo text-sm">
              <span>
                <Fuel size={14} />
              </span>
              FUEL<b>NOW</b>
            </Link>
            <span className="text-slate-600">|</span>
            <span>Emergency Fuel Delivery & Assistance Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-400">
            <Link href="/dashboard" className="hover:text-amber-500">
              Customer Dashboard
            </Link>
            <Link href="/rider" className="hover:text-amber-500">
              Rider Hub
            </Link>
            <Link href="/station" className="hover:text-amber-500">
              Station Hub
            </Link>
            <Link href="/admin" className="hover:text-amber-500">
              Admin Console
            </Link>
          </div>

          <div>© {new Date().getFullYear()} FuelNow Platform. Built for Emergency Mobility.</div>
        </div>
      </footer>
    </div>
  );
}
