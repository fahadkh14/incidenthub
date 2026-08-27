import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  const iconFor = (type) => {
    if (type === "success") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    }

    if (type === "error") {
      return <XCircle className="h-5 w-5 text-rose-400" />;
    }

    return <Info className="h-5 w-5 text-accent-cyan" />;
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-lg border border-surface-600 bg-surface-800/95 px-4 py-3 shadow-lg backdrop-blur animate-[fadeIn_0.15s_ease-out]"
          >
            {iconFor(t.type)}

            <p className="flex-1 text-sm text-slate-200">{t.message}</p>

            <button
              onClick={() => remove(t.id)}
              className="focus-ring rounded text-slate-500 hover:text-slate-300"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return ctx;
}