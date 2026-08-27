import { Link } from "react-router-dom";
import { AlertOctagon } from "lucide-react";
import Button from "../components/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-950 px-4 text-center">
      <AlertOctagon className="h-10 w-10 text-accent-amber" />
      <h1 className="font-display text-3xl font-semibold text-slate-100">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
