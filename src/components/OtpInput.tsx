"use client";

import { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, "").slice(0, length).split("");

  function focus(index: number) {
    inputs.current[index]?.focus();
  }

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return;
    const next = digits.slice();
    next[index] = char.slice(-1);
    onChange(next.join("").trimEnd());
    if (char && index < length - 1) focus(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join("").trimEnd());
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focus(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-12 text-center text-lg font-semibold border border-slate-300 rounded-[6px]
            outline-none transition-all duration-150
            focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600
            disabled:bg-slate-50 disabled:cursor-not-allowed
            caret-transparent"
        />
      ))}
    </div>
  );
}
