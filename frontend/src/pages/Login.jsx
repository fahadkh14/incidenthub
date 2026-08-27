import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Siren } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: "admin@incidenthub.local", password: "Admin123!" },
      engineer: { email: "engineer@incidenthub.local", password: "Engineer123!" },
      viewer: { email: "viewer@incidenthub.local", password: "Viewer123!" },
    };
    setForm(creds[role]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber">
            <Siren className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">
            Incident<span className="text-accent-amber">Hub</span>
          </h1>
          <p className="text-sm text-slate-500">Sign in to your operations console</p>
        </div>

        <div className="rounded-xl border border-surface-700 bg-surface-900/60 p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
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
                className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-5 border-t border-surface-700 pt-4">
            <p className="mb-2 text-center text-xs text-slate-500">Try a demo account</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo("admin")} className="focus-ring flex-1 rounded-lg border border-surface-600 py-1.5 text-xs text-slate-400 hover:bg-surface-800">
                Admin
              </button>
              <button onClick={() => fillDemo("engineer")} className="focus-ring flex-1 rounded-lg border border-surface-600 py-1.5 text-xs text-slate-400 hover:bg-surface-800">
                Engineer
              </button>
              <button onClick={() => fillDemo("viewer")} className="focus-ring flex-1 rounded-lg border border-surface-600 py-1.5 text-xs text-slate-400 hover:bg-surface-800">
                Viewer
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-accent-amber hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
