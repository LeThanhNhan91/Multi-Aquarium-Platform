"use client";

import { useEffect, useState } from "react";

import { toastsState, listeners } from "@/hooks/use-toast";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>(toastsState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[300px] max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl shadow-lg border p-4 animate-in slide-in-from-top-5 ${
            toast.variant === "destructive"
              ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
              : "bg-white border-border dark:bg-gray-950"
          }`}
        >
          <div className="flex flex-col gap-1">
            <h3
              className={`text-sm font-semibold ${
                toast.variant === "destructive"
                  ? "text-red-900 dark:text-red-100"
                  : "text-foreground"
              }`}
            >
              {toast.title}
            </h3>
            {toast.description && (
              <p
                className={`text-xs ${
                  toast.variant === "destructive"
                    ? "text-red-700 dark:text-red-300"
                    : "text-muted-foreground"
                }`}
              >
                {toast.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// No need for local exports as we use shared state from use-toast.ts
