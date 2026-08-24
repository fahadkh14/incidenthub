import React from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-accent-amber text-surface-950 hover:bg-amber-400 shadow-glow",
  secondary: "bg-surface-700 text-slate-200 hover:bg-surface-600 border border-surface-600",
  ghost: "bg-transparent text-slate-300 hover:bg-surface-800",
  danger: "bg-rose-600/90 text-white hover:bg-rose-500",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
