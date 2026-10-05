"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useContent } from "@/i18n/client"
import common from "@/content/common"

/* Dialog w stylu marki: kremowy panel bez zaokrągleń i cieni, przyciemnienie
   ink/45 z lekkim rozmyciem, tytuł w kroju display, opis w .as-caption, stopka z parą przycisków
   wyrównaną do lewej (najpierw główny). Widoki nie nadpisują tych klas.

   Warstwa z-[70]: nad przyklejonym nagłówkiem (z-50) i banerem cookies (z-[60]) –
   baner nie zasłania przycisków dialogu; pod komunikatem (toast, z-[100]).

   Ruch: samo zanikanie 200 ms (animate-as-in / as-out) – bez powiększania
   i wjazdu. Telefon (< sm): arkusz przyklejony do dołu ekranu, na całą
   szerokość, najwyżej 92 % wysokości (svh – bez chowania się pod paskiem
   adresu). Od sm: panel wyśrodkowany, najwyżej 90 % wysokości.

   Panel sam się przewija (widoki wołają ref.scrollTo / focus na DialogContent).
   Przycisk × jest przyklejony do górnej krawędzi przewijanego panelu – nie
   znika przy przewijaniu. DialogFooter jest przyklejony do dolnej krawędzi
   (sticky), więc przycisk główny – i drugi przycisk stopki (Anuluj / Wróć),
   który zamyka dialog – są zawsze w kadrze, w zasięgu kciuka. Stopka przykleja się w obrębie swojego RODZICA: postawiona
   bezpośrednio w DialogContent – przez cały panel; w <form> – dopóki formularz
   jest w kadrze. Nie zamykać jej w dodatkowym <div> z treścią. */

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-as-in data-[state=closed]:animate-as-out",
      className
    )}
    {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  /* „Zamknij” w języku strony (src/content/common) */
  const t = useContent(common)
  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        /* telefon: arkusz od dołu */
        "fixed inset-x-0 bottom-0 z-[70] flex max-h-[92vh] w-full flex-col overflow-y-auto overscroll-contain scroll-pt-[3.25rem] scroll-pb-[6.5rem] rounded-none border-t border-ink/15 bg-cream-50 px-5 pb-6 pt-6 text-ink shadow-none supports-[height:1svh]:max-h-[92svh] [&>*]:shrink-0",
        /* od sm: panel wyśrodkowany */
        "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-[560px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:px-10 sm:pb-10 sm:pt-10 sm:supports-[height:1svh]:max-h-[90svh]",
        "data-[state=open]:animate-as-in data-[state=closed]:animate-as-out",
        className
      )}
      {...props}>
      {children}
      {/* × przyklejony 8 px od górnej krawędzi panelu. Sticky liczy się od krawędzi
          TREŚCI (bez paddingu 24/40 px), stąd ujemne top = −(padding − 8 px).
          W DOM na końcu (kolejność Tab i fokus startowy jak dotąd), wizualnie
          pierwszy (order-first); zajmuje 0 px w przepływie (ujemne marginesy),
          więc tytuł stoi obok niego. */}
      <div className="pointer-events-none sticky -top-4 z-20 order-first -mb-7 -mr-3 -mt-4 flex justify-end sm:-top-8 sm:-mb-3 sm:-mr-8 sm:-mt-8">
        <DialogPrimitive.Close
          className="pointer-events-auto grid h-11 w-11 scroll-mt-[-3.25rem] place-items-center bg-cream-50 text-ink/70 transition-colors hover:text-ink disabled:pointer-events-none">
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{t.close}</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-3 text-left", className)}
    {...props} />
)
DialogHeader.displayName = "DialogHeader"

/* Stopka przyklejona do dołu przewijanego panelu (patrz komentarz u góry):
   pełna szerokość panelu (ujemne marginesy = padding panelu), kremowe tło,
   linia u góry. Sticky liczy się od krawędzi TREŚCI, więc bottom = −padding
   panelu (24/40 px) – stopka dochodzi do samej krawędzi, treść nie prześwituje
   pod nią. Telefon: przyciski rozciągnięte (para w jednym rzędzie od 320 px
   przy krótkich etykietach, inaczej jeden pod drugim), węższy padding przycisków. */
const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "sticky -bottom-6 z-10 -mx-5 !mt-8 flex flex-wrap gap-3 border-t border-ink/10 bg-cream-50 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 max-sm:[&>*]:grow max-sm:[&>*]:px-5 sm:-bottom-10 sm:-mx-10 sm:gap-4 sm:px-10 sm:pb-4",
      className
    )}
    {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("pr-10 font-display text-2xl font-normal leading-tight tracking-normal text-ink sm:text-[1.75rem]", className)}
    {...props} />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("as-caption max-w-none", className)}
    {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
