"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent } from "@/i18n/client";
import common from "@/content/common";

/* Komunikat (toast) w stylu marki: prostokąt bez zaokrągleń i cieni, krem z linią
   1 px, tytuł w Bodoni 22 px, opis Jost 15 px. Stoi NA DOLE ekranu (na telefonie
   na całą szerokość, nad mobilnym paskiem CTA – src/index.css, data-toast-viewport;
   od sm w prawym dolnym rogu), więc nigdy nie zasłania nagłówka ani menu.
   Zamknięcie × 44 px zawsze widoczne; znika sam (Toaster – po 10 s, z pauzą,
   gdy kursor lub fokus jest na komunikacie). */

/* Wcześniej osobny kontener fixed – teraz jeden kontener (ToastViewport). */
const ToastProvider = ({ children }) => <>{children}</>;
ToastProvider.displayName = "ToastProvider";

/* Region na żywo (aria-live) istnieje od początku, więc nowy komunikat jest
   odczytywany przez czytniki ekranu. */
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    data-toast-viewport=""
    aria-live="polite"
    aria-relevant="additions text"
    className={cn(
      "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:left-auto sm:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "pointer-events-auto relative w-full rounded-none border p-5 pr-14 shadow-none data-[state=open]:animate-as-in",
  {
    variants: {
      variant: {
        default: "border-ink/15 bg-cream-50 text-ink",
        /* w palecie marki: ciemny komunikat zamiast czerwieni */
        destructive: "destructive border-espresso-900 bg-espresso-900 text-cream-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <li
      ref={ref}
      data-state="open"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn("as-btn-ghost mt-4 px-5 py-3", className)}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

/* Przycisk bez tekstu – nazwa dostępna „Zamknij” w języku strony (src/content/common).
   Pole 44 × 44 px, zawsze widoczny (na dotyku nie ma hover). */
const ToastClose = React.forwardRef(({ className, ...props }, ref) => {
  const t = useContent(common);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={t.close}
      className={cn(
        "absolute right-1 top-1 grid h-11 w-11 place-items-center text-current opacity-70 transition-opacity hover:opacity-100",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  );
});
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("font-display text-[1.375rem] leading-7", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-2 text-[0.9375rem] leading-[1.6] opacity-80", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
