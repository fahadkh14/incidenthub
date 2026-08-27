import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PlusCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { incidentService } from "../services/incidentService";
import { SEVERITIES, STATUSES, ENVIRONMENTS, CATEGORIES } from "../utils/constants";
import { SeverityBadge, StatusBadge } from "../components/Badge";
import Card from "../components/Card";
import Button from "../components/Button";
import { TableSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { formatDateTime } from "../utils/format";
import { useToast } from "../context/ToastContext";

export default function IncidentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      severity: searchParams.get("severity") || "",
      status: searchParams.get("status") || "",
      environment: searchParams.get("environment") || "",
      category: searchParams.get("category") || "",
      page: parseInt(searchParams.get("page") || "1", 10),
    }),
    [searchParams]
  );

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  useEffect(() => {
    let cancelled = false;

    const loadIncidents = async () => {
      try {
        const res = await incidentService.list({
          search: filters.search || undefined,
          severity: filters.severity || undefined,
          status: filters.status || undefined,
          environment: filters.environment || undefined,
          category: filters.category || undefined,
          page: filters.page,
          per_page: 10,
        });

        if (!cancelled) {
          setItems(res.data.data.items);
          setPagination(res.data.data);
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load incidents");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIncidents();

    return () => {
      cancelled = true;
    };
  }, [
    filters.search,
    filters.severity,
    filters.status,
    filters.environment,
    filters.category,
    filters.page,
    toast,
  ]);

  const hasFilters = filters.search || filters.severity || filters.status || filters.environment || filters.category;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">Incidents</h1>
          <p className="text-sm text-slate-500">{pagination.total} total incidents tracked</p>
        </div>
        <Link to="/incidents/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create Incident
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search by title, number, or service..."
            className="focus-ring min-w-[220px] flex-1 rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <select
            value={filters.severity}
            onChange={(e) => updateFilter("severity", e.target.value)}
            className="focus-ring rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-300"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="focus-ring rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-300"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={filters.environment}
            onChange={(e) => updateFilter("environment", e.target.value)}
            className="focus-ring rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-300"
          >
            <option value="">All Environments</option>
            {ENVIRONMENTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="focus-ring rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-300"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="focus-ring flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No incidents found"
            description="Try adjusting your filters, or create a new incident."
            action={
              <Link to="/incidents/new">
                <Button variant="secondary">Create Incident</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-700 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Incident</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Environment</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((incident) => (
                  <tr key={incident.id} className="border-b border-surface-800 hover:bg-surface-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{incident.incident_number}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-200">{incident.title}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={incident.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{incident.service_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{incident.environment}</td>
                    <td className="px-4 py-3 text-slate-400">{incident.assignee?.name || "Unassigned"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(incident.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/incidents/${incident.id}`} className="text-xs font-medium text-accent-amber hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-700 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.total_pages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => updateFilter("page", String(filters.page - 1))}
                className="focus-ring rounded-lg border border-surface-600 p-1.5 text-slate-400 hover:bg-surface-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={filters.page >= pagination.total_pages}
                onClick={() => updateFilter("page", String(filters.page + 1))}
                className="focus-ring rounded-lg border border-surface-600 p-1.5 text-slate-400 hover:bg-surface-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}