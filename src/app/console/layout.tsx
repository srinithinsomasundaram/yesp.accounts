"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import {
  LogOut, LayoutDashboard, Shield,
  Building2, HelpCircle, User, Activity, Menu, X,
  ChevronRight,
} from "lucide-react";
import { isAuthenticated } from "@/lib/session";
import { getMe, logout, clearTokens, setTokens, ApiError, type Me } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

const AUTH_URL = (process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.yesp.space").replace(/\/$/, "");

const NAV = [
  { href: "/console",               label: "Overview",      mobileLabel: "Home",    icon: LayoutDashboard, exact: true },
  { href: "/console/account",       label: "Personal info", mobileLabel: "Profile", icon: User },
  { href: "/console/security",      label: "Security",      mobileLabel: "Security",icon: Shield },
  { href: "/console/activity",      label: "Activity",      mobileLabel: "Activity",icon: Activity },
  { href: "/console/organizations", label: "Organizations", mobileLabel: "Orgs",    icon: Building2 },
];

function isActive(href: string, path: string, exact?: boolean) {
  return exact ? path === href : path.startsWith(href);
}

function Avatar({ initials, avatarUrl, size = "sm" }: { initials: string; avatarUrl?: string | null; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-9 h-9 text-[11px]" : "w-7 h-7 text-[10px]";
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className={clsx(cls, "rounded-full object-cover shrink-0")} />;
  }
  return (
    <div className={clsx(cls, "rounded-full flex items-center justify-center shrink-0 font-bold text-white")}
      style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)" }}>
      {initials}
    </div>
  );
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initError, setInitError] = useState(false);

  const toLogin = useCallback(() => {
    clearTokens();
    const next = encodeURIComponent(window.location.pathname || "/console");
    window.location.href = `${AUTH_URL}/auth/login?next=${next}`;
  }, []);

  const init = useCallback(async () => {
    setInitError(false);
    if (!isAuthenticated()) {
      try {
        const res = await fetch("/api/v1/auth/token/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          // Only redirect to login if the server explicitly says the session is invalid.
          // 5xx or network errors should not auto-logout the user.
          if (res.status === 401) { toLogin(); return; }
          setInitError(true); return;
        }
        const data = await res.json() as { accessToken: string };
        setTokens(data.accessToken, "");
      } catch {
        // Network error — API unreachable. Keep the user on the page.
        setInitError(true); return;
      }
    }
    try {
      setMe(await getMe());
    } catch (err) {
      // Only send to login when the session is definitively expired (401).
      // All other errors (network, 5xx) show a retry screen instead.
      if (err instanceof ApiError && err.status === 401) {
        toLogin();
      } else {
        setInitError(true);
      }
    }
  }, [toLogin]);

  // Initial auth check
  useEffect(() => { init(); }, [init]);

  // Re-check auth on bfcache restore (browser back/forward)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) { setMe(null); setInitError(false); init(); }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [init]);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    clearTokens();
    window.location.href = `${AUTH_URL}/auth/login?logged_out=1`;
  }

  if (!me) {
    if (initError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3 px-6 text-center">
          <p className="text-sm font-medium text-slate-700">Unable to connect</p>
          <p className="text-xs text-slate-400 max-w-xs">Check your internet connection and try again. You will not be logged out.</p>
          <button
            onClick={() => init()}
            className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="w-10 h-10 object-contain opacity-80" />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <Spinner className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <p className="text-xs text-slate-400 animate-pulse">Loading your account…</p>
      </div>
    );
  }

  const displayName = (me.displayName ?? [me.firstName, me.lastName].filter(Boolean).join(" ")) || me.email.split("@")[0];
  const initials = (displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "Y").toUpperCase();

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, pathname, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={clsx(
              "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
              active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-full" />
            )}
            <Icon
              size={16}
              className={clsx(
                "shrink-0 transition-colors",
                active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              )}
            />
            <span className="flex-1">{label}</span>
            {active && <ChevronRight size={13} className="text-blue-400 shrink-0" />}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f8f9fb] flex">

      {/* ── Desktop sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] shrink-0 border-r border-slate-200/80 bg-white flex-col">

        {/* Brand header */}
        <div className="h-[60px] flex items-center justify-between gap-2.5 px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Yesp" className="w-7 h-7 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-900 leading-tight">Yesp Accounts</p>
              <p className="text-[10px] text-slate-400 leading-tight">Identity & access</p>
            </div>
          </div>
          {/* Logged-in user name */}
          <div className="flex items-center gap-1.5 shrink-0 max-w-[100px]">
            <Avatar initials={initials} avatarUrl={me.avatarUrl} size="sm" />
            <span className="text-[11px] font-medium text-slate-700 truncate">{displayName.split(" ")[0]}</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Account</p>
          <NavLinks />
        </div>

        {/* Help */}
        <div className="px-3 pb-2 shrink-0">
          <a href={`${AUTH_URL}/help`} className="flex items-center gap-3 px-3 py-2 w-full text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all">
            <HelpCircle size={16} className="shrink-0" />
            Help & Support
          </a>
        </div>

        {/* User footer */}
        <div className="mx-3 mb-3 p-3 rounded-xl border border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar initials={initials} avatarUrl={me.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">{me.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 w-full text-[11px] font-medium text-slate-400 hover:text-red-600 transition-colors group"
          >
            {loggingOut
              ? <Spinner className="w-3.5 h-3.5" />
              : <LogOut size={13} className="group-hover:text-red-500" />}
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-[270px] bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-out md:hidden",
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Yesp" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-900 leading-tight">Yesp Accounts</p>
              <p className="text-[10px] text-slate-400 leading-tight">Identity & access</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Account</p>
          <NavLinks onNavigate={() => setDrawerOpen(false)} />
        </div>

        <div className="px-3 pb-2 shrink-0">
          <a href={`${AUTH_URL}/help`} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2 w-full text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all">
            <HelpCircle size={16} className="shrink-0" />
            Help & Support
          </a>
        </div>

        <div className="mx-3 mb-3 p-3 rounded-xl border border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar initials={initials} avatarUrl={me.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{me.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 w-full text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors group"
          >
            {loggingOut ? <Spinner className="w-3.5 h-3.5" /> : <LogOut size={12} className="group-hover:text-red-500 shrink-0" />}
            Sign out
          </button>
        </div>
      </div>

      {/* ── Main content column ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 h-[60px] bg-white border-b border-slate-200 shrink-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Yesp" className="w-5 h-5 object-contain" />
            <span className="text-sm font-semibold text-slate-900">Yesp Accounts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 hidden xs:inline">{displayName.split(" ")[0]}</span>
            <Avatar initials={initials} avatarUrl={me.avatarUrl} />
          </div>
        </header>

        {/* Scrollable page area */}
        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="p-4 md:p-8 pb-28 md:pb-10 max-w-5xl mx-auto w-full animate-fade-slide-up">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex pb-safe">
          {NAV.slice(0, 5).map(({ href, mobileLabel, icon: Icon, exact }) => {
            const active = isActive(href, pathname, exact);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors min-h-[56px]",
                  active ? "text-blue-600" : "text-slate-400"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                <span className="leading-tight">{mobileLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
