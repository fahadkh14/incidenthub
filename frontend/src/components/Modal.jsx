import { useEffect } from "react";
import { X } from "lucide-react";
export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-surface-600 bg-surface-900 shadow-2xl animate-[fadeIn_0.15s_ease-out]">
        <div className="flex items-center justify-between border-b border-surface-700 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-surface-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-surface-700 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
