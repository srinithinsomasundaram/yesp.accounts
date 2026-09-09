"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Laptop, Smartphone, Globe, AlertTriangle, LogOut } from "lucide-react";
import { getSessions, revokeSession, revokeAllSessions, type Session } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

function deviceIcon(ua: string | null) {
  if (!ua) return Globe;
  if (/mobile|android|iphone/i.test(ua)) return Smartphone;
  return Laptop;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRevoke(id: string) {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions((s) => s.filter((x) => x.id !== id));
      toast.success("Session ended");
    } catch {
      toast.error("Failed to end session");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeAll() {
    if (!confirm("End all other sessions? You will remain signed in on this device.")) return;
    setRevokingAll(true);
    try {
      await revokeAllSessions();
      setSessions([]);
      toast.success("All sessions ended");
    } catch {
      toast.error("Failed to end sessions");
    } finally {
      setRevokingAll(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Active sessions</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {loading ? "Loading…" : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""} across your devices`}
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="btn-danger self-start"
          >
            {revokingAll ? <Spinner className="w-4 h-4" /> : <LogOut size={14} />}
            Sign out of all other sessions
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner className="w-7 h-7 text-blue-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="e-card p-12 text-center">
          <Globe size={32} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm text-slate-400">No active sessions</p>
        </div>
      ) : (
        <div className="e-card overflow-hidden divide-y divide-slate-100">
          {sessions.map((s, i) => {
            const DeviceIcon = deviceIcon(s.device?.userAgent ?? null);
            const isCurrent = i === 0;
            return (
              <div key={s.id} className={`px-4 sm:px-5 py-4 sm:py-5 flex items-start gap-3 sm:gap-4 ${isCurrent ? "bg-blue-50/40" : ""}`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 ${isCurrent ? "bg-blue-100" : "bg-slate-100"}`}>
                  <DeviceIcon size={16} className={isCurrent ? "text-blue-600" : "text-slate-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {s.device?.name ?? "Unknown device"}
                    </p>
                    {isCurrent && (
                      <span className="badge-blue">Current</span>
                    )}
                    {s.riskStatus !== "normal" && (
                      <span className="badge-amber"><AlertTriangle size={10} />Suspicious</span>
                    )}
                  </div>
                  {s.device?.userAgent && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{s.device.userAgent.slice(0, 60)}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Last active {formatDistanceToNow(new Date(s.lastActivityAt), { addSuffix: true })}
                  </p>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      disabled={revokingId === s.id}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-[6px] transition-all duration-150 sm:hidden disabled:opacity-50"
                    >
                      {revokingId === s.id ? <Spinner className="w-3 h-3" /> : <LogOut size={12} />}
                      Sign out
                    </button>
                  )}
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleRevoke(s.id)}
                    disabled={revokingId === s.id}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-[6px] transition-all duration-150 shrink-0 disabled:opacity-50"
                  >
                    {revokingId === s.id ? <Spinner className="w-3 h-3" /> : <LogOut size={12} />}
                    Sign out
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Ending a session immediately signs you out on that device. Your current session is always shown first.
      </p>
    </div>
  );
}
