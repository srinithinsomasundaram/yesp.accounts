"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const AUTH_URL    = (process.env.NEXT_PUBLIC_AUTH_URL    ?? "https://auth.yesp.space").replace(/\/$/, "");
const CONSOLE_URL = (process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://accounts.yesp.space").replace(/\/$/, "");

interface Me {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
}

function initials(me: Me) {
  const name = me.displayName ?? [me.firstName, me.lastName].filter(Boolean).join(" ") ?? me.email;
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "Y";
}

function firstName(me: Me) {
  return me.firstName ?? me.displayName?.split(" ")[0] ?? me.email.split("@")[0];
}

export function NavbarUser() {
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Silent refresh via the HttpOnly RT cookie
        const ref = await fetch("/api/v1/auth/token/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!ref.ok) { setChecked(true); return; }

        const { accessToken } = await ref.json() as { accessToken: string };

        const meRes = await fetch("/api/v1/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) setMe(await meRes.json());
      } catch {
        // Network error — show signed-out state
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  // Skeleton while checking — same width as the signed-out buttons so the
  // layout doesn't shift once we know the auth state.
  if (!checked) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-5 w-14 bg-slate-100 rounded animate-pulse" />
        <div className="h-8 w-28 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (me) {
    return (
      <a
        href={`${CONSOLE_URL}/console`}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
      >
        {/* Avatar */}
        {me.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%)" }}>
            {initials(me)}
          </div>
        )}
        <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
          {firstName(me)}
        </span>
        <ChevronRight size={13} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link
        href={`${AUTH_URL}/auth/login`}
        className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-2 py-1"
      >
        Sign in
      </Link>
      <Link
        href={`${AUTH_URL}/auth/register`}
        className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
      >
        Create account
      </Link>
    </div>
  );
}
