"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api";
import { AppWindow, ExternalLink, Lock } from "lucide-react";
import { Spinner } from "@/components/Spinner";

interface AppItem {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  isPublic: boolean;
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/applications", {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setApps(Array.isArray(data) ? data : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Apps you can access with your Yesp account.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner className="w-6 h-6 text-blue-600" />
        </div>
      ) : apps.length === 0 ? (
        <div className="e-card p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <AppWindow size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No applications</p>
          <p className="text-xs text-slate-400 mt-1.5 max-w-[260px] leading-relaxed">
            You don&apos;t have access to any applications yet. Contact your administrator to request access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {apps.map((app) => <AppCard key={app.id} app={app} />)}
        </div>
      )}

      <div className="e-card px-4 py-3.5 flex items-start gap-3">
        <Lock size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">
          Access is managed by your organization. Contact your administrator to request additional applications.
        </p>
      </div>
    </div>
  );
}

function AppCard({ app }: { app: AppItem }) {
  const colors = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"];
  const color = colors[app.name.charCodeAt(0) % colors.length];

  return (
    <div className="e-card p-5 flex items-center gap-4 hover:border-blue-200 transition-colors group">
      <div className={`w-10 h-10 ${color} rounded-[8px] flex items-center justify-center shrink-0`}>
        <span className="text-white text-sm font-bold">{app.name[0].toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{app.name}</p>
        {app.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{app.description}</p>}
      </div>
      {app.url && (
        <a href={app.url} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-slate-300 group-hover:text-blue-600 transition-colors">
          <ExternalLink size={15} />
        </a>
      )}
    </div>
  );
}
