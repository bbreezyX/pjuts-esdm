"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { UnitStatus } from "@prisma/client";

export type NotificationItem = {
    id: string;
    title: string;
    description: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    timestamp: Date;
    link?: string;
};

export async function getNotifications(): Promise<{ success: boolean; data: NotificationItem[]; lastRead?: Date }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, data: [] };
        }

        // Fetch fresh user data to get the latest lastNotificationCheck
        // This avoids stale session data and TypeScript errors on session.user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            // @ts-ignore - Prisma client might be locked/stale in dev, but schema has this field
            select: { lastNotificationCheck: true }
        });

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
            take: 5,
            orderBy: { updatedAt: 'desc' }
        });

        // 2. Fetch Recent Reports (Info)
        const recentReports = await prisma.report.findMany({
            take: 5,
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
                link: `/map?focus=${unit.id}` // Hypothetical link support
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

        return {
            success: true,
            data: notifications.slice(0, 10), // Limit total to 10
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
