"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, WarningTriangle, XmarkCircle, Notes } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getNotifications, markAllRead, type NotificationItem } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

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

    // Filter based on Server Timestamp
    const unreadCount = notifications.filter((n) => new Date(n.timestamp) > lastReadTime).length;

    const handleMarkAllRead = async () => {
        // Optimistic update
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
                return <XmarkCircle className="h-4 w-4 text-red-600" />;
            case "WARNING":
                return <WarningTriangle className="h-4 w-4 text-amber-600" />;
            case "INFO":
                return <Notes className="h-4 w-4 text-primary-600" />;
            default:
                return <CheckCircle className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(20rem,calc(100vw-4rem))] p-0 fixed left-1/2 -translate-x-1/2 mr-[120px]" align="center" sideOffset={16}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h4 className="font-semibold text-sm text-slate-900">Notifikasi</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Tidak ada notifikasi baru</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notification) => {
                                const isRead = new Date(notification.timestamp) <= lastReadTime;
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "flex gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer",
                                            !isRead && "bg-primary-50/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            notification.type === "CRITICAL" && "bg-red-100",
                                            notification.type === "WARNING" && "bg-amber-100",
                                            notification.type === "INFO" && "bg-primary-100"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className={cn(
                                                "text-sm font-medium text-slate-900",
                                                !isRead && "font-semibold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {notification.description}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: id })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <Button
                        variant="ghost"
                        className="w-full h-8 text-xs text-slate-500 hover:text-primary-600 hover:bg-slate-100"
                        onClick={() => {
                            setOpen(false);
                            router.push("/notifications");
                        }}
                    >
                        Lihat Semua Notifikasi
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
