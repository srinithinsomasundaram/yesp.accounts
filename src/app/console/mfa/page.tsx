"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { getMfaMethods, setupTotp, verifyTotp, disableMfa, type MfaMethod } from "@/lib/api";
import { OtpInput } from "@/components/OtpInput";
import { Spinner } from "@/components/Spinner";

type SetupStep = "idle" | "qr" | "verify" | "done";

export default function MfaPage() {
  const [methods, setMethods] = useState<MfaMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<SetupStep>("idle");
  const [setupData, setSetupData] = useState<{ methodId: string; secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [disabling, setDisabling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const activeMfa = methods.find((m) => m.type === "totp" && m.status === "active");

  useEffect(() => {
    getMfaMethods()
      .then(setMethods)
      .catch(() => toast.error("Failed to load two-factor methods"))
      .finally(() => setLoading(false));
  }, []);

  async function startSetup() {
    setLoading(true);
    try {
      const data = await setupTotp();
      setSetupData(data);
      setStep("qr");
    } catch {
      toast.error("Failed to start setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!setupData || code.length < 6) return;
    setError("");
    setVerifying(true);
    try {
      const { recoveryCodes: codes } = await verifyTotp(setupData.methodId, code);
      setRecoveryCodes(codes);
      setStep("done");
      setMethods(await getMfaMethods());
      toast.success("Two-factor authentication enabled");
    } catch {
      setError("Incorrect code. Check your authenticator app and try again.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDisable() {
    if (!confirm("Disable two-factor authentication? This will reduce your account security.")) return;
    setDisabling(true);
    try {
      await disableMfa();
      setMethods(await getMfaMethods());
      setStep("idle");
      toast.success("Two-factor authentication disabled");
    } catch {
      toast.error("Failed to disable");
    } finally {
      setDisabling(false);
    }
  }

  function copySecret() {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner className="w-7 h-7 text-blue-600" /></div>;

  // ── Recovery codes ────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Save your recovery codes</h1>
          <p className="text-sm text-slate-500 mt-1.5">Store these somewhere safe. Each code can only be used once. They&apos;re your only way back in if you lose your authenticator app.</p>
        </div>

        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-[8px]">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">Save these now — they won&apos;t be shown again.</p>
        </div>

        <div className="bg-slate-900 rounded-[10px] p-4 sm:p-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {recoveryCodes.map((c) => (
            <code key={c} className="text-[11px] sm:text-xs text-slate-300 font-mono tracking-widest break-all">{c}</code>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="btn-primary"
            onClick={() => { navigator.clipboard.writeText(recoveryCodes.join("\n")); toast.success("Codes copied"); }}
          >
            <Copy size={14} /> Copy all codes
          </button>
          <button
            className="btn-secondary sm:!w-auto px-6"
            onClick={() => setStep("idle")}
          >
            I&apos;ve saved them
          </button>
        </div>
      </div>
    );
  }

  // ── Verify code ───────────────────────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Verify setup</h1>
          <p className="text-sm text-slate-500 mt-1.5">Enter the 6-digit code from your authenticator app to confirm.</p>
        </div>
        {error && (
          <div className="e-error">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <OtpInput value={code} onChange={setCode} length={6} disabled={verifying} />
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-primary" onClick={handleVerify} disabled={code.length < 6 || verifying}>
            {verifying ? <><Spinner /> Verifying…</> : "Verify and activate"}
          </button>
          <button className="btn-secondary sm:!w-auto px-6" onClick={() => setStep("qr")}>Back</button>
        </div>
      </div>
    );
  }

  // ── QR code ───────────────────────────────────────────────────────────────────
  if (step === "qr" && setupData) {
    return (
      <div className="max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Scan with authenticator</h1>
          <p className="text-sm text-slate-500 mt-1.5">Open Google Authenticator, Authy, or 1Password and scan this QR code.</p>
        </div>
        <div className="e-card p-6 flex flex-col items-center gap-5">
          <div className="p-3 bg-white border border-slate-200 rounded-[8px]">
            <QRCodeSVG value={setupData.otpauthUrl} size={180} />
          </div>
          <div className="w-full">
            <p className="text-xs text-slate-400 mb-2 text-center">Or enter the code manually</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[6px] px-3 py-2.5">
              <code className="flex-1 text-xs font-mono text-slate-600 break-all">{setupData.secret}</code>
              <button onClick={copySecret} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={() => setStep("verify")}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Idle ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Two-factor authentication</h1>
        <p className="text-sm text-slate-500 mt-1.5">Require a second verification step when signing in to protect your account.</p>
      </div>

      <div className="e-card overflow-hidden">
        <div className="px-5 py-5 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 ${activeMfa ? "bg-emerald-50" : "bg-slate-100"}`}>
            {activeMfa ? <ShieldCheck size={18} className="text-emerald-600" /> : <ShieldOff size={18} className="text-slate-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">Authenticator app</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeMfa ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {activeMfa ? "Active" : "Not set up"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeMfa
                ? `Enabled ${new Date(activeMfa.verifiedAt ?? activeMfa.createdAt).toLocaleDateString()}`
                : "Use Google Authenticator, Authy, 1Password, or any TOTP app"
              }
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          {activeMfa ? (
            <button onClick={handleDisable} disabled={disabling} className="btn-danger">
              {disabling ? <Spinner className="w-4 h-4" /> : <ShieldOff size={14} />}
              Disable two-factor authentication
            </button>
          ) : (
            <button onClick={startSetup} className="btn-primary max-w-xs">
              <KeyRound size={14} />
              Set up authenticator app
            </button>
          )}
        </div>
      </div>

      {activeMfa && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-[8px]">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Keep your recovery codes safe</p>
            <p className="text-xs mt-0.5 text-amber-700">If you lose your authenticator app, you&apos;ll need a recovery code to regain access.</p>
          </div>
        </div>
      )}
    </div>
  );
}
