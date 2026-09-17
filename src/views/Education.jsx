import React, { useState } from 'react';
import { GraduationCap, Award, Building2, HelpCircle, Check, ArrowRight, Sparkles, MapPin, Users, Calendar, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const COURSES = [
  {
    id: "basic-pmu",
    title: "Szkolenie PMU od Podstaw – Basic Master",
    duration: "4 Dni (40 Godzin)",
    level: "Dla początkujących",
    price: "6 500 PLN",
    badge: "Certyfikat IES",
    description: "Kompleksowe szkolenie z pigmentacji brwi (Ombre/Powder), ust oraz kresek na powiekach. 80% zajęć praktycznych na modelkach.",
    topics: [
      "Anatomia skóry i teoria kolorymetrii PMU",
      "Dobór barwników mineralnych AS OPIUM pod fototyp skóry",
      "Praca maszynkami bezprzewodowymi AS HERO",
      "Wykończenie rysunku wstępnego geometrią brwi"
    ]
  },
  {
    id: "master-hairstrokes",
    title: "Masterclass: Hairstrokes & Mikropigmentacja Włoskowa",
    duration: "2 Dni (16 Godzin)",
    level: "Dla zaawansowanych",
    price: "4 200 PLN",
    badge: "Advanced Level",
    description: "Autorska technika tworzenia ultra-realistycznych włosków przy użyciu maszynki rotacyjnej z precyzyjnym skokiem 2.1mm.",
    topics: [
      "Układy włosowe i fizjologiczna układanka brwi",
      "Technika lekkiej ręki i uniknięcie podskórnego rozlania barwnika",
      "Pigmentacja brwi męskich i z ubytkami po chorobach",
      "Certyfikacja i zestaw startowy barwników w cenie"
    ]
  },
  {
    id: "medical-areola",
    title: "Pigmentacja Medyczna Areola & Kamuflaż Blizn",
    duration: "2 Dni (16 Godzin)",
    level: "Specjalizacja Medyczna",
    price: "4 900 PLN",
    badge: "Medyczny PMU",
    description: "Zabiegi rekonstrukcji trójwymiarowej otoczki brodawki piersiowej po zabiegach mastektomii oraz kamuflaż blizn operacyjnych.",
    topics: [
      "Medyczne aspekty pigmentacji i praca na tkance bliznowatej",
      "Tworzenie efektu 3D i cieniowania przestrzennego",
      "Stosowanie barwników z linii Medical Grade",
      "Współpraca z chirurgami i klinikami estetycznymi"
    ]
  }
];

const FAQ_ITEMS = [
  {
    q: "Czym różnią się pigmenty mineralne AS OPIUM Light Minerals od tradycyjnych organicznych?",
    a: "Pigmenty mineralne bazują na tlenkach żelaza. Ich cząsteczki są delikatniejsze dla układu odpornościowego skóry, co sprawia, że po okresie 1.5 - 2 lat wyłuszczają się w sposób naturalny i równomierny, nie zmieniając barwy na fioletową czy czerwoną."
  },
  {
    q: "Czy maszynki AS PRINCESS posiadają uniwersalne złącze do kartridży?",
    a: "Tak, maszynki AS HERO oraz AS PRINCESS są w pełni kompatybilne ze wszystkimi sterylnymi kartridżami z uniwersalnym systemem wkręcano-wciskowym (membranowym), w tym z dedykowaną linią kartridży Satellite."
  },
  {
    q: "Jakie warunki trzeba spełnić, aby dołączyć do Programu Ambasadorki AS LOVELINESS?",
    a: "Program skierowany jest do aktywnych zawodowo linergistek, które ukończyły szkolenia z technik PMU oraz pracują na maszynkach i barwnikach AS PIGMENTS. Ambasadorki otrzymują specjalne rabaty hurtowe, dostęp do przedpremierowych produktów oraz promocję na naszych profilach social media."
  },
  {
    q: "Na czym polega wynajem gabinetu/stanowiska w Katowicach?",
    a: "Oferujemy nowocześnie urządzony koworking kosmetyczny przy ul. Bażantów 35 w Katowicach. Do dyspozycji masz w pełni wyposażone stanowisko zabiegowe z autoklawem, autorskim oświetleniem oraz zapleczem sanitarnym."
  }
];

export default function Education() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollForm, setEnrollForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Zgłoszenie na szkolenie przyjęte!",
      description: `Dziękujemy ${enrollForm.name}. Zarezerwowaliśmy wstępnie miejsce na ${selectedCourse?.title}. Dział szkoleń skontaktuje się z Tobą w ciągu 24h.`,
    });
    setSelectedCourse(null);
    setEnrollForm({ name: '', phone: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Header Banner */}
      <div className="bg-[#2A2A2A] text-white py-2.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#B8C5A6]" />
        <span>Akademia PMU AS LOVELINESS Katowice – Zapisy na Szkolenia 2026 Otwarte</span>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-[#B8C5A6] text-black hover:bg-[#a6b593] uppercase tracking-widest text-[10px] px-3 py-1 mb-4">
              Certyfikowane Centrum Szkoleniowe
            </Badge>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-6 leading-tight">
              Edukacja & Rozwój Kompetencji <span className="font-semibold block text-[#B8C5A6]">W Makijażu Permanentnym</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              Podnieś swoje umiejętności na wyższy poziom pod okiem mistrzyń PMU. Oferujemy szkolenia podstawowe, zaawansowane masterclass oraz autorski program ambasadorski.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#2A2A2A] hover:bg-black text-white px-8 py-6 rounded-none text-sm tracking-widest font-medium"
              >
                ZOBACZ PROGRAMY SZKOLEŃ <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop" 
                alt="Akademia PMU Szkolenie" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses List */}
      <section id="courses" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Akademia AS</Badge>
          <h2 className="text-3xl font-light mb-3">Programy Szkoleniowe 2026</h2>
          <p className="text-gray-500 text-sm">Zapewniamy kameralne grupy (max 4 osoby), pełne wyposażenie stanowisk oraz certyfikat w języku polskim i angielskim.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COURSES.map((course) => (
            <Card key={course.id} className="border border-gray-200 hover:border-[#B8C5A6] transition-all shadow-sm hover:shadow-lg flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-[#B8C5A6] text-black text-[10px] uppercase">
                      {course.badge}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-500">{course.duration}</span>
                  </div>
                  <CardTitle className="text-lg font-bold leading-snug">{course.title}</CardTitle>
                  <CardDescription className="text-xs text-[#2A2A2A] font-medium">{course.level}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{course.description}</p>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2">Program obejmuje:</p>
                    <ul className="space-y-1.5">
                      {course.topics.map((topic, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#B8C5A6] mt-0.5 flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0 flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Inwestycja:</span>
                  <span className="text-xl font-bold text-[#2A2A2A]">{course.price}</span>
                </div>
                <Button 
                  onClick={() => setSelectedCourse(course)}
                  className="w-full bg-[#2A2A2A] hover:bg-black text-white text-xs tracking-wider uppercase py-5"
                >
                  Zapisz się na Szkolenie
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Ambassador & Coworking Section */}
      <section className="bg-[#F8F8F6] py-20 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Ambassador */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A] mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light mb-4">Program "Ambasadorki AS LOVELINESS"</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Dołącz do prestiżowego kręgu ambasadorek marki w Polsce. Zyskaj preferencyjne warunki zakupu barwników, udział w sesjach zdjęciowych oraz wsparcie marketingowe w budowaniu Twojej marki osobistej.
              </p>
              <ul className="space-y-2 text-xs text-gray-600 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B8C5A6]" /> Rabaty hurtowe do -35% na asortyment</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B8C5A6]" /> Dedykowane szkolenia z nowości produktowych</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#B8C5A6]" /> Oficjalny certyfikat Ambasadorki AS PIGMENTS</li>
              </ul>
            </div>
            <Button 
              onClick={() => {
                toast({
                  title: "Wniosek Ambasadorski",
                  description: "Skontaktuj się z nami mailowo: biuro@as-loveliness.eu dołączając portfolio prac.",
                });
              }}
              variant="outline" 
              className="border-[#2A2A2A] text-[#2A2A2A] hover:bg-gray-50 uppercase text-xs tracking-wider py-5"
            >
              Aplikuj do Programu
            </Button>
          </div>

          {/* Coworking Katowice */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A] mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light mb-4">Koworking Kosmetyczny w Katowicach</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Wynajmij profesjonalne, w pełni wyposażone stanowisko zabiegowe lub gabinet w Katowicach przy ul. Bażantów 35. Idealne rozwiązanie dla niezależnych linergistek.
              </p>
              <div className="bg-[#F8F8F6] p-4 rounded-xl text-xs space-y-2 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-[#B8C5A6]" />
                  <span>Katowice, ul. Bażantów 35 (kompleks medyczny)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#B8C5A6]" />
                  <span>Wynajem na dni, tygodnie lub w modelu abonamentowym</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => {
                toast({
                  title: "Zapytanie o Wynajem Stanowiska",
                  description: "Zadzwoń do menedżera obiektu: +48 32 400 50 60",
                });
              }}
              className="bg-[#2A2A2A] hover:bg-black text-white uppercase text-xs tracking-wider py-5"
            >
              Rezerwuj Stanowisko
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Knowledge Base Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Baza Wiedzy</Badge>
          <h2 className="text-3xl font-light mb-3">Najczęściej Zadawane Pytania (FAQ)</h2>
          <p className="text-gray-500 text-sm">Odpowiedzi na najczęstsze wątpliwości technologiczne i organizacyjne.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border border-gray-200 rounded-xl px-6">
              <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Enrollment Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Zapis na Szkolenie</DialogTitle>
            <DialogDescription>
              Wypełnij formularz rezerwacyjny na: <strong>{selectedCourse?.title}</strong> ({selectedCourse?.price}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrollSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="cname">Imię i Nazwisko</Label>
              <Input 
                id="cname" 
                required 
                placeholder="np. Katarzyna Nowak"
                value={enrollForm.name}
                onChange={(e) => setEnrollForm({...enrollForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="cphone">Numer Telefonu</Label>
              <Input 
                id="cphone" 
                required 
                type="tel" 
                placeholder="+48 500 000 000"
                value={enrollForm.phone}
                onChange={(e) => setEnrollForm({...enrollForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="cemail">Adres E-mail</Label>
              <Input 
                id="cemail" 
                required 
                type="email" 
                placeholder="katarzyna@example.com"
                value={enrollForm.email}
                onChange={(e) => setEnrollForm({...enrollForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="cmessage">Uwagi / Doświadczenie w PMU</Label>
              <Textarea 
                id="cmessage" 
                placeholder="Opisz krótko swoje dotychczasowe doświadczenie..."
                value={enrollForm.message}
                onChange={(e) => setEnrollForm({...enrollForm, message: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)}>
                Anuluj
              </Button>
              <Button type="submit" className="bg-[#2A2A2A] hover:bg-black text-white">
                Rezerwuj Miejsce
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
