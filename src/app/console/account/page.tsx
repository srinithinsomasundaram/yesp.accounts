"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, User, Mail, AtSign, Globe, Camera } from "lucide-react";
import { getMe, updateProfile, uploadAvatar, type Me } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

interface FieldRowProps {
  label: string;
  value: string;
  subtext?: string;
  onEdit?: () => void;
  locked?: boolean;
}

function FieldRow({ label, value, subtext, onEdit, locked }: FieldRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-400 font-normal">Not set</span>}</p>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
      {!locked && onEdit && (
        <button
          onClick={onEdit}
          className="ml-6 shrink-0 text-xs text-blue-600 font-medium hover:text-blue-700 hover:underline underline-offset-4 transition-colors"
        >
          Edit
        </button>
      )}
      {locked && (
        <span className="ml-6 shrink-0 text-xs text-slate-400">Managed by org</span>
      )}
    </div>
  );
}

interface EditNameModalProps {
  initial: { firstName: string; lastName: string; displayName: string };
  onClose: () => void;
  onSave: (fields: { firstName: string; lastName: string; displayName: string }) => Promise<void>;
}

function EditNameModal({ initial, onClose, onSave }: EditNameModalProps) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ firstName, lastName, displayName });
      onClose();
    } catch {
      setError("Couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4">
      <div className="e-card w-full max-w-[420px] p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Edit name</h2>
          <p className="text-sm text-slate-500 mt-1">Changes appear across all Yesp products.</p>
        </div>

        {error && (
          <div className="e-error text-sm">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="e-label">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="e-input"
                placeholder="First"
                disabled={saving}
              />
            </div>
            <div>
              <label className="e-label">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="e-input"
                placeholder="Last"
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <label className="e-label">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="e-input"
              placeholder="How your name appears"
              disabled={saving}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? <><Spinner className="w-4 h-4" /> Saving…</> : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMe().then((data) => {
      setMe(data);
      if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function saveNameFields(fields: { firstName: string; lastName: string; displayName: string }) {
    const updated = await updateProfile(fields);
    setMe(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Photo must be under 5 MB.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    setAvatarUrl(URL.createObjectURL(file));

    try {
      const { avatarUrl: url } = await uploadAvatar(file);
      setAvatarUrl(`${url}?v=${Date.now()}`);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setAvatarUrl(me?.avatarUrl ?? null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-6 h-6 text-blue-600" />
      </div>
    );
  }

  if (!me) return null;

  const displayName = (me.displayName ?? [me.firstName, me.lastName].filter(Boolean).join(" ")) || me.email.split("@")[0];
  const initials = (displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "Y").toUpperCase();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Personal information</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your basic account details across Yesp.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-[8px] text-sm text-emerald-800">
          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
          Changes saved successfully.
        </div>
      )}

      {/* Avatar */}
      <div className="e-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Profile photo</h2>
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile photo"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">{initials}</span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:border-slate-300 transition-colors disabled:opacity-50"
              title="Change photo"
            >
              {uploading ? <Spinner className="w-3.5 h-3.5" /> : <Camera size={13} className="text-slate-500" />}
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{me.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-blue-600 font-medium mt-2 hover:text-blue-700 hover:underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP · max 5 MB</p>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="e-card divide-y divide-slate-100 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/60">
          <h2 className="text-sm font-semibold text-slate-700">Basic information</h2>
        </div>
        <div className="px-5">
          <FieldRow
            label="First name"
            value={me.firstName ?? ""}
            onEdit={() => setEditName(true)}
          />
          <FieldRow
            label="Last name"
            value={me.lastName ?? ""}
            onEdit={() => setEditName(true)}
          />
          <FieldRow
            label="Display name"
            value={me.displayName ?? displayName}
            subtext="Used as your name across Yesp products"
            onEdit={() => setEditName(true)}
          />
        </div>
      </div>

      {/* Contact info */}
      <div className="e-card divide-y divide-slate-100 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/60">
          <h2 className="text-sm font-semibold text-slate-700">Contact information</h2>
        </div>
        <div className="px-5">
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
                <Mail size={13} className="text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">Email address</p>
                <p className="text-sm font-medium text-slate-900 truncate">{me.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">Used for sign-in and account notifications</p>
              </div>
            </div>
            <span className="ml-4 shrink-0 badge-green">Verified</span>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
                <AtSign size={13} className="text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">Username</p>
                <p className="text-sm font-medium text-slate-900">{me.email.split("@")[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="e-card divide-y divide-slate-100 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/60">
          <h2 className="text-sm font-semibold text-slate-700">Account details</h2>
        </div>
        <div className="px-5">
          <div className="flex items-center gap-3 py-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
              <User size={13} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account ID</p>
              <p className="text-sm font-medium text-slate-900 font-mono tracking-wide">
                {me.id.replace(/-/g, "").slice(0, 16).replace(/(.{4})/g, "$1-").slice(0, 19).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
              <Globe size={13} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account created</p>
              <p className="text-sm font-medium text-slate-900">
                {me.createdAt ? new Date(me.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {editName && (
        <EditNameModal
          initial={{ firstName: me.firstName ?? "", lastName: me.lastName ?? "", displayName: me.displayName ?? "" }}
          onClose={() => setEditName(false)}
          onSave={saveNameFields}
        />
      )}
    </div>
  );
}
