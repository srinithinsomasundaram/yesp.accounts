"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, ChevronRight, Plus, ArrowLeft, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { getOrganizations, createOrganization, ApiError, type OrgItem } from "@/lib/api";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getOrganizations()
      .then(setOrgs)
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(org: OrgItem) {
    setOrgs((prev) => [org, ...prev]);
    setCreating(false);
  }

  if (creating) {
    return (
      <CreateOrgForm
        onBack={() => setCreating(false)}
        onCreated={handleCreated}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">Organizations connected to your Yesp identity.</p>
        </div>
        {orgs.length > 0 && (
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-[6px] hover:bg-blue-700 transition-colors self-start">
            <Plus size={14} /> New organization
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner className="w-6 h-6 text-blue-600" />
        </div>
      ) : orgs.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <div className="e-card divide-y divide-slate-100 overflow-hidden">
          {orgs.map((org) => <OrgCard key={org.id} org={org} />)}
        </div>
      )}
    </div>
  );
}

function OrgCard({ org }: { org: OrgItem }) {
  return (
    <Link href={`/console/organizations/${org.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group cursor-pointer">
      <div className="w-9 h-9 bg-slate-100 rounded-[8px] flex items-center justify-center shrink-0">
        <span className="text-slate-700 text-sm font-bold">{org.name[0].toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{org.name}</p>
        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
          {org.domain && <span className="text-xs text-slate-400">{org.domain}</span>}
          {org.memberCount !== undefined && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={11} />
              {org.memberCount} member{org.memberCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            org.role === "owner" || org.role === "admin"
              ? "bg-blue-50 text-blue-700"
              : "bg-slate-100 text-slate-500"
          }`}>
            {org.role}
          </span>
        </div>
      </div>
      <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="e-card p-10 flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Building2 size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-800">No organizations</p>
      <p className="text-xs text-slate-400 mt-1.5 max-w-[280px] leading-relaxed">
        You&apos;re not a member of any organization yet. Ask your administrator to invite you, or create one.
      </p>
      <button
        onClick={onCreate}
        className="mt-6 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-[6px] hover:bg-blue-700 transition-colors"
      >
        <Plus size={14} />
        Create organization
      </button>
    </div>
  );
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function CreateOrgForm({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (org: OrgItem) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(toSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug) return;
    setSaving(true);
    setError(null);
    try {
      const org = await createOrganization({ name: name.trim(), slug });
      onCreated(org);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That URL identifier is already taken. Choose a different one.");
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError("Failed to create organization. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-5"
        >
          <ArrowLeft size={14} /> Back to organizations
        </button>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Create organization</h1>
        <p className="text-sm text-slate-500 mt-1">Set up a shared workspace for your team.</p>
      </div>

      <div className="e-card p-6">
        {error && (
          <div className="e-error mb-5">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="e-label">Organization name <span className="text-red-400">*</span></label>
            <input
              className="e-input"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={saving}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="e-label">URL identifier <span className="text-red-400">*</span></label>
            <input
              className="e-input font-mono"
              placeholder="acme-corp"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={saving}
              required
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Lowercase letters, numbers, and hyphens only. Auto-filled from the name.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onBack} className="btn-secondary flex-1" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving || !name.trim() || !slug}>
              {saving ? <><Spinner className="w-4 h-4" /> Creating…</> : "Create organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
