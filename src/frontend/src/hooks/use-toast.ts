import { useCallback } from "react";

type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface Toast extends ToastOptions {
  id: string;
}

export let toastsState: Toast[] = [];
export const listeners: Array<(toasts: Toast[]) => void> = [];

export const notify = (toasts: Toast[]) => {
  listeners.forEach((listener) => listener(toasts));
};

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...options, id };

    toastsState = [...toastsState, newToast];
    notify(toastsState);

    setTimeout(() => {
      toastsState = toastsState.filter((t) => t.id !== id);
      notify(toastsState);
    }, 5000);
  }, []);

  return { toast };
}
