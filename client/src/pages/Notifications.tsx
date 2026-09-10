import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fuelDataService } from "@/services/fuelDataService";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, CheckCheck, Fuel, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@shared/types";

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fuelDataService.getNotifications(user.id).then((items) => {
      if (items.length > 0) {
        setNotifs(items);
      } else {
        // Seed default notification if empty
        setNotifs([
          {
            id: "1",
            user_id: user.id,
            title: "Emergency Roadside Support Ready",
            message: "FuelNow 24/7 network is active across highway corridors.",
            read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            user_id: user.id,
            title: "Partner Arjun Verified",
            message: "Rider Arjun Sharma has passed the safety canister transport check.",
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
    });
  }, [user?.id]);

  const handleMarkAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-2">
              <Bell size={12} />
              Activity Stream
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Notifications
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live updates on dispatches, rider status, and refueling completion
            </p>
          </div>

          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className="text-xs border-slate-700 bg-slate-900 text-slate-300"
          >
            <CheckCheck size={14} className="mr-1" /> Mark All Read
          </Button>
        </div>

        <div className="space-y-3">
          {notifs.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                item.read
                  ? "border-slate-800/80 bg-slate-950/60 opacity-80"
                  : "border-amber-500/30 bg-slate-900 shadow-md"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 ${
                  item.read
                    ? "bg-slate-900 text-slate-500"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                <Fuel size={17} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
