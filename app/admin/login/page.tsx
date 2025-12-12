import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminPasswordHash, isAdminAuthenticated } from "@/app/lib/adminAuth";
import AdminLoginForm from "@/app/components/admin/AdminLoginForm";
import { robotsNoIndex } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | CityOfWhitePlains.org",
  description: "Enter the admin password to access the dashboard.",
  robots: robotsNoIndex,
  alternates: {
    canonical: "/admin/login",
  },
};

export default async function AdminLoginPage() {
  const expectedHash = getAdminPasswordHash();
  const authed = await isAdminAuthenticated();

  if (authed && expectedHash) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
            Admin
          </p>
          <h1 className="text-xl font-semibold text-[#111827]">
            Sign in to the dashboard
          </h1>
          <p className="text-[12px] text-[#6B7280]">
            Enter the admin password to continue.
          </p>
        </div>
        <AdminLoginForm hasPassword={!!expectedHash} />
      </div>
    </main>
  );
}
