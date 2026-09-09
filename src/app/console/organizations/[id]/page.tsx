"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, AppWindow, Clock, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { formatDistanceToNow } from "date-fns";
import { getAccessToken } from "@/lib/api";

interface Member {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  role: string;
  joinedAt: string;
}

interface Stats {
  org: { id: string; name: string; slug: string; createdAt: string };
  role: string;
  memberCount: number;
  appCount: number;
}

function roleLabel(role: string) {
  return role.replace("organization_", "").replace(/_/g, " ");
}

export default function OrgOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const token = getAccessToken() ?? "";

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/organizations/${id}/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/v1/organizations/${id}/members`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([s, m]) => { setStats(s); setMembers(Array.isArray(m) ? m.slice(0, 5) : []); }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!stats) return <div className="flex justify-center py-10"><Spinner className="w-5 h-5 text-blue-600" /></div>;

  const cards = [
    { label: "Members", value: stats.memberCount, icon: Users, href: `/console/organizations/${id}/users` },
    { label: "Applications", value: stats.appCount, icon: AppWindow, href: `/console/organizations/${id}/apps` },
    { label: "Created", value: formatDistanceToNow(new Date(stats.org.createdAt), { addSuffix: true }), icon: Clock, href: null },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const inner = (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 hover:border-blue-200 transition-colors">
              <Icon size={17} className="text-slate-400" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </div>
          );
          return href ? <Link key={label} href={href}>{inner}</Link> : <div key={label}>{inner}</div>;
        })}
      </div>

      {/* Recent members */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recent members</h2>
          <Link href={`/console/organizations/${id}/users`} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {members.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No members yet.</p>
          ) : members.map((m) => {
            const name = (m.displayName ?? [m.firstName].filter(Boolean).join(" ")) || m.email.split("@")[0];
            const initial = name[0].toUpperCase();
            return (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">{initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                  <p className="text-xs text-slate-400 truncate">{m.email}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize shrink-0">
                  {roleLabel(m.role)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization ID */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500 font-medium mb-1">Organization ID</p>
        <p className="text-xs text-slate-700 font-mono">{stats.org.id}</p>
      </div>
    </div>
  );
}
