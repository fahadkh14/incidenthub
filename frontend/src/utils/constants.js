export const SEVERITIES = [
  { value: "P1", label: "P1 - Critical" },
  { value: "P2", label: "P2 - High" },
  { value: "P3", label: "P3 - Medium" },
  { value: "P4", label: "P4 - Low" },
];

export const STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "MITIGATED", label: "Mitigated" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export const ENVIRONMENTS = [
  { value: "PRODUCTION", label: "Production" },
  { value: "STAGING", label: "Staging" },
  { value: "DEVELOPMENT", label: "Development" },
];

export const CATEGORIES = [
  { value: "APPLICATION", label: "Application" },
  { value: "DATABASE", label: "Database" },
  { value: "NETWORK", label: "Network" },
  { value: "SECURITY", label: "Security" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "OTHER", label: "Other" },
];

export const SEVERITY_COLORS = {
  P1: "bg-severity-p1/15 text-severity-p1 border-severity-p1/30",
  P2: "bg-severity-p2/15 text-severity-p2 border-severity-p2/30",
  P3: "bg-severity-p3/15 text-severity-p3 border-severity-p3/30",
  P4: "bg-severity-p4/15 text-severity-p4 border-severity-p4/30",
};

export const STATUS_COLORS = {
  OPEN: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  INVESTIGATING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  MITIGATED: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  CLOSED: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};
