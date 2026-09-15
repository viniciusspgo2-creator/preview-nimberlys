import type { Metadata } from "next";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

export const metadata: Metadata = {
  title: "Admin",
  description: "Nimberly's Daycare management area.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Plain shell — the public site header/footer/transition intentionally
  // do not apply inside /admin.
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
