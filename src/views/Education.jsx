'use client';

import React, { useState } from 'react';
import { GraduationCap, Award, Building2, HelpCircle, Check, ArrowRight, Sparkles, MapPin, Users, Calendar as CalendarIcon, BookOpen, CreditCard, Lock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const COURSES = [
  {
    id: "snb-expert",
    title: "Master Class „SNB EXPERT”",
    badge: "Poziom Zaawansowany",
    duration: "7 dni Online + 1 stacjonarny dzień",
    group: "Kameralna grupa: 3-4 osoby",
    price: 5000,
    priceFormatted: "5 000 PLN",
    deposit: 1000,
    depositFormatted: "1 000 PLN",
    requirement: "Minimum 1 rok ciągłego wykonania włosa maszynowego lub podwyższenie kwalifikacji po kursie u mnie",
    description: "Autorski Masterclass dla profesjonalistek pragnących dopracować najdrobniejsze detale w technice SuperNatural Brows.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop",
    availableDates: ["12-13 Października 2026", "04-05 Listopada 2026", "01-02 Grudnia 2026"]
  },
  {
    id: "supernatural-brows-pro",
    title: "Kurs dla Linergistek „SUPERNATURAL BROWS”",
    badge: "Podstawowy / Średniozaawansowany",
    duration: "14 dni Online + 2 stacjonarne dni",
    group: "Kameralna grupa: 2-4 osoby",
    price: 7000,
    priceFormatted: "7 000 PLN",
    deposit: 1500,
    depositFormatted: "1 500 PLN",
    requirement: "Dla osób wykonujących PMU w pudrze lub chcących zyskać pewność w pracy z włosem maszynowym",
    description: "Intensywne szkolenie łączące teorię online z głęboką praktyką na modelkach pod okiem Andriany.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
    availableDates: ["18-20 Października 2026", "10-12 Listopada 2026", "15-17 Grudnia 2026"]
  },
  {
    id: "basic-supernatural-brows",
    title: "Kurs od podstaw „BASIC SUPERNATURAL BROWS”",
    badge: "Poziom Od 0 Dla Początkujących",
    duration: "30 dni Online + 4 stacjonarne dni",
    group: "Kameralna grupa: 2-3 osoby",
    price: 15000,
    priceFormatted: "15 000 PLN",
    deposit: 3000,
    depositFormatted: "3 000 PLN",
    requirement: "Bez doświadczenia w PMU lub dla linergistek potrzebujących dużej ilości praktyki z nadzorem",
    description: "Najbardziej kompleksowy program od 0. Nauka anatomiczna, pigmenty, maszynki i praca na żywych modelkach.",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1000&auto=format&fit=crop",
    availableDates: ["25-29 Października 2026", "20-24 Listopada 2026"]
  },
  {
    id: "online-perfect-lips",
    title: "Kurs Online „PERFECT LIPS”",
    badge: "Dostęp Natychmiastowy",
    duration: "Ponad 20 Filmów Szkoleniowych",
    group: "Dostęp w dowolnym czasie i miejscu",
    price: 1500,
    priceFormatted: "1 500 PLN",
    deposit: 1500,
    depositFormatted: "1 500 PLN",
    requirement: "Każdy poziom zaawansowania",
    description: "Cała esencja wiedzy o naturalnej pigmentacji ust bez konturów w 20+ lekcjach wideo HD.",
    image: "https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?q=80&w=1000&auto=format&fit=crop",
    availableDates: ["Dostęp Od Razud po Zakupie"],
    isOnlineStore: true
  },
  {
    id: "szyty-na-miare",
    title: "Kurs „SZYTY NA MIARĘ”",
    badge: "Indywidualny VIP",
    duration: "Dopasowany Harmonogram",
    group: "Szkolenie 1-na-1 z Andrianą",
    price: 9000,
    priceFormatted: "Wycena Indywidualna",
    deposit: 2000,
    depositFormatted: "2 000 PLN",
    requirement: "Dopasowany budżet, strefa i technika",
    description: "Szkolenie spersonalizowane pod Twoje indywidualne potrzeby, luki w wiedzy lub wybraną strefę.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    availableDates: ["Termin Ustalany Indywidualnie"]
  }
];

const FAQ_ITEMS = [
  {
    q: "Czy po szkoleniu zacznę pracę z klientkami?",
    a: "Tak, właśnie po to stworzyliśmy unikatowy system szkolenia online + offline, aby na kursie głównie skupić się na praktyce i pokonać lęk przed pracą z klientami. Przy pierwszej modelce zrobisz pracę z moją delikatną pomocą, przy ostatniej wykonasz ją zupełnie samodzielnie!"
  },
  {
    q: "Czy podczas szkolenia można zakupić produkty, potrzebne do wykonywania zabiegu?",
    a: "Tak, oczywiście! Otrzymasz kod rabatowy na zakupy online, ale także można będzie zaopatrzyć się w niezbędne akcesoria od razu na miejscu. Jako nasza kursantka będziesz mieć znacznie atrakcyjniejsze ceny i moje rekomendacje, aby nie przepłacać."
  },
  {
    q: "Czy mogę skorzystać z dofinansowania na te szkolenia?",
    a: "Tak, jesteśmy zarejestrowani w RIS (Rejestr Instytucji Szkoleniowych), KFS (Krajowy Fundusz Szkoleniowy) oraz BUR (Baza Usług Rozwojowych). Wybierz dogodną dla Ciebie placówkę, udaj się po wiedzę i wymagania dla akceptacji Twojego wniosku do Urzędu Miasta/Pracy i niech Twój operator się z nami skontaktuje - udzielimy mu wszystkich niezbędnych informacji i dokumentów!"
  },
  {
    q: "Czy jest opieka po szkoleniu?",
    a: "Tak, będziemy w ciągłym kontakcie, bez ograniczeń i ramek czasowych! Nawet po kilku latach możesz nadal liczyć na moją pomoc, konsultacje prac i wsparcie w rozwoju."
  },
  {
    q: "Czy na szkoleniu będą inne osoby?",
    a: "Zdecydowanie tak, zawsze polecamy kursy grupowe (kameralne 2-4 osoby), ponieważ istnieje na nich zdrowa konkurencja, wesoły klimat, nowe znajomości, pomoc od innych kursantek i możliwość podzielenia się oraz pochwalenia swoimi postępami – a czasami nawet znalezienie wiernej koleżanki w branży PMU na długie lata!"
  }
];

const EVENT_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop", title: "Pokazy Masterclass na Świecie", desc: "Andriana jako Stage Prelegent" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop", title: "Gala Mistrzostw Świata", desc: "Statuetki za 1. Miejsce Włos Maszynowy" },
  { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop", title: "Praktyka na Modelkach w Babushkina Academy", desc: "Kameralne grupy pod nadzorem" }
];

export default function Education() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [paymentOption, setPaymentOption] = useState('deposit'); // 'deposit' or 'full'
  const [paymentMethod, setPaymentMethod] = useState('p24'); // 'p24', 'blik', 'card'
  const [step, setStep] = useState(1); // 1: Form, 2: Gateway Checkout, 3: Success Confirmation

  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    experience: ''
  });

  const openBookingModal = (course) => {
    setSelectedCourse(course);
    setSelectedDate(course.availableDates[0] || '');
    setStep(1);
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.phone || !studentForm.email) {
      toast({ title: "Uzupełnij dane", description: "Prosimy o podanie imienia, telefonu i e-maila.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSimulatePayment = () => {
    setStep(3);
    toast({
      title: "Płatność zrealizowana pomyślnie!",
      description: `Rezerwacja na ${selectedCourse?.title} została zarejestrowana. Potwierdzenie wysłano na ${studentForm.email}.`,
    });
  };

  const amountToPay = selectedCourse ? (paymentOption === 'deposit' ? selectedCourse.depositFormatted : selectedCourse.priceFormatted) : '0 PLN';

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Header Banner */}
      <div className="bg-[#2A2A2A] text-white py-2.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#B8C5A6]" />
        <span>Akademia PMU Babushkina Academy Warszawa – System Szkoleniowy Online + Offline</span>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge className="bg-[#B8C5A6] text-black hover:bg-[#a6b593] uppercase tracking-widest text-[10px] px-3 py-1">
              Akredytowane Centrum Szkoleniowe (RIS, KFS, BUR)
            </Badge>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 leading-tight">
              System Szkoleniowy Stworzony <span className="font-semibold block text-[#B8C5A6]">z Dbałością o Kursantów</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Nasze programy zawsze opierają się na dużej ilości praktyki, zniwelowaniu lęku pracy z klientami, poszerzeniu wiedzy oraz efektywnym zastosowaniu jej w pracy. Uczymy nie tylko jak zrobić jakościowy zabieg, ale też jak zrobić go <strong>szybko, komfortowo, bezboleśnie i bezpiecznie</strong>.
            </p>

            <div className="bg-[#F8F8F6] p-4 rounded-xl border border-gray-200 text-xs space-y-2 text-gray-700">
              <div className="flex items-center gap-2 font-semibold text-black">
                <Check className="w-4 h-4 text-[#B8C5A6]" />
                <span>Format Online + Offline dla Maksymalnej Efektywności</span>
              </div>
              <p>Teorię i przygotowanie przerabiasz w domu online, a podczas dni stacjonarnych pracujemy wyłącznie na żywych modelkach!</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button 
                onClick={() => document.getElementById('courses-list').scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#2A2A2A] hover:bg-black text-white px-8 py-6 rounded-none text-xs tracking-widest font-semibold uppercase"
              >
                Wybierz Szkolenie <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop" 
                alt="Szkolenia PMU Warszawa" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Offerings List */}
      <section id="courses-list" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A]">Programy Autorskie</Badge>
          <h2 className="text-3xl font-light">Oferty Szkoleniowe Babushkina Academy</h2>
          <p className="text-gray-500 text-sm">Zapisz się bezpośrednio przez kalendarz online z systemem płatności zadatku lub pełnej kwoty.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.map((c) => (
            <Card key={c.id} className="border border-gray-200 hover:border-[#B8C5A6] transition-all shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden rounded-2xl">
              <div>
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-3 left-3 bg-[#2A2A2A] text-white text-[10px] uppercase">{c.badge}</Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold leading-snug">{c.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#B8C5A6]" /> {c.duration}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{c.description}</p>
                  
                  <div className="bg-[#F8F8F6] p-3 rounded-lg space-y-1 text-xs">
                    <div className="font-semibold text-gray-900">Grupa & Wymagania:</div>
                    <div className="text-gray-600">{c.group}</div>
                    <div className="text-gray-500 italic mt-1">{c.requirement}</div>
                  </div>

                  {c.availableDates && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#B8C5A6]" /> Najbliższe terminy stacjonarne:
                      </span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {c.availableDates.map((d, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded border border-gray-200">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Inwestycja:</span>
                  <span className="text-xl font-bold text-[#2A2A2A]">{c.priceFormatted}</span>
                </div>

                {c.isOnlineStore ? (
                  <Button 
                    onClick={() => openBookingModal(c)}
                    className="w-full bg-[#B8C5A6] hover:bg-[#a6b593] text-black font-semibold text-xs tracking-wider uppercase py-5 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Kup Dostęp Online (1 500 PLN)
                  </Button>
                ) : (
                  <Button 
                    onClick={() => openBookingModal(c)}
                    className="w-full bg-[#2A2A2A] hover:bg-black text-white text-xs tracking-wider uppercase py-5"
                  >
                    Rezerwuj Termin & Płać Zadatek
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Gallery from Events and International Masterclasses */}
      <section className="bg-[#F8F8F6] py-20 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A]">Wydarzenia & Pokazy</Badge>
            <h2 className="text-3xl font-light">Zdjęcia z Międzynarodowych Wydarzeń</h2>
            <p className="text-gray-500 text-sm">Andriana Babushkina jako Prime Speaker na konferencjach i podium mistrzostw.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {EVENT_PHOTOS.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                  <p className="text-xs text-[#B8C5A6] font-medium mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Training Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Pytania i Odpowiedzi</Badge>
          <h2 className="text-3xl font-light">Najczęściej Zadawane Pytania Odnośnie Szkoleń</h2>
          <p className="text-gray-500 text-sm mt-2">Wszystko o organizacji, praktyce, dofinansowaniach RIS/KFS i opiece po kursie.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <AccordionItem key={idx} value={`s-faq-${idx}`} className="bg-white border border-gray-200 rounded-2xl px-6">
              <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-5 text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* INTERACTIVE BOOKING & PAYMENT GATEWAY DIALOG */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-[550px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>Rezerwacja Szkolenia PMU</span>
              <Badge className="bg-[#B8C5A6] text-black text-[10px]">{selectedCourse?.badge}</Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: Student Details & Calendar Slot */}
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="space-y-4 py-2">
              <div>
                <Label htmlFor="date-select" className="text-xs font-semibold">Wybierz Termin Zjazdu Stacjonarnego</Label>
                <select 
                  id="date-select"
                  className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B8C5A6]"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {selectedCourse?.availableDates.map((d, idx) => (
                    <option key={idx} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sname" className="text-xs font-semibold">Imię i Nazwisko Kursantki *</Label>
                <Input 
                  id="sname" 
                  required 
                  placeholder="np. Karolina Wiśniewska"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sphone" className="text-xs font-semibold">Telefon *</Label>
                  <Input 
                    id="sphone" 
                    required 
                    type="tel"
                    placeholder="+48 500 111 222"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="semail" className="text-xs font-semibold">Adres E-mail *</Label>
                  <Input 
                    id="semail" 
                    required 
                    type="email"
                    placeholder="karolina@example.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold block mb-2">Wybierz Wariant Płatności</Label>
                <RadioGroup value={paymentOption} onValueChange={setPaymentOption} className="grid grid-cols-2 gap-3">
                  <div className={`p-3 border rounded-xl cursor-pointer ${paymentOption === 'deposit' ? 'border-2 border-[#2A2A2A] bg-gray-50' : 'border-gray-200'}`}>
                    <RadioGroupItem value="deposit" id="opt-deposit" className="sr-only" />
                    <label htmlFor="opt-deposit" className="cursor-pointer block text-xs">
                      <span className="font-bold text-gray-900 block">Zadatek (Rezerwacja)</span>
                      <span className="text-[#B8C5A6] font-semibold text-sm">{selectedCourse?.depositFormatted}</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Gwarancja miejsca w grupie</span>
                    </label>
                  </div>
                  <div className={`p-3 border rounded-xl cursor-pointer ${paymentOption === 'full' ? 'border-2 border-[#2A2A2A] bg-gray-50' : 'border-gray-200'}`}>
                    <RadioGroupItem value="full" id="opt-full" className="sr-only" />
                    <label htmlFor="opt-full" className="cursor-pointer block text-xs">
                      <span className="font-bold text-gray-900 block">Pełna Kwota (100%)</span>
                      <span className="text-gray-900 font-semibold text-sm">{selectedCourse?.priceFormatted}</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Pełna opłata za kurs</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)}>
                  Anuluj
                </Button>
                <Button type="submit" className="bg-[#2A2A2A] hover:bg-black text-white">
                  Przejdź do Płatności ({amountToPay}) <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* STEP 2: Payment Gateway Simulator */}
          {step === 2 && (
            <div className="space-y-6 py-2">
              <div className="bg-[#F8F8F6] p-4 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500 block">Podsumowanie Rezerwacji:</span>
                  <strong className="text-gray-900">{selectedCourse?.title}</strong>
                  <div className="text-gray-500">Termin: {selectedDate}</div>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block">Kwota do zapłaty:</span>
                  <span className="text-lg font-bold text-[#2A2A2A]">{amountToPay}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold block">Wybierz Metodę Płatności (Pośrednik Płatności):</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('p24')} 
                    className={`p-3 border rounded-xl text-center text-xs font-bold transition-all ${paymentMethod === 'p24' ? 'border-2 border-[#2A2A2A] bg-gray-50' : 'border-gray-200'}`}
                  >
                    <span className="block text-red-600 font-black">Przelewy24</span>
                    <span className="text-[9px] text-gray-400 font-normal">Szybki przelew</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('blik')} 
                    className={`p-3 border rounded-xl text-center text-xs font-bold transition-all ${paymentMethod === 'blik' ? 'border-2 border-[#2A2A2A] bg-gray-50' : 'border-gray-200'}`}
                  >
                    <span className="block text-black font-black">BLIK</span>
                    <span className="text-[9px] text-gray-400 font-normal">Kod 6-cyfrowy</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('card')} 
                    className={`p-3 border rounded-xl text-center text-xs font-bold transition-all ${paymentMethod === 'card' ? 'border-2 border-[#2A2A2A] bg-gray-50' : 'border-gray-200'}`}
                  >
                    <span className="block text-blue-600 font-black">Karta / Visa</span>
                    <span className="text-[9px] text-gray-400 font-normal">Płatność kartą</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'blik' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  <Label htmlFor="blik-code" className="text-xs font-semibold">Wpisz kod BLIK (6 cyfr)</Label>
                  <Input id="blik-code" placeholder="777 888" maxLength={6} className="text-center text-lg tracking-widest font-mono font-bold" />
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Bezpieczne połączenie szyfrowane SSL 256-bit. Miejsce gwarantowane automatycznie po wpłacie.</span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Wstecz
                </Button>
                <Button onClick={handleSimulatePayment} className="bg-[#2A2A2A] hover:bg-black text-white">
                  Potwierdzam i Płacę {amountToPay}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Miejsce Zarezerwowane!</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Dziękujemy <strong>{studentForm.name}</strong>! Otrzymaliśmy wpłatę ({amountToPay}) na <strong>{selectedCourse?.title}</strong>.
              </p>
              <div className="bg-[#F8F8F6] p-4 rounded-xl text-left text-xs space-y-1 text-gray-700 max-w-sm mx-auto border border-gray-200">
                <div><strong>Termin:</strong> {selectedDate}</div>
                <div><strong>Lokalizacja:</strong> Babushkina Academy, Warszawa</div>
                <div><strong>Potwierdzenie E-mail:</strong> {studentForm.email}</div>
              </div>
              <Button onClick={() => setSelectedCourse(null)} className="bg-[#2A2A2A] text-white px-8 mt-4">
                Zamknij i Wróć do Strony
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

