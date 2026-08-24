import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/incidents?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-surface-700 bg-surface-950/80 px-4 backdrop-blur">
      <button
        onClick={onMenuClick}
        className="focus-ring rounded-lg p-2 text-slate-400 hover:bg-surface-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="focus-ring w-full rounded-lg border border-surface-600 bg-surface-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <button
          className="focus-ring relative rounded-lg p-2 text-slate-400 hover:bg-surface-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-amber" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-cyan/20 text-xs font-semibold text-accent-cyan">
              {initials(user?.name)}
            </div>
            <span className="hidden text-sm font-medium text-slate-300 sm:block">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-surface-600 bg-surface-800 py-1 shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-surface-700"
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-surface-700"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
