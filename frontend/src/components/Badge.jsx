import React from "react";
import { SEVERITY_COLORS, STATUS_COLORS } from "../utils/constants";

export function SeverityBadge({ severity }) {
  const cls = SEVERITY_COLORS[severity] || "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium font-mono ${cls}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-md border border-surface-600 bg-surface-800 px-2 py-0.5 text-xs font-medium text-slate-300 ${className}`}>
      {children}
    </span>
  );
}
