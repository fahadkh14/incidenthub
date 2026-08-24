import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Trash2,
  Clock,
  User as UserIcon,
  Server,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { incidentService, userService } from "../services/incidentService";
import { SEVERITIES, STATUSES } from "../utils/constants";
import { SeverityBadge, StatusBadge } from "../components/Badge";
import Card from "../components/Card";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import { CardSkeleton } from "../components/Skeleton";
import { formatDateTime, timeAgo, initials } from "../utils/format";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../services/api";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const [resolution, setResolution] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, commentsRes, activityRes] = await Promise.all([
        incidentService.get(id),
        incidentService.listComments(id),
        incidentService.listActivity(id),
      ]);
      setIncident(incRes.data.data.incident);
      setResolution(incRes.data.data.incident.resolution || "");
      setComments(commentsRes.data.data.items);
      setActivity(activityRes.data.data.items);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not load incident"));
      navigate("/incidents");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    userService
      .list()
      .then((res) => setEngineers(res.data.data.items))
      .catch(() => {});
  }, []);

  const updateField = async (field, value) => {
    setSavingField(field);
    try {
      const res = await incidentService.update(id, { [field]: value });
      setIncident(res.data.data.incident);
      toast.success("Incident updated");
      const activityRes = await incidentService.listActivity(id);
      setActivity(activityRes.data.data.items);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update incident"));
    } finally {
      setSavingField(null);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await incidentService.addComment(id, commentText.trim());
      setComments((c) => [...c, res.data.data.comment]);
      setCommentText("");
      const activityRes = await incidentService.listActivity(id);
      setActivity(activityRes.data.data.items);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not add comment"));
    } finally {
      setPostingComment(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await incidentService.remove(id);
      toast.success("Incident deleted");
      navigate("/incidents");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete incident"));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/incidents")}
        className="focus-ring flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to incidents
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-500">{incident.incident_number}</p>
          <h1 className="font-display text-2xl font-semibold text-slate-100">{incident.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 font-display text-base font-semibold text-slate-100">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-400">{incident.description || "No description provided."}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold text-slate-100">Activity Timeline</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-surface-700 pl-5">
                {activity.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-accent-amber ring-4 ring-surface-900" />
                    <p className="text-sm font-medium text-slate-200">{a.action}</p>
                    {(a.old_value || a.new_value) && (
                      <p className="text-xs text-slate-500">
                        {a.old_value && <span className="line-through">{a.old_value}</span>}{" "}
                        {a.old_value && a.new_value && "→"} {a.new_value}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-600">
                      {a.user?.name || "System"} · {timeAgo(a.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold text-slate-100">
              Comments ({comments.length})
            </h2>
            <div className="mb-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet. Be the first to add context.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-semibold text-accent-cyan">
                      {initials(c.user?.name)}
                    </div>
                    <div className="flex-1 rounded-lg border border-surface-700 bg-surface-800/50 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-200">{c.user?.name || "Unknown"}</span>
                        <span className="text-xs text-slate-600">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-400">{c.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="focus-ring flex-1 rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
              />
              <Button type="submit" loading={postingComment} disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-semibold text-slate-100">Details</h2>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Layers className="h-3.5 w-3.5" /> Status
              </label>
              <select
                value={incident.status}
                disabled={savingField === "status"}
                onChange={(e) => updateField("status", e.target.value)}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Severity
              </label>
              <select
                value={incident.severity}
                disabled={savingField === "severity"}
                onChange={(e) => updateField("severity", e.target.value)}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <UserIcon className="h-3.5 w-3.5" /> Assigned Engineer
              </label>
              <select
                value={incident.assigned_to || ""}
                disabled={savingField === "assigned_to"}
                onChange={(e) => updateField("assigned_to", e.target.value || null)}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
              >
                <option value="">Unassigned</option>
                {engineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.name}
                  </option>
                ))}
              </select>
            </div>

            <dl className="space-y-2.5 border-t border-surface-700 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Server className="h-3.5 w-3.5" /> Service
                </dt>
                <dd className="text-slate-300">{incident.service_name || "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Environment</dt>
                <dd className="text-slate-300">{incident.environment}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Category</dt>
                <dd className="text-slate-300">{incident.category}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Created by</dt>
                <dd className="text-slate-300">{incident.creator?.name || "—"}</dd>
              </div>
              <div className="flex items-center gap-1.5 justify-between">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> Created
                </dt>
                <dd className="text-slate-300">{formatDateTime(incident.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Updated</dt>
                <dd className="text-slate-300">{formatDateTime(incident.updated_at)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Resolved</dt>
                <dd className="text-slate-300">{formatDateTime(incident.resolved_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="flex items-center gap-1.5 font-display text-base font-semibold text-slate-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Resolution
            </h2>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              placeholder="Document the root cause and fix..."
              className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
            />
            <Button
              variant="secondary"
              className="w-full"
              loading={savingField === "resolution"}
              onClick={() => updateField("resolution", resolution)}
            >
              Save Resolution
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this incident?"
        message={`This will permanently delete ${incident.incident_number} and all of its comments and activity. This action cannot be undone.`}
        confirmLabel="Delete Incident"
        danger
        loading={deleting}
      />
    </div>
  );
}
