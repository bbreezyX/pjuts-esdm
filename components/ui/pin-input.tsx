"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}: PinInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return; // Only allow digits

    const newValue = value.split("");
    newValue[index] = digit.slice(-1); // Take only last character
    const joined = newValue.join("").slice(0, length);
    onChange(joined);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    // Focus the input after the last pasted digit
    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={cn(
            "w-10 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border-2 bg-white transition-all duration-150",
            "focus:outline-none focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-300 bg-red-50 text-red-600 focus:border-red-400 animate-shake"
              : "border-slate-200 text-slate-900 hover:border-slate-300"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
