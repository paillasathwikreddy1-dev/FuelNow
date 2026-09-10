import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertTriangle,
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  Phone,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpSafety() {
  const faqs = [
    {
      q: "What should I do immediately after running out of fuel?",
      a: "Turn on your vehicle hazard warning lights immediately. If safe, steer vehicle to the hard shoulder or roadside edge away from active high-speed traffic lanes. Stay inside your vehicle with seatbelts fastened if stopped on an expressway.",
    },
    {
      q: "How does FuelNow verify the fuel type for my vehicle?",
      a: "When you place a request, you specify either Petrol or Diesel. Our certified delivery canister is color-coded and clearly labeled. Our partner confirms fuel type before dispensing to avoid accidental contamination.",
    },
    {
      q: "How long does partner matching take?",
      a: "Our algorithm matches and dispatches the nearest partner within 15 to 45 seconds of request creation. Average arrival time across metropolitan corridors is 14 to 19 minutes.",
    },
    {
      q: "What if my GPS permission is blocked?",
      a: "If browser GPS is denied or unavailable, tap directly on the FuelNow interactive map to place a manual pin at your stranded location, or specify landmark notes in the request form.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[11px] uppercase tracking-wider mb-2">
            <ShieldAlert size={12} />
            Emergency Protocol
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Roadside Safety & Support
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Critical safety measures to follow while awaiting your emergency fuel dispatch
          </p>
        </div>

        {/* 24/7 Emergency Hotline Banner */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-slate-900 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 grid place-items-center flex-shrink-0">
              <PhoneCall size={22} />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                24/7 Emergency Roadside SOS Dispatch Line
              </strong>
              <span className="text-xs text-amber-300 font-mono">
                Toll-Free: 1800-FUEL-NOW (1800-3835-669)
              </span>
            </div>
          </div>

          <Button
            onClick={() => alert("Connecting to FuelNow 24/7 Emergency Dispatch Center...")}
            className="h-10 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
          >
            Call Dispatch Center
          </Button>
        </div>

        {/* Safety Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 grid place-items-center font-mono font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Hazard Lights ON</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate double blinker hazard lights immediately so approaching vehicles detect
              your stationary car from a safe distance.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 grid place-items-center font-mono font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Position Off Roadway</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If momentum allows, guide vehicle onto the paved shoulder or breakdown lane, leaving
              wheels turned away from live traffic.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 grid place-items-center font-mono font-bold text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Share Live GPS</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your FuelNow emergency request and monitor the partner tracking map until
              the certified canister arrives.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle size={17} className="text-amber-500" />
            <span>Frequently Answered Questions</span>
          </h3>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <strong className="text-xs font-bold text-slate-200 block mb-1">
                  {faq.q}
                </strong>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
