"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminSpinner } from "@/components/admin/admin-shared";

export default function AdminIndexPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <AdminSpinner className="size-10" />
      <p className="text-sm font-semibold text-ink-faint">
        Taking you to the dashboard…
      </p>
    </div>
  );
}
