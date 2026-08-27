import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Siren } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ENGINEER" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password || form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password, form.role);
    setLoading(false);
    if (result.success) {
      toast.success("Account created — welcome to IncidentHub");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber">
            <Siren className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-500">Join the IncidentHub operations team</p>
        </div>

        <div className="rounded-xl border border-surface-700 bg-surface-900/60 p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
                placeholder="Jordan Rivera"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
                placeholder="you@company.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
                placeholder="At least 8 characters"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200"
              >
                <option value="ENGINEER">Engineer</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent-amber hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
