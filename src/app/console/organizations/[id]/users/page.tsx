"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, ChevronDown, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { clsx } from "clsx";
import { getAccessToken } from "@/lib/api";

interface Member {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
}

const ROLES = [
  { value: "member", label: "Member" },
  { value: "user_manager", label: "User Manager" },
  { value: "application_admin", label: "App Admin" },
  { value: "security_admin", label: "Security Admin" },
  { value: "billing_admin", label: "Billing Admin" },
  { value: "identity_admin", label: "Identity Admin" },
];

function roleLabel(role: string) {
  return ROLES.find(r => r.value === role)?.label ?? role.replace("organization_", "").replace(/_/g, " ");
}

function roleColor(role: string) {
  if (role.includes("owner")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (role.includes("admin")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function OrgUsersPage() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const token = getAccessToken() ?? "";

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/v1/organizations/${id}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(load, [load]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const res = await fetch(`/api/v1/organizations/${id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviting(false);
    if (res.ok) {
      setShowInvite(false);
      setInviteEmail("");
      showToast("success", "Invitation sent.");
      load();
    } else {
      showToast("error", "Could not send invitation. Please try again.");
    }
  }

  async function handleRoleChange(memberId: string, role: string) {
    const res = await fetch(`/api/v1/organizations/${id}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { showToast("success", "Role updated."); load(); }
    else showToast("error", "Failed to update role.");
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this member from the organization?")) return;
    const res = await fetch(`/api/v1/organizations/${id}/members/${memberId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { showToast("success", "Member removed."); load(); }
    else showToast("error", "Failed to remove member.");
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Members</h2>
          <p className="text-xs text-slate-500 mt-0.5">{members.filter(m => m.status === "active").length} active</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Invite user
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 animate-scale-in">
          <form onSubmit={handleInvite} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Invite a new member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="e-label">Email address</label>
                <input className="e-input" type="email" required placeholder="colleague@company.com"
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <div>
                <label className="e-label">Role</label>
                <select className="e-input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={inviting} className="btn-primary w-auto px-5">
                {inviting ? <><Spinner className="w-4 h-4" /> Sending…</> : <><Mail size={14} /> Send invite</>}
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary w-auto px-4">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Members table */}
      {loading ? (
        <div className="flex justify-center py-10"><Spinner className="w-5 h-5 text-blue-600" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {members.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No members yet. Invite someone to get started.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((m) => {
                const name = (m.displayName ?? [m.firstName, m.lastName].filter(Boolean).join(" ")) || m.email.split("@")[0];
                const initial = name[0].toUpperCase();
                const isOwner = m.role === "organization_owner";
                return (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                      <p className="text-xs text-slate-400 truncate">{m.email}</p>
                    </div>
                    <span className={clsx("text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize shrink-0", roleColor(m.role))}>
                      {isOwner ? "Owner" : roleLabel(m.role)}
                    </span>
                    {!isOwner && (
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="relative group">
                          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                            <ChevronDown size={12} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-10 hidden group-focus-within:block py-1">
                            {ROLES.map(r => (
                              <button key={r.value} onClick={() => handleRoleChange(m.id, r.value)}
                                className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 text-slate-700 transition-colors">
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleRemove(m.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
