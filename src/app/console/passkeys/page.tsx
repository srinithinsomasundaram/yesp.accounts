"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Fingerprint, Plus, Trash2, Laptop, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getPasskeys, deletePasskey, type PasskeyItem } from "@/lib/api";
import { Spinner } from "@/components/Spinner";

export default function PasskeysPage() {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  async function load() {
    setLoading(true);
    try { setPasskeys(await getPasskeys()); }
    catch { toast.error("Failed to load passkeys"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    setAdding(true);
    try {
      const { registerPasskey } = await import("@/lib/passkey");
      await registerPasskey(deviceName.trim() || undefined);
      toast.success("Passkey registered");
      setShowPanel(false);
      setDeviceName("");
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("cancel") || msg.includes("abort") || msg.includes("NotAllowed")) {
        toast.info("Registration cancelled");
      } else {
        toast.error("Failed to register passkey. Try again.");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deletePasskey(id);
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
      toast.success("Passkey removed");
    } catch {
      toast.error("Failed to remove passkey");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-lg space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Passkeys</h1>
          <p className="text-sm text-slate-500 mt-1.5">Sign in securely without a password using biometrics or a security key.</p>
        </div>
        {!showPanel && (
          <button
            onClick={() => setShowPanel(true)}
            className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-[6px] hover:bg-blue-700 active:scale-[0.99] transition-all duration-150 self-start"
          >
            <Plus size={15} />
            Add passkey
          </button>
        )}
      </div>

      {/* Add panel */}
      {showPanel && (
        <div className="e-card p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Register a new passkey</p>
            <p className="text-xs text-slate-500 mt-1">Your browser or device will prompt you to authenticate with biometrics or a PIN.</p>
          </div>
          <div>
            <label className="e-label">Device name <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. MacBook Pro, iPhone 15"
              className="e-input"
              disabled={adding}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-[6px] hover:bg-blue-700 disabled:opacity-50 transition-all duration-150"
            >
              {adding ? <><Spinner className="w-4 h-4" /> Waiting for device…</> : <><Fingerprint size={15} /> Authenticate</>}
            </button>
            <button onClick={() => { setShowPanel(false); setDeviceName(""); }} disabled={adding} className="btn-ghost px-3 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="e-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-6 h-6 text-blue-600" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Fingerprint size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No passkeys registered</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Add a passkey to sign in with Face ID, Touch ID, or a hardware security key — no password needed.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {passkeys.map((pk) => (
              <li key={pk.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-slate-100 rounded-[6px] flex items-center justify-center shrink-0">
                    <Laptop size={15} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{pk.deviceName ?? "Unnamed passkey"}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">Added {formatDistanceToNow(new Date(pk.createdAt), { addSuffix: true })}</span>
                      {pk.lastUsedAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(pk.lastUsedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pk.id)}
                  disabled={deletingId === pk.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-[6px] transition-all duration-150 shrink-0 ml-4 disabled:opacity-50"
                >
                  {deletingId === pk.id ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 size={12} />}
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {passkeys.length > 0 && (
        <p className="text-xs text-slate-400">
          Removing a passkey from here removes it from your Yesp account. You may also need to remove it from your device settings separately.
        </p>
      )}
    </div>
  );
}
