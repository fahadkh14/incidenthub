import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTree, PlusCircle, Activity, UserCircle, Siren } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/incidents", label: "Incidents", icon: ListTree },
  { to: "/incidents/new", label: "Create Incident", icon: PlusCircle },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-surface-950/70 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-surface-700 bg-surface-900 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-surface-700 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
            <Siren className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-slate-100">
            Incident<span className="text-accent-amber">Hub</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/incidents"}
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-amber/10 text-accent-amber"
                    : "text-slate-400 hover:bg-surface-800 hover:text-slate-200"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-surface-700 p-4">
          <p className="text-xs text-slate-600">IncidentHub v1.0.0</p>
          <p className="text-xs text-slate-600">Docker + Flask + React + MySQL</p>
        </div>
      </aside>
    </>
  );
}
