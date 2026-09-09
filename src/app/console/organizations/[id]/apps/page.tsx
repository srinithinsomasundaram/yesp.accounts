"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Globe, Users, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { clsx } from "clsx";
import { getAccessToken } from "@/lib/api";

interface AppWithAccess {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  logoUrl: string | null;
  homepageUrl: string | null;
  usersWithAccess: number;
  enabled: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  web: "bg-blue-50 text-blue-700",
  spa: "bg-indigo-50 text-indigo-700",
  mobile: "bg-purple-50 text-purple-700",
  server: "bg-slate-100 text-slate-600",
  service: "bg-amber-50 text-amber-700",
  internal: "bg-red-50 text-red-700",
};

export default function OrgAppsPage() {
  const { id } = useParams<{ id: string }>();
  const [apps, setApps] = useState<AppWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const token = getAccessToken() ?? "";

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/v1/organizations/${id}/apps`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data) => setApps(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(load, [load]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function toggle(app: AppWithAccess) {
    setPending(app.id);
    const endpoint = app.enabled
      ? `/api/v1/organizations/${id}/apps/${app.id}/revoke-all`
      : `/api/v1/organizations/${id}/apps/${app.id}/grant-all`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setPending(null);
    if (res.ok) {
      showToast("success", app.enabled ? `${app.name} disabled for all members.` : `${app.name} enabled for all members.`);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast("error", data.error === "forbidden" ? "You don't have permission to change app access." : "Failed to update app access.");
    }
  }

  return (
    <div className="space-y-5">
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
        <h2 className="text-base font-semibold text-slate-900">Applications</h2>
        <p className="text-xs text-slate-500 mt-0.5">Control which Yesp apps members of this organization can access.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner className="w-5 h-5 text-blue-600" /></div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No applications registered in Yesp yet.</div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className={clsx(
              "bg-white border rounded-xl p-5 transition-all",
              app.enabled ? "border-blue-200" : "border-slate-200"
            )}>
              <div className="flex items-start gap-4">
                {/* App icon */}
                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                  {app.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.logoUrl} alt={app.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-slate-700 font-bold text-base">{app.name[0]}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-slate-900">{app.name}</h3>
                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide", TYPE_COLORS[app.type] ?? TYPE_COLORS.web)}>
                      {app.type}
                    </span>
                  </div>
                  {app.description && (
                    <p className="text-xs text-slate-500 mb-2">{app.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {app.enabled ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 size={12} /> Enabled
                      </span>
                    ) : (
                      <span className="text-slate-400">Not enabled</span>
                    )}
                    {app.usersWithAccess > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {app.usersWithAccess} user{app.usersWithAccess !== 1 ? "s" : ""} have access
                      </span>
                    )}
                    {app.homepageUrl && (
                      <a href={app.homepageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <Globe size={11} /> Open app
                      </a>
                    )}
                  </div>
                </div>

                <button onClick={() => toggle(app)} disabled={pending === app.id}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border",
                    app.enabled
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  )}>
                  {pending === app.id ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : app.enabled ? (
                    <><ToggleLeft size={14} /> Disable</>
                  ) : (
                    <><ToggleRight size={14} /> Enable for all</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Enabling grants access to all current members. Disabling revokes access for everyone.
      </p>
    </div>
  );
}
