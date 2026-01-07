"use client";

import { MapPin, FileText, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        return <MapPin className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "report":
        return "bg-blue-100 text-blue-600 ring-blue-50";
      case "unit_added":
        return "bg-emerald-100 text-emerald-600 ring-emerald-50";
      default:
        return "bg-amber-100 text-amber-600 ring-amber-50";
    }
  };

  return (
    <Card className="border-slate-200/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Aktivitas Terkini
            </CardTitle>
            <p className="text-xs text-slate-500 font-normal">
              Memantau perubahan dan laporan terbaru
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-xs px-2 py-0.5 bg-white border-slate-200 text-slate-600 font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live Updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }} className="bg-white">
          <div className="px-5 py-4">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Belum ada aktivitas</p>
                  <p className="text-xs text-slate-500">Aktivitas terbaru akan muncul di sini</p>
                </div>
              </div>
            ) : (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200/40 before:to-transparent">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="relative flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white z-10 shadow-sm ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5 group">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1.5">
                        <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {activity.description}
                        </p>
                        <time className="text-[10px] text-slate-400 whitespace-nowrap font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 shrink-0">
                          {getRelativeTime(activity.timestamp)}
                        </time>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {activity.user.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{activity.user}</span>
                        </div>

                        {activity.province && (
                          <>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{activity.province}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {activity.status && (
                        <div className="mt-2.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] py-0 px-2 h-5 font-semibold border",
                              activity.status === "OPERATIONAL"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : activity.status === "MAINTENANCE_NEEDED"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : activity.status === "OFFLINE"
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-slate-50 text-slate-700 border-slate-100"
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

