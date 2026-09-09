"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { getMe, clearTokens } from "@/lib/api";
import { navigateToConsole } from "@/lib/navigation";

// These paths are mid-auth flows — the user may be partially authenticated
// (e.g. passed password but not MFA yet). Do NOT redirect them to the console.
const MID_FLOW_PREFIXES = [
  "/auth/mfa",
  "/auth/smart-login",
  "/auth/oauth",
  "/auth/verify-email",
  "/auth/authorize",
];

function isMidFlow(path: string) {
  return MID_FLOW_PREFIXES.some((p) => path.startsWith(p));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Skip guard on mid-auth pages
    if (isMidFlow(pathname)) { setChecked(true); return; }

    if (!isAuthenticated()) { setChecked(true); return; }

    // Verify the token is still valid against the API
    getMe()
      .then(() => {
        // Already logged in — send them to the console
        navigateToConsole("/console", router);
      })
      .catch(() => {
        // Token invalid/expired — clear and show the auth page normally
        clearTokens();
        setChecked(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Don't flash the auth UI while verifying — show nothing until decided
  if (!checked) return null;

  return <>{children}</>;
}
