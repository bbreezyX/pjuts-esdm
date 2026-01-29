"use client";

import { MapPin, Clock, FileText, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnitStatus } from "@prisma/client";
import { getRelativeTime, getStatusLabel, cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "report" | "unit_added" | "status_change";
  description: string;
  timestamp: Date;
  user: string;
  province?: string;
  status?: UnitStatus;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: string;
}

export function ActivityFeed({ activities, maxHeight = "400px" }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "report":
        return <FileText className="h-3.5 w-3.5" />;
      case "unit_added":
        return <PlusCircle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "report":
        return "bg-blue-500/10 text-blue-600 ring-blue-500/20";
      case "unit_added":
        return "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 ring-amber-500/20";
    }
  };

  return (
    <div className="w-full h-full">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Belum ada aktivitas</p>
            <p className="text-xs text-muted-foreground">Aktivitas terbaru akan muncul di sini</p>
          </div>
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="relative flex gap-6 animate-in slide-in-from-bottom-2 fade-in duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={cn(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-4 ring-card z-10 shadow-sm transition-transform hover:scale-110",
                  getActivityColor(activity.type)
                )}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0 group">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {activity.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground border border-border shadow-sm">
                      {activity.user.charAt(0).toUpperCase()}
                    </div>
                    <span>{activity.user}</span>
                  </div>

                  {activity.province && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-primary/60" />
                      <span>{activity.province}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto text-muted-foreground/60 font-medium lowercase">
                    <Clock className="w-3 h-3" />
                    <span>{getRelativeTime(activity.timestamp)}</span>
                  </div>
                </div>

                {activity.status && (
                  <div className="mt-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px] py-0 px-2.5 h-5 font-bold uppercase tracking-widest border-0 shadow-none",
                        activity.status === "OPERATIONAL"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : activity.status === "MAINTENANCE_NEEDED"
                            ? "bg-amber-500/10 text-amber-600"
                            : activity.status === "OFFLINE"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-muted text-muted-foreground"
                      )}
                    >
                      {getStatusLabel(activity.status)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Real-time ticker component for dashboard
interface TickerItemProps {
  province: string;
  serialNumber: string;
  timestamp: Date;
  user: string;
}

export function ActivityTicker({ items }: { items: TickerItemProps[] }) {
  return (
    <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-10">
            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-bold uppercase tracking-widest">
              <span>{item.serialNumber}</span>
              <span className="mx-3 opacity-30">|</span>
              <span className="opacity-80">{item.province}</span>
              <span className="mx-3 opacity-30">|</span>
              <span className="opacity-60 font-medium lowercase">{getRelativeTime(item.timestamp)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
