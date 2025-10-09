import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { LazyAdminDashboard } from "@/lib/config/dynamic-imports";
import { userUtils } from "@/lib/supabase/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard | Pohřební věnce",
  description: "Administrative dashboard for managing products, orders, and inventory",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const isAdmin = await userUtils.isAdmin(session.user.id);

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LazyAdminDashboard />
    </div>
  );
}
