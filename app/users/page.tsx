import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/app/actions/users";
import { AppShell } from "@/components/layout";
import { UsersClient } from "./users-client";

export const metadata = {
  title: "Manajemen Pengguna - PJUTS ESDM",
};

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only Admin can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const result = await getUsers();
  const users = result.data || [];

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <div className="mx-auto max-w-[1700px] px-4 sm:px-8 lg:px-12 py-6">
        <UsersClient users={users} />
      </div>
    </AppShell>
  );
}

