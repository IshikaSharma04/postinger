"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils/helpers";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

// ── Toast Types ───────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// ── Toast Context ─────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const fallbackToast: ToastContextValue = {
  toast: (opts) => {
    if (typeof window !== "undefined") console.info("[Toast]", opts);
  },
  success: (title, description) => {
    if (typeof window !== "undefined") console.info("[Toast:success]", title, description);
  },
  error: (title, description) => {
    if (typeof window !== "undefined") console.error("[Toast:error]", title, description);
  },
  warning: (title, description) => {
    if (typeof window !== "undefined") console.warn("[Toast:warning]", title, description);
  },
  info: (title, description) => {
    if (typeof window !== "undefined") console.info("[Toast:info]", title, description);
  },
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  return ctx ?? fallbackToast;
}

// ── Toast Provider (wraps children so context is available everywhere) ────────

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => removeToast(id), toast.duration ?? 4000);
  }, [removeToast]);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (title, description) => addToast({ type: "success", title, description }),
    error: (title, description) => addToast({ type: "error", title, description }),
    warning: (title, description) => addToast({ type: "warning", title, description }),
    info: (title, description) => addToast({ type: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Export Toaster component as well for compatibility
export function Toaster() {
  return null;
}

// ── Toast Item ────────────────────────────────────────────────────────────────

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};

const colorMap: Record<ToastType, string> = {
  success: "border-green-200/60 bg-white/95",
  error: "border-red-200/60 bg-white/95",
  warning: "border-amber-200/60 bg-white/95",
  info: "border-blue-200/60 bg-white/95",
};

const accentMap: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  }

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border backdrop-blur-sm p-3.5 shadow-xl transition-all duration-300 max-w-sm w-full",
        colorMap[toast.type],
        visible && !leaving ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"
      )}
      role="alert"
    >
      {/* Accent line */}
      <div className={cn("absolute left-0 top-2 bottom-2 w-0.5 rounded-full ml-0", accentMap[toast.type])} />
      <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
