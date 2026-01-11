"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    WarningTriangle,
    XmarkCircle,
    Notes,
    DoubleCheck,
    BellNotification
} from "iconoir-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markAllRead, type NotificationItem } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

interface NotificationsClientProps {
    initialNotifications: NotificationItem[];
    initialLastRead: Date;
}

export function NotificationsClient({ initialNotifications, initialLastRead }: NotificationsClientProps) {
    const router = useRouter();
    const [notifications] = useState<NotificationItem[]>(initialNotifications);
    const [lastReadTime, setLastReadTime] = useState<Date>(initialLastRead);
    const [isLoading, setIsLoading] = useState(false);

    const handleMarkAllRead = async () => {
        try {
            setIsLoading(true);
            // Optimistic update
            setLastReadTime(new Date());

            const result = await markAllRead();
            if (result.success) {
                toast({
                    title: "Berhasil",
                    description: "Semua notifikasi telah ditandai sebagai sudah dibaca.",
                });
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to mark notifications read:", error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal menandai notifikasi.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "CRITICAL":
                return <XmarkCircle className="h-5 w-5 text-red-600" />;
            case "WARNING":
                return <WarningTriangle className="h-5 w-5 text-amber-600" />;
            case "INFO":
                return <Notes className="h-5 w-5 text-primary-600" />;
            default:
                return <CheckCircle className="h-5 w-5 text-slate-500" />;
        }
    };

    const isUnread = (timestamp: Date | string) => {
        return new Date(timestamp) > lastReadTime;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
                    <p className="text-slate-500 mt-1">
                        Pantau semua aktivitas dan peringatan sistem
                    </p>
                </div>
                {notifications.some(n => isUnread(n.timestamp)) && (
                    <Button
                        onClick={handleMarkAllRead}
                        disabled={isLoading}
                        variant="outline"
                        className="shrink-0"
                    >
                        <DoubleCheck className="w-4 h-4 mr-2" />
                        Tandai semua dibaca
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <BellNotification className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Tidak ada notifikasi</h3>
                        <p>Anda belum memiliki notifikasi apapun saat ini.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => {
                            // Ensure timestamp is a Date object if it was passed as string across boundary (though in this file we expect NotificationItem which has Date, but let's be safe)
                            const timestampDate = new Date(notification.timestamp);
                            const read = !isUnread(timestampDate);

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "group flex items-start gap-4 p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer relative",
                                        !read && "bg-blue-50/30"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                                        notification.type === "CRITICAL" && "bg-red-50 border-red-100",
                                        notification.type === "WARNING" && "bg-amber-50 border-amber-100",
                                        notification.type === "INFO" && "bg-blue-50 border-blue-100",
                                        (!notification.type || notification.type === "INFO") && "bg-slate-50 border-slate-100"
                                    )}>
                                        {getIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 overflow-hidden">
                                            <p className={cn(
                                                "text-base font-medium text-slate-900 truncate",
                                                !read && "font-bold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                                                {formatDistanceToNow(timestampDate, { addSuffix: true, locale: id })}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600 line-clamp-2 sm:line-clamp-1 group-hover:line-clamp-none transition-all">
                                            {notification.description}
                                        </p>
                                    </div>

                                    {!read && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-r" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
