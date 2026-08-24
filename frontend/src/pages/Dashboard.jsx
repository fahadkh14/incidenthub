import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CircleDot,
  Search as SearchIcon,
  CheckCircle2,
  ListTree,
  PlusCircle,
} from "lucide-react";
import { dashboardService } from "../services/incidentService";
import Card from "../components/Card";
import { CardSkeleton } from "../components/Skeleton";
import { SeverityBadge, StatusBadge } from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { timeAgo } from "../utils/format";
import { useToast } from "../context/ToastContext";

const STAT_CARDS = [
  { key: "total_incidents", label: "Total Incidents", icon: ListTree, color: "text-accent-cyan" },
  { key: "open_incidents", label: "Open Incidents", icon: CircleDot, color: "text-rose-400" },
  { key: "critical_incidents", label: "Critical (P1)", icon: AlertTriangle, color: "text-severity-p1" },
  { key: "investigating_incidents", label: "Investigating", icon: SearchIcon, color: "text-amber-400" },
  { key: "resolved_incidents", label: "Resolved", icon: CheckCircle2, color: "text-emerald-400" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    dashboardService
      .get()
      .then((res) => {
        if (mounted) setData(res.data.data);
      })
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">Operations Dashboard</h1>
          <p className="text-sm text-slate-500">A live view of everything happening across your services.</p>
        </div>
        <Link to="/incidents/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Incident
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
              <Card key={key} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="mt-2 font-display text-3xl font-semibold text-slate-100">
                  {data?.stats?.[key] ?? 0}
                </p>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-base font-semibold text-slate-100">Recent Incidents</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-700/50" />
              ))}
            </div>
          ) : data?.recent_incidents?.length ? (
            <div className="space-y-2">
              {data.recent_incidents.map((incident) => (
                <Link
                  key={incident.id}
                  to={`/incidents/${incident.id}`}
                  className="focus-ring flex items-center justify-between gap-3 rounded-lg border border-surface-700 p-3 hover:border-surface-600 hover:bg-surface-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{incident.title}</p>
                    <p className="font-mono text-xs text-slate-500">{incident.incident_number}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No incidents yet" description="Create your first incident to see it here." />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-slate-100">Recent Activity</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-surface-700/50" />
              ))}
            </div>
          ) : data?.recent_activity?.length ? (
            <ul className="space-y-3">
              {data.recent_activity.map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-amber" />
                  <div>
                    <p className="text-slate-300">
                      <span className="font-medium text-slate-100">{a.user?.name || "System"}</span>{" "}
                      {a.action.toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-600">{timeAgo(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No activity yet" />
          )}
        </Card>
      </div>

      {!loading && data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold text-slate-100">Severity Distribution</h2>
            <div className="space-y-3">
              {Object.entries(data.severity_distribution).map(([sev, count]) => {
                const total = Object.values(data.severity_distribution).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={sev}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400">{sev}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
                      <div
                        className="h-full rounded-full bg-accent-amber transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold text-slate-100">Status Distribution</h2>
            <div className="space-y-3">
              {Object.entries(data.status_distribution).map(([status, count]) => {
                const total = Object.values(data.status_distribution).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{status}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
                      <div
                        className="h-full rounded-full bg-accent-cyan transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
