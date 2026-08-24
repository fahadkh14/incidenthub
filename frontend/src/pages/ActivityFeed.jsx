import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { incidentService } from "../services/incidentService";
import { dashboardService } from "../services/incidentService";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/Skeleton";
import { timeAgo, formatDateTime } from "../utils/format";
import { useToast } from "../context/ToastContext";

export default function ActivityFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    dashboardService
      .get()
      .then((res) => {
        // Dashboard already aggregates recent activity; pull a slightly larger view here
        setItems(res.data.data.recent_activity || []);
      })
      .catch(() => toast.error("Could not load activity"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-100">Activity</h1>
        <p className="text-sm text-slate-500">A running log of everything happening across incidents.</p>
      </div>

      <Card className="p-5">
        {loading ? (
          <TableSkeleton rows={8} cols={1} />
        ) : items.length === 0 ? (
          <EmptyState title="No activity yet" description="Actions on incidents will show up here." />
        ) : (
          <ol className="relative space-y-5 border-l border-surface-700 pl-5">
            {items.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-accent-cyan ring-4 ring-surface-900" />
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-slate-100">{a.user?.name || "System"}</span>{" "}
                  {a.action.toLowerCase()}
                  {a.new_value ? ` → ${a.new_value}` : ""}
                </p>
                <Link
                  to={`/incidents/${a.incident_id}`}
                  className="text-xs font-medium text-accent-amber hover:underline"
                >
                  View incident
                </Link>
                <p className="text-xs text-slate-600">
                  {formatDateTime(a.created_at)} · {timeAgo(a.created_at)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
