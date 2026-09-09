"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { Building2, Users, AppWindow, Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { getAccessToken } from "@/lib/api";

interface OrgStats {
  org: { id: string; name: string; slug: string; createdAt: string };
  role: string;
  memberCount: number;
  appCount: number;
}

const TABS = [
  { href: "", label: "Overview", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/apps", label: "Applications", icon: AppWindow },
  { href: "/security", label: "Security", icon: Shield },
];

export default function OrgDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/organizations/${id}/stats`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setStats)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="max-w-2xl space-y-4">
        <Link href="/console/organizations" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={14} /> All organizations
        </Link>
        <div className="e-card p-8 text-center">
          <p className="text-sm font-medium text-slate-800">Organization not found</p>
          <p className="text-xs text-slate-400 mt-1">You may not have access to this organization.</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-5 h-5 text-blue-600" />
      </div>
    );
  }

  const baseHref = `/console/organizations/${id}`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/console/organizations" className="hover:text-slate-700 transition-colors">Organizations</Link>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium">{stats.org.name}</span>
      </div>

      {/* Org header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white text-lg font-bold">{stats.org.name[0].toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{stats.org.name}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 font-mono">{stats.org.slug}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 capitalize">
              {stats.role.replace("organization_", "").replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-0">
          {TABS.map(({ href, label, icon: Icon }) => {
            const fullHref = `${baseHref}${href}`;
            const active = href === "" ? pathname === baseHref : pathname.startsWith(fullHref);
            return (
              <Link key={href} href={fullHref}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                )}>
                <Icon size={14} className={active ? "text-blue-600" : "text-slate-400"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content */}
      <div className="animate-fade-slide-up">{children}</div>
    </div>
  );
}
