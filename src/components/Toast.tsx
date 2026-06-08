"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // No-op fallback so callers don't crash outside a provider.
  return ctx ?? { toast: () => {} };
}

const STYLES: Record<ToastType, { bg: string; color: string; icon: string }> = {
  success: { bg: "#ECFDF3", color: "#027A48", icon: "✓" },
  error: { bg: "#FFECF1", color: "#E30045", icon: "!" },
  info: { bg: "#EAF1F7", color: "#305E82", icon: "i" },
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed flex flex-col"
        style={{ right: "24px", bottom: "24px", gap: "12px", zIndex: 11000, alignItems: "flex-end" }}
      >
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              className="flex items-center"
              style={{
                gap: "12px",
                minWidth: "260px",
                maxWidth: "360px",
                padding: "12px 16px",
                background: "#FFFFFF",
                border: "1px solid #F6F6F6",
                borderRadius: "12px",
                boxShadow: "0 12px 32px rgba(18,18,18,0.12)",
              }}
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{ width: "24px", height: "24px", borderRadius: "100%", background: s.bg, color: s.color, fontSize: "13px", fontWeight: 700 }}
              >
                {s.icon}
              </span>
              <span style={{ fontSize: "14px", lineHeight: "20px", color: "#121212" }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
