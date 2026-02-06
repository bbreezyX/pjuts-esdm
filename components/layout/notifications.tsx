"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAllRead,
  type NotificationItem,
} from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastReadTime, setLastReadTime] = useState<Date>(new Date(0));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await getNotifications();
        if (result.success) {
          setNotifications(result.data);
          if (result.lastRead) {
            setLastReadTime(new Date(result.lastRead));
          }
        }
      } catch (error) {
        console.error("Failed to load notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (n) => new Date(n.timestamp) > lastReadTime,
  ).length;

  const handleMarkAllRead = async () => {
    setLastReadTime(new Date());
    await markAllRead();
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "CRITICAL":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "INFO":
        return <FileText className="h-4 w-4 text-primary" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "CRITICAL":
        return "bg-red-500/10";
      case "WARNING":
        return "bg-amber-500/10";
      case "INFO":
        return "bg-primary/10";
      default:
        return "bg-emerald-500/10";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-11 w-11 rounded-xl transition-all border border-transparent",
            unreadCount > 0
              ? "bg-primary/5 hover:bg-primary/10"
              : "text-muted-foreground",
          )}
        >
          <Bell
            className={cn(
              "h-5 w-5",
              unreadCount > 0 && "text-primary animate-pulse",
            )}
          />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2.5 right-2.5 w-3 h-3 bg-primary rounded-full border-2 border-card shadow-sm"
              />
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] sm:w-[400px] p-0 rounded-3xl shadow-2xl border-border bg-card overflow-hidden"
        align="end"
        sideOffset={12}
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div>
            <h4 className="font-bold text-sm text-foreground">Notifikasi</h4>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
              Updates terbaru
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-[10px] font-bold uppercase tracking-wider h-8 px-3 rounded-lg hover:bg-primary/5 text-primary hover:text-primary"
            >
              Tandai dibaca
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Hening Sekali...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Belum ada notifikasi baru untuk Anda.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => {
                const isRead = new Date(notification.timestamp) <= lastReadTime;
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex gap-4 p-4 rounded-2xl transition-all cursor-pointer group relative",
                      !isRead
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {!isRead && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                    )}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                        getColor(notification.type),
                      )}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className={cn(
                            "text-sm font-bold leading-none mt-1",
                            !isRead
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap font-medium">
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            { addSuffix: false, locale: id },
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border bg-muted/20">
          <Button
            variant="ghost"
            className="w-full h-11 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center justify-between px-6"
            onClick={() => {
              setOpen(false);
              router.push("/notifications");
            }}
          >
            <span>Lihat Semua Notifikasi</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
