"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { clsx } from "clsx";
import { getAccessToken } from "@/lib/api";

interface SecurityPolicy {
  organizationId: string;
  requireMfa: boolean;
  requireSso: boolean;
  allowedAuthMethods: string[];
  sessionMaxAgeSecs: number;
}

function secsToLabel(secs: number): string {
  const days = Math.round(secs / 86400);
  if (days >= 30) return `${Math.round(days / 30)} month${Math.round(days / 30) !== 1 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
}

const SESSION_OPTIONS = [
  { secs: 3600, label: "1 hour" },
  { secs: 86400, label: "1 day" },
  { secs: 604800, label: "7 days" },
  { secs: 2592000, label: "30 days (default)" },
  { secs: 7776000, label: "90 days" },
  { secs: 31536000, label: "1 year" },
];

export default function OrgSecurityPage() {
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const token = getAccessToken() ?? "";

  useEffect(() => {
    fetch(`/api/v1/organizations/${id}/security-policy`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setPolicy)
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function save() {
    if (!policy) return;
    setSaving(true);
    const res = await fetch(`/api/v1/organizations/${id}/security-policy`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        requireMfa: policy.requireMfa,
        requireSso: policy.requireSso,
        sessionMaxAgeSecs: policy.sessionMaxAgeSecs,
      }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("success", "Security policy saved.");
      const updated = await res.json();
      setPolicy(updated);
    } else {
      const data = await res.json().catch(() => ({}));
      showToast("error", data.error === "forbidden" ? "You don't have permission to update security settings." : "Failed to save. Please try again.");
    }
  }

  if (!policy) return <div className="flex justify-center py-10"><Spinner className="w-5 h-5 text-blue-600" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className={clsx(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-scale-in",
          toast.type === "success" ? "bg-white border border-green-200 text-green-800" : "bg-white border border-red-200 text-red-800"
        )}>
          {toast.type === "success" ? <CheckCircle2 size={15} className="text-green-600" /> : <AlertCircle size={15} className="text-red-500" />}
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-slate-900">Security policy</h2>
        <p className="text-xs text-slate-500 mt-0.5">These settings apply to all members of this organization.</p>
      </div>

      {/* MFA */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Multi-Factor Authentication</h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input type="checkbox" className="sr-only" checked={policy.requireMfa}
                onChange={e => setPolicy({ ...policy, requireMfa: e.target.checked })} />
              <div className={clsx(
                "w-10 h-6 rounded-full transition-colors",
                policy.requireMfa ? "bg-blue-600" : "bg-slate-200"
              )}>
                <div className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  policy.requireMfa ? "translate-x-5" : "translate-x-1"
                )} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Require MFA for all members</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Members without MFA set up will be prompted to configure it before accessing organization resources.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* SSO */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Single Sign-On</h3>
        </div>
        <div className="p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input type="checkbox" className="sr-only" checked={policy.requireSso}
                onChange={e => setPolicy({ ...policy, requireSso: e.target.checked })} />
              <div className={clsx(
                "w-10 h-6 rounded-full transition-colors",
                policy.requireSso ? "bg-blue-600" : "bg-slate-200"
              )}>
                <div className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  policy.requireSso ? "translate-x-5" : "translate-x-1"
                )} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Require enterprise SSO</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Members must sign in through your organization's SAML SSO connection. Password login will be disabled.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Session policy */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Session lifetime</h3>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500">
            Maximum time a member can stay signed in before being required to authenticate again.
            Currently: <strong>{secsToLabel(policy.sessionMaxAgeSecs)}</strong>.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SESSION_OPTIONS.map(({ secs, label }) => (
              <button key={secs} onClick={() => setPolicy({ ...policy, sessionMaxAgeSecs: secs })}
                className={clsx(
                  "text-xs py-2 px-3 rounded-lg border transition-all font-medium",
                  policy.sessionMaxAgeSecs === secs
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="btn-primary w-auto px-8">
        {saving ? <><Spinner className="w-4 h-4" /> Saving…</> : "Save security policy"}
      </button>
    </div>
  );
}
