"use client";

import { MapPin, FileText, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRelativeTime, getStatusLabel } from "@/lib/utils";

interface Activity {
  id: string;
  type: "report" | "unit_added" | "status_change";
  description: string;
  timestamp: Date;
  user: string;
  province?: string;
  status?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: string;
}

export function ActivityFeed({ activities, maxHeight = "400px" }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "report":
        return <FileText className="h-4 w-4" />;
      case "unit_added":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "report":
        return "bg-primary-100 text-primary-700";
      case "unit_added":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-1 px-6 pb-6">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Belum ada aktivitas
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex gap-3 py-3 border-b border-slate-100 last:border-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{activity.user}</span>
                      {activity.province && (
                        <>
                          <span>•</span>
                          <span>{activity.province}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{getRelativeTime(activity.timestamp)}</span>
                    </div>
                    {activity.status && (
                      <Badge
                        variant={
                          activity.status === "OPERATIONAL"
                            ? "operational"
                            : activity.status === "MAINTENANCE_NEEDED"
                            ? "maintenance"
                            : activity.status === "OFFLINE"
                            ? "offline"
                            : "unverified"
                        }
                        className="mt-2"
                      >
                        {getStatusLabel(activity.status)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
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
    <div className="bg-primary-900 text-white py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-8">
            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
            <span className="text-sm">
              <span className="font-medium">{item.serialNumber}</span>
              <span className="mx-2 text-primary-300">•</span>
              <span className="text-primary-200">{item.province}</span>
              <span className="mx-2 text-primary-300">•</span>
              <span className="text-primary-300">{getRelativeTime(item.timestamp)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

