'use client';

import * as React from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

/* Domyślny czas komunikatu. Nie krócej niż 10 s: komunikaty po wysyłce mają
   ok. 20 słów (WCAG 2.2.1 – czas na przeczytanie); pauza, gdy kursor lub fokus
   jest na komunikacie. duration: Infinity – komunikat zostaje do zamknięcia. */
const DEFAULT_DURATION = 10000;

function ToastItem({ id, title, description, action, duration, dismiss, ...props }) {
  const [paused, setPaused] = React.useState(false);
  const ms = duration ?? DEFAULT_DURATION;

  React.useEffect(() => {
    if (paused || !Number.isFinite(ms)) return undefined;
    const timer = setTimeout(() => dismiss(id), ms);
    return () => clearTimeout(timer);
  }, [paused, ms, id, dismiss]);

  return (
    <Toast
      {...props}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {title && <ToastTitle>{title}</ToastTitle>}
      {description && <ToastDescription>{description}</ToastDescription>}
      {action}
      <ToastClose onClick={() => dismiss(id)} />
    </Toast>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  /* stała referencja – licznik w ToastItem nie startuje od nowa przy każdym renderze */
  const dismissRef = React.useRef(dismiss);
  dismissRef.current = dismiss;
  const onDismiss = React.useCallback((id) => dismissRef.current(id), []);

  return (
    <ToastViewport>
      {toasts
        .filter((t) => t.open !== false)
        .map(({ id, open: _open, onOpenChange: _onOpenChange, ...props }) => (
          <ToastItem key={id} id={id} dismiss={onDismiss} {...props} />
        ))}
    </ToastViewport>
  );
}
