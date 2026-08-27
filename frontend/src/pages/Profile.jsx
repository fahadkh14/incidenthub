import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { Badge } from "../components/Badge";
import { initials, formatDateTime } from "../utils/format";
import { Mail, Shield, CalendarClock } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-100">Profile</h1>
        <p className="text-sm text-slate-500">Your account details.</p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/20 text-lg font-semibold text-accent-cyan">
            {initials(user?.name)}
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100">{user?.name}</h2>
            <Badge>{user?.role}</Badge>
          </div>
        </div>

        <dl className="space-y-4 border-t border-surface-700 pt-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <dt className="w-28 text-slate-500">Email</dt>
            <dd className="text-slate-300">{user?.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-slate-500" />
            <dt className="w-28 text-slate-500">Role</dt>
            <dd className="text-slate-300">{user?.role}</dd>
          </div>
          <div className="flex items-center gap-3">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            <dt className="w-28 text-slate-500">Joined</dt>
            <dd className="text-slate-300">{formatDateTime(user?.created_at)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
