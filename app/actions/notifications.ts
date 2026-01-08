"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { UnitStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CacheDurations } from "@/lib/cache";

export type NotificationItem = {
    id: string;
    title: string;
    description: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    timestamp: Date;
    link?: string;
};

// Cache tag for invalidation
const NOTIFICATIONS_TAG = "notifications";

/**
 * Internal function to fetch notification data (for caching)
 * Does not include user-specific lastRead timestamp
 */
async function fetchNotificationData(limit: number = 10): Promise<NotificationItem[]> {
    // 1. Fetch Units requiring attention (Critical / Warning)
    const problematicUnits = await prisma.pjutsUnit.findMany({
        where: {
            lastStatus: {
                in: [UnitStatus.OFFLINE, UnitStatus.MAINTENANCE_NEEDED],
            },
        },
        select: {
            id: true,
            serialNumber: true,
            lastStatus: true,
            regency: true,
            updatedAt: true,
        },
        take: Math.ceil(limit / 2),
        orderBy: { updatedAt: 'desc' }
    });

    // 2. Fetch Recent Reports (Info)
    const recentReports = await prisma.report.findMany({
        take: Math.ceil(limit / 2),
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true },
            },
            unit: {
                select: { serialNumber: true },
            },
        },
    });

    // 3. Map to NotificationItem
    const notifications: NotificationItem[] = [];

    // Map Units to Notifications
    problematicUnits.forEach((unit) => {
        const isOffline = unit.lastStatus === UnitStatus.OFFLINE;
        notifications.push({
            id: `unit-${unit.id}`,
            title: `Unit ${unit.serialNumber} ${isOffline ? "Offline" : "Perlu Perawatan"}`,
            description: isOffline
                ? `Unit di ${unit.regency} tidak mengirim data atau voltase kritis.`
                : `Unit di ${unit.regency} memerlukan pengecekan rutin.`,
            type: isOffline ? "CRITICAL" : "WARNING",
            timestamp: unit.updatedAt,
            link: `/map?focus=${unit.id}`
        });
    });

    // Map Reports to Notifications
    recentReports.forEach((report) => {
        notifications.push({
            id: `report-${report.id}`,
            title: "Laporan Baru Masuk",
            description: `${report.user.name} melaporkan kondisi Unit ${report.unit.serialNumber}.`,
            type: "INFO",
            timestamp: report.createdAt,
            link: `/reports`
        });
    });

    // Sort combined notifications by newness
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return notifications.slice(0, limit);
}

// Cached version - refreshes every 60 seconds
const getCachedNotifications = unstable_cache(
    () => fetchNotificationData(10),
    ["notifications-data"],
    {
        revalidate: CacheDurations.SHORT, // 60 seconds
        tags: [NOTIFICATIONS_TAG],
    }
);

/**
 * Get notifications with caching (OPTIMIZED)
 * The notification data is cached, but lastRead is always fresh per-user
 */
export async function getNotifications(limit: number = 10): Promise<{ success: boolean; data: NotificationItem[]; lastRead?: Date }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, data: [] };
        }

        // Fetch user's lastNotificationCheck (this is user-specific, not cached)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            // @ts-ignore - Prisma client might be locked/stale in dev, but schema has this field
            select: { lastNotificationCheck: true }
        });

        // Use cached notifications for default limit
        let notifications: NotificationItem[];
        if (limit === 10) {
            notifications = await getCachedNotifications();
        } else {
            // For custom limits, fetch directly
            notifications = await fetchNotificationData(limit);
        }

        return {
            success: true,
            data: notifications,
            // @ts-ignore - Prisma client might be locked/stale in dev
            lastRead: user?.lastNotificationCheck ?? new Date(0),
        };
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return { success: false, data: [], lastRead: new Date(0) };
    }
}

export async function markAllRead() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        await prisma.user.update({
            where: { id: session.user.id },
            // @ts-ignore - Prisma client might be locked/stale in dev, but schema has this field
            data: { lastNotificationCheck: new Date() },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to mark notifications read:", error);
        return { success: false };
    }
}
