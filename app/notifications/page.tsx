import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications } from "@/app/actions/notifications";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationsClient } from "./client";

export default async function NotificationsPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Fetch more notifications for the full view
    const { data: notifications, lastRead } = await getNotifications(50);

    return (
        <AppShell
            user={{
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
            }}
        >
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <NotificationsClient
                    initialNotifications={notifications}
                    initialLastRead={lastRead ? new Date(lastRead) : new Date(0)}
                />
            </div>
        </AppShell>
    );
}
