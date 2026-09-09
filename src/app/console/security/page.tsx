"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Shield, Fingerprint, KeyRound, MonitorSmartphone, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  getSecuritySummary, getSecurityEvents, getPasskeys, getMfaMethods,
  type SecuritySummary, type SecurityEvent,
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
  "passkey.added": "Passkey registered",
  "passkey.removed": "Passkey removed",
};

function eventColor(type: string) {
  if (type.includes("failed") || type.includes("recovery_code")) return "bg-red-500";
  if (type.includes("revoked") || type.includes("disabled")) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function SecurityPage() {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [passkeyCount, setPasskeyCount] = useState(0);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSecuritySummary(), getSecurityEvents(), getPasskeys(), getMfaMethods()])
      .then(([s, e, pk, mfa]) => {
        setSummary(s);
        setEvents(e.slice(0, 10));
        setPasskeyCount(pk.length);
        setMfaEnabled(mfa.some((m) => m.status === "active"));
      })
      .catch(() => toast.error("Failed to load security data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner className="w-7 h-7 text-blue-600" /></div>;
  }

  const hasAlert = !mfaEnabled || (summary?.last30Days.loginFailures ?? 0) > 3;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Security</h1>
        <p className="text-sm text-slate-500 mt-1.5">Manage how you sign in and protect your Yesp account.</p>
      </div>

      {/* Status banner */}
      <div className={`e-card px-5 py-4 flex items-center gap-3 ${hasAlert ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
        {hasAlert
          ? <AlertTriangle size={17} className="text-amber-600 shrink-0" />
          : <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
        }
        <div>
          <p className={`text-sm font-medium ${hasAlert ? "text-amber-800" : "text-emerald-800"}`}>
            {hasAlert ? "Improve your account security" : "Account protected"}
          </p>
          <p className={`text-xs mt-0.5 ${hasAlert ? "text-amber-600" : "text-emerald-600"}`}>
            {hasAlert ? "Enable two-factor authentication for stronger protection." : "No unusual activity detected."}
          </p>
        </div>
      </div>

      {/* Sign-in methods */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sign-in Methods</p>
        <div className="e-card divide-y divide-slate-100 overflow-hidden">
          <SecurityMethodRow
            icon={Fingerprint}
            title="Passkeys"
            description={passkeyCount > 0 ? `${passkeyCount} passkey${passkeyCount !== 1 ? "s" : ""} registered` : "No passkeys registered"}
            status={passkeyCount > 0 ? "ok" : "empty"}
            href="/console/passkeys"
          />
          <SecurityMethodRow
            icon={KeyRound}
            title="Password"
            description="Use a password to sign in"
            status="ok"
            href="/console/mfa"
          />
          <SecurityMethodRow
            icon={Shield}
            title="Two-factor authentication"
            description={mfaEnabled ? "Active — authenticator app" : "Not enabled"}
            status={mfaEnabled ? "ok" : "warning"}
            href="/console/mfa"
          />
        </div>
      </section>

      {/* Sessions */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sessions</p>
        <div className="e-card overflow-hidden">
          <Link href="/console/sessions" className="flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
                <MonitorSmartphone size={16} className="text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{summary?.activeSessions ?? 0} active session{(summary?.activeSessions ?? 0) !== 1 ? "s" : ""}</p>
                <p className="text-xs text-slate-400 mt-0.5">Manage and review your active sessions</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-3" />
          </Link>
        </div>
      </section>

      {/* 30-day stats */}
      {summary && (
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Last 30 Days</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="e-card p-5">
              <p className="text-xs text-slate-400 mb-2">Successful sign-ins</p>
              <p className="text-2xl font-semibold text-slate-900">{summary.last30Days.loginSuccess}</p>
            </div>
            <div className="e-card p-5">
              <p className="text-xs text-slate-400 mb-2">Failed attempts</p>
              <p className={`text-2xl font-semibold ${summary.last30Days.loginFailures > 0 ? "text-red-600" : "text-slate-900"}`}>
                {summary.last30Days.loginFailures}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Event log */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</p>
        <div className="e-card overflow-hidden">
          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Shield size={28} className="text-slate-200" />
              <p className="text-sm text-slate-400">No security events recorded</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((e) => (
                <div key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${eventColor(e.eventType)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium">{EVENT_LABELS[e.eventType] ?? e.eventType}</p>
                    {e.ipAddress && <p className="text-xs text-slate-400 font-mono mt-0.5">{e.ipAddress}</p>}
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{formatDistanceToNow(new Date(e.occurredAt), { addSuffix: true })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SecurityMethodRow({
  icon: Icon, title, description, status, href,
}: { icon: React.ElementType; title: string; description: string; status: "ok" | "warning" | "empty"; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-[6px] flex items-center justify-center shrink-0 ${
          status === "ok" ? "bg-emerald-50" : status === "warning" ? "bg-amber-50" : "bg-slate-100"
        }`}>
          <Icon size={16} className={
            status === "ok" ? "text-emerald-600" : status === "warning" ? "text-amber-600" : "text-slate-400"
          } />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
        </div>
      </div>
      <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-3" />
    </Link>
  );
}
