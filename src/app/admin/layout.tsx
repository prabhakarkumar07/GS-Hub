import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/login?redirect_url=/admin");

  const token = await getToken({ template: "supabase" });
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const res = await fetch(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const isAdmin = data.profile?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="h-display text-2xl">Admins only</h1>
        <p className="mt-2 text-stone-600">Ask a GS Hub administrator to grant your account the admin role in the Clerk Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
