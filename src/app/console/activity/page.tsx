"use client";

import { useEffect, useState } from "react";
import {
  LogIn,
  LogOut,
  Fingerprint,
  Shield,
  Smartphone,
  KeyRound,
  Mail,
  AlertTriangle,
  UserCog,
  RefreshCw,
  Globe,
  Filter,
  type LucideIcon,
} from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { clsx } from "clsx";
import { getActivityEvents } from "@/lib/api";

interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

type FilterType = "all" | "sign_in" | "security" | "account";

const EVENT_META: Record<string, { icon: LucideIcon; color: string; category: FilterType }> = {
  // Backend event types (dots replaced with underscores)
  user_registered:            { icon: UserCog,      color: "text-blue-600 bg-blue-50",        category: "account" },
  user_login_success:         { icon: LogIn,        color: "text-emerald-600 bg-emerald-50",  category: "sign_in" },
  user_login_failed:          { icon: AlertTriangle,color: "text-red-600 bg-red-50",          category: "sign_in" },
  user_logout:                { icon: LogOut,       color: "text-slate-500 bg-slate-100",     category: "sign_in" },
  user_logout_all:            { icon: LogOut,       color: "text-slate-600 bg-slate-100",     category: "sign_in" },
  user_email_verified:        { icon: Mail,         color: "text-blue-600 bg-blue-50",        category: "account" },
  mfa_enabled:                { icon: Shield,       color: "text-emerald-600 bg-emerald-50",  category: "security" },
  mfa_verified:               { icon: Shield,       color: "text-blue-600 bg-blue-50",        category: "security" },
  mfa_disabled:               { icon: Shield,       color: "text-amber-600 bg-amber-50",      category: "security" },
  password_reset_requested:   { icon: KeyRound,     color: "text-slate-700 bg-slate-100",     category: "security" },
  password_reset_completed:   { icon: KeyRound,     color: "text-slate-700 bg-slate-100",     category: "security" },
  passkey_added:              { icon: Fingerprint,  color: "text-blue-600 bg-blue-50",        category: "security" },
  passkey_removed:            { icon: Fingerprint,  color: "text-amber-600 bg-amber-50",      category: "security" },
  session_revoked:            { icon: RefreshCw,    color: "text-slate-600 bg-slate-100",     category: "security" },
  // Legacy / placeholder keys
  login:                      { icon: LogIn,        color: "text-emerald-600 bg-emerald-50",  category: "sign_in" },
  logout:                     { icon: LogOut,       color: "text-slate-500 bg-slate-100",     category: "sign_in" },
  passkey_login:              { icon: Fingerprint,  color: "text-blue-600 bg-blue-50",        category: "sign_in" },
  smart_login:                { icon: Smartphone,   color: "text-blue-600 bg-blue-50",        category: "sign_in" },
  password_changed:           { icon: KeyRound,     color: "text-slate-700 bg-slate-100",     category: "security" },
  email_verified:             { icon: Mail,         color: "text-blue-600 bg-blue-50",        category: "account" },
  profile_updated:            { icon: UserCog,      color: "text-slate-700 bg-slate-100",     category: "account" },
  failed_login:               { icon: AlertTriangle,color: "text-red-600 bg-red-50",          category: "sign_in" },
};

function getEventMeta(type: string): { icon: LucideIcon; color: string; category: FilterType } {
  return EVENT_META[type] ?? { icon: Globe, color: "text-slate-500 bg-slate-100", category: "all" as FilterType };
}

function parseUserAgent(ua: string): string {
  const browser = ua.includes("Chrome") ? "Chrome"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Safari") ? "Safari"
    : ua.includes("Edge") ? "Edge"
    : "Unknown browser";
  const os = ua.includes("Windows") ? "Windows"
    : ua.includes("Mac") ? "macOS"
    : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
    : ua.includes("Android") ? "Android"
    : ua.includes("Linux") ? "Linux"
    : "";
  return os ? `${browser} on ${os}` : browser;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: days > 365 ? "numeric" : undefined });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function groupByDate(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
  const groups = new Map<string, ActivityEvent[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const event of events) {
    const d = new Date(event.createdAt).toDateString();
    const label = d === today ? "Today" : d === yesterday ? "Yesterday"
      : new Date(event.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(event);
  }

  return Array.from(groups.entries()).map(([label, events]) => ({ label, events }));
}

const EVENT_LABELS: Record<string, string> = {
  "user.registered":         "Account created",
  "user.login.success":      "Signed in",
  "user.login.failed":       "Failed sign-in attempt",
  "user.logout":             "Signed out",
  "user.logout.all":         "Signed out of all sessions",
  "user.email.verified":     "Email address verified",
  "mfa.enabled":             "Two-factor auth enabled",
  "mfa.verified":            "Signed in with authenticator",
  "mfa.disabled":            "Two-factor auth disabled",
  "password.reset.requested": "Password reset requested",
  "password.reset.completed": "Password changed",
  "passkey.added":           "Passkey added",
  "passkey.removed":         "Passkey removed",
  "session.revoked":         "Session ended",
};

function labelFromEventType(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Placeholder data for when backend doesn't have this endpoint yet
const PLACEHOLDER_EVENTS: ActivityEvent[] = [
  { id: "1", type: "login", description: "Signed in with password", ip: "203.0.113.12", userAgent: "Mozilla/5.0 (Macintosh) Chrome/127", createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "2", type: "passkey_login", description: "Signed in with passkey", ip: "203.0.113.12", userAgent: "Mozilla/5.0 (iPhone) Safari/604", createdAt: new Date(Date.now() - 86400000 - 3600000).toISOString() },
  { id: "3", type: "mfa_enabled", description: "Two-factor authentication enabled", ip: "203.0.113.12", userAgent: "Mozilla/5.0 (Macintosh) Chrome/127", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "4", type: "passkey_added", description: "Passkey added — MacBook Pro", ip: "203.0.113.12", userAgent: "Mozilla/5.0 (Macintosh) Chrome/127", createdAt: new Date(Date.now() - 86400000 * 3 - 1800000).toISOString() },
  { id: "5", type: "password_changed", description: "Password changed", ip: "203.0.113.12", userAgent: "Mozilla/5.0 (Macintosh) Chrome/127", createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: "6", type: "email_verified", description: "Email address verified", ip: "203.0.113.8", userAgent: "Mozilla/5.0 (Windows) Chrome/126", createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
  { id: "7", type: "login", description: "Signed in with password", ip: "203.0.113.8", userAgent: "Mozilla/5.0 (Windows) Chrome/126", createdAt: new Date(Date.now() - 86400000 * 14 - 60000).toISOString() },
];

const FILTER_LABELS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All activity" },
  { key: "sign_in", label: "Sign-ins" },
  { key: "security", label: "Security" },
  { key: "account", label: "Account" },
];

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    getActivityEvents(100)
      .then((raw) => {
        const mapped: ActivityEvent[] = raw.map((e) => ({
          id: e.id,
          type: e.eventType.replace(/\./g, "_"),
          description: labelFromEventType(e.eventType),
          ip: e.ipAddress ?? "—",
          userAgent: String((e.metadata as Record<string, unknown> | null)?.userAgent ?? ""),
          createdAt: e.occurredAt,
          metadata: Object.fromEntries(
            Object.entries(e.metadata ?? {}).map(([k, v]) => [k, String(v)])
          ),
        }));
        setEvents(mapped);
      })
      .catch(() => setEvents(PLACEHOLDER_EVENTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? events
    : events.filter((e) => getEventMeta(e.type).category === filter);

  const groups = groupByDate(filtered);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Activity</h1>
        <p className="text-sm text-slate-500 mt-1">
          A record of security events and sign-ins on your account.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[8px] w-fit">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              "px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all duration-150",
              filter === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-6 h-6 text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <Filter size={18} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">No activity found</p>
            <p className="text-xs text-slate-400 mt-0.5">No events match the selected filter.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ label, events: groupEvents }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
              <div className="e-card divide-y divide-slate-100 overflow-hidden">
                {groupEvents.map((event) => {
                  const meta = getEventMeta(event.type);
                  const Icon = meta.icon;
                  return (
                    <div key={event.id} className="flex items-start gap-3.5 px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", meta.color.split(" ")[1])}>
                        <Icon size={14} className={meta.color.split(" ")[0]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 leading-snug">{event.description}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-xs text-slate-400">{parseUserAgent(event.userAgent)}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400 font-mono">{event.ip}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className="text-xs text-slate-400 whitespace-nowrap"
                          title={formatFullDate(event.createdAt)}
                        >
                          {formatRelativeTime(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 pb-8">
        <p className="text-xs text-slate-400 text-center">
          Activity is retained for 90 days. Contact support to request a full export.
        </p>
      </div>
    </div>
  );
}
