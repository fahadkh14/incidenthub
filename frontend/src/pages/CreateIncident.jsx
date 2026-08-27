import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { incidentService, userService } from "../services/incidentService";
import { SEVERITIES, ENVIRONMENTS, CATEGORIES } from "../utils/constants";
import Card from "../components/Card";
import Button from "../components/Button";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../services/api";

const initialForm = {
  title: "",
  description: "",
  severity: "P3",
  category: "OTHER",
  environment: "PRODUCTION",
  service_name: "",
  assigned_to: "",
};

export default function CreateIncident() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [engineers, setEngineers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    userService
      .list()
      .then((res) => setEngineers(res.data.data.items))
      .catch(() => {});
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.title.trim().length > 200) errs.title = "Title must be under 200 characters";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, assigned_to: form.assigned_to || null };
      const res = await incidentService.create(payload);
      toast.success("Incident created successfully");
      navigate(`/incidents/${res.data.data.incident.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create incident"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-100">Create Incident</h1>
        <p className="text-sm text-slate-500">Report a new incident and get the right people looped in.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Checkout API returning elevated 5xx errors"
              className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Describe what's happening, impact, and any relevant context..."
              className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => set("severity", e.target.value)}
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
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Environment</label>
              <select
                value={form.environment}
                onChange={(e) => set("environment", e.target.value)}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
              >
                {ENVIRONMENTS.map((e2) => (
                  <option key={e2.value} value={e2.value}>
                    {e2.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Service Name</label>
              <input
                value={form.service_name}
                onChange={(e) => set("service_name", e.target.value)}
                placeholder="e.g. checkout-api"
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Assigned Engineer</label>
            <select
              value={form.assigned_to}
              onChange={(e) => set("assigned_to", e.target.value)}
              className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
            >
              <option value="">Unassigned</option>
              {engineers.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.name} ({eng.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t border-surface-700 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Incident
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
