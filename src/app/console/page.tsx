"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, ChevronRight, Laptop, Globe, Smartphone, AlertTriangle } from "lucide-react";
import {
  getSecuritySummary, getSecurityEvents, getSessions, revokeSession,
  type SecuritySummary, type SecurityEvent, type Session,
} from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";

const EVENT_LABELS: Record<string, string> = {
  "user.login.success": "Signed in",
  "user.login.failed": "Failed sign-in attempt",
  "password.changed": "Password changed",
  "password.reset.completed": "Password reset",
  "mfa.enabled": "Two-factor auth enabled",
  "mfa.disabled": "Two-factor auth disabled",
  "mfa.verified": "Two-factor verified",
  "mfa.recovery_code.used": "Recovery code used",
  "session.revoked": "Session ended",
  "session.all_revoked": "All sessions ended",
  "passkey.added": "Passkey registered",
  "passkey.removed": "Passkey removed",
};

function eventDot(type: string) {
  if (type.includes("failed") || type.includes("recovery_code")) return "bg-red-500";
  if (type.includes("revoked") || type.includes("disabled")) return "bg-amber-500";
  if (type.includes("success") || type.includes("enabled") || type.includes("added")) return "bg-emerald-500";
  return "bg-slate-300";
}

function deviceIcon(ua: string | null) {
  if (!ua) return Globe;
  if (/mobile|android|iphone/i.test(ua)) return Smartphone;
  return Laptop;
}


export default function ConsolePage() {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    Promise.all([getSecuritySummary(), getSecurityEvents(), getSessions()])
      .then(([s, e, sess]) => { setSummary(s); setEvents(e.slice(0, 8)); setSessions(sess); })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRevoke(id: string) {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions((s) => s.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to end session");
    } finally {
      setRevokingId(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner className="w-7 h-7 text-blue-600" /></div>;
  }

  const isSecure = summary?.mfaEnabled && !events.some((e) => e.eventType === "user.login.failed");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-sm text-slate-500">{greeting}</p>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">Account Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your Yesp identity, security, and connected applications.</p>
      </div>

      {/* Security status */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Security Status</p>
        <div className="e-card overflow-hidden">
          <div className={`px-5 py-4 flex items-center gap-3 border-b ${isSecure ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
            <CheckCircle2 size={18} className={isSecure ? "text-emerald-600" : "text-amber-600"} />
            <span className={`text-sm font-medium ${isSecure ? "text-emerald-800" : "text-amber-800"}`}>
              {isSecure ? "Your account is protected" : "Recommended: improve your security"}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            <SecurityRow label="Multi-factor authentication" value={summary?.mfaEnabled ? "Enabled" : "Not set up"} ok={summary?.mfaEnabled} href="/console/security" />
            <SecurityRow label="Passkeys" value={`${summary?.activeDevices ?? 0} registered`} ok={true} href="/console/security" />
            <SecurityRow label="Active sessions" value={String(summary?.activeSessions ?? 0)} ok={true} href="/console/security" />
            <SecurityRow label="Security alerts" value="None" ok={true} href="/console/security" />
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <Link href="/console/security" className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 hover:underline underline-offset-4">
              View security <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</p>
          <div className="e-card overflow-hidden">
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">No recent activity</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {events.map((e) => (
                  <div key={e.id} className="px-4 py-3 flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${eventDot(e.eventType)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800">{EVENT_LABELS[e.eventType] ?? e.eventType}</p>
                      {e.ipAddress && <p className="text-[11px] text-slate-400 font-mono">{e.ipAddress}</p>}
                    </div>
                    <p className="text-[11px] text-slate-400 shrink-0">{formatDistanceToNow(new Date(e.occurredAt), { addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Active Sessions</p>
          <div className="e-card overflow-hidden">
            {sessions.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">No active sessions</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.slice(0, 5).map((s) => {
                  const DeviceIcon = deviceIcon(s.device?.userAgent ?? null);
                  return (
                    <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
                        <DeviceIcon size={14} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">
                          {s.device?.name ?? s.device?.userAgent?.slice(0, 30) ?? "Unknown device"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDistanceToNow(new Date(s.lastActivityAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {s.riskStatus !== "normal" && <AlertTriangle size={12} className="text-amber-500" />}
                        <button
                          onClick={() => handleRevoke(s.id)}
                          disabled={revokingId === s.id}
                          className="text-[11px] text-slate-400 hover:text-red-600 transition-colors px-1.5 py-0.5 rounded hover:bg-red-50"
                        >
                          {revokingId === s.id ? <Spinner className="w-3 h-3" /> : "End"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {sessions.length > 5 && (
              <div className="px-4 py-2.5 border-t border-slate-100">
                <Link href="/console/security" className="text-xs text-blue-600 hover:text-blue-700">
                  View all {sessions.length} sessions →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SecurityRow({ label, value, ok, href }: { label: string; value: string; ok?: boolean; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50/60 transition-colors group">
      <span className="text-sm text-slate-700 mr-3 truncate">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-sm font-medium ${ok ? "text-slate-900" : "text-amber-700"}`}>{value}</span>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </Link>
  );
}
