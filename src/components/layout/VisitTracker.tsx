"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Fire-and-forget visit tracking (powers admin dashboard stats). */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      let sessionId = window.sessionStorage.getItem("nimb.sid");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        window.sessionStorage.setItem("nimb.sid", sessionId);
      }
      const payload = JSON.stringify({
        path: pathname,
        sessionId,
        referrer: document.referrer || undefined,
      });
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => null);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
