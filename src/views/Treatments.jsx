'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Check, Clock, HelpCircle, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";

export default function Treatments() {
  const { toast } = useToast();
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', notes: '' });

  const treatments = [
    {
      id: "supernatural-brows",
      name: "Włos Maszynowy „SuperNatural brows”",
      price: "1 800 PLN",
      duration: "1,5 - 2 godziny",
      tag: "Autorska Technika Andriany",
      description: "Efekt zadbanych, gęstych, dopasowanych brwi z delikatnym pogrubieniem oraz wyrównaniem kształtu.",
      quote: "Idealnie nadaje się dla klientek z życzeniem: „Nie chcę aby ktoś wiedział że mam zrobione brwi, mają wyglądać jak moje”",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      id: "perfect-brows",
      name: "Pudrowa Technika „Perfect brows”",
      price: "1 500 PLN",
      duration: "1,5 - 2 godziny",
      tag: "Efekt Cienia",
      description: "Efekt delikatnie podmalowanych brwi cieniem, z podkreślonym kształtem, ale nadal w delikatnej, transparentnej wersji bez przesady.",
      quote: "Idealne przejścia tonalne (Ombre/Powder) dopasowane do karnacji.",
      images: [
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      id: "perfect-lips",
      name: "Usta Permanentne „Perfect lips”",
      price: "1 600 PLN",
      duration: "2 godziny",
      tag: "Subtelność i Świeżość",
      description: "Efekt zdrowych, równomiernych, naturalnych ust, bez wyraźnych odcieni, bez przerysowanych konturów oraz bez „sztucznego efektu”.",
      quote: "Dobieramy kolory do natury, wyrównujemy koloryt i nadajemy świeżości.",
      images: [
        "https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      id: "perfect-eyes",
      name: "Pigmentacja Linii „Perfect eyes”",
      price: "1 200 PLN",
      duration: "1 - 1,5 godziny",
      tag: "Zagęszczenie Rzęs",
      description: "Efekt zagęszczania rzęs, pogrubienia górnej wodnej linii oka, uwydatnienie koloru tęczówki, bez kreski, bez ogonka i bez cienia na powiece.",
      quote: "Niewidoczny akcent, który otwiera spojrzenie i uwypukla kolor tęczówki.",
      images: [
        "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      id: "korekta",
      name: "Korekta Makijażu Permanentnego",
      price: "400 - 600 PLN",
      duration: "1 godzina",
      tag: "Dopracowanie Efektu (1-3 msc)",
      description: "Zabieg, na którym uzupełnimy ubytki, które mogą wynikać z różnych przyczyn, najczęściej zależnych od samej skóry, procesu jej indywidualnej regeneracji lub stanu hormonalnego. A także wykonujemy ten zabieg najczęściej w celu wzmocnienia efektu, pogrubienia brwi lub dodatkowego zagęszczenia włosków.",
      quote: "Robi się po miesiącu do 3 od pierwotnego zabiegu.",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      id: "odswiezenie",
      name: "Odświeżenie Makijażu Permanentnego",
      price: "50% Ceny Podstawowej",
      duration: "1,5 godziny",
      tag: "Po 1-3 Latach",
      description: "Zabieg, który wykonujemy raz na 1-3 lata, dla odnowienia efektu, uzupełnienia koloru, dodania gęstości, grubości i intensywności koloru.",
      quote: "Utrzymuje efekt idealnej świeżości przez kolejne lata.",
      images: [
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      id: "usuwanie",
      name: "Usuwanie Laserowe / Removerem",
      price: "350 PLN / zabieg",
      duration: "30 - 45 minut",
      tag: "Bezpieczne Oczyszczanie",
      description: "Zabieg polegający na usuwaniu starego, nieudanego PMU przed nową pigmentacją. Usuwamy jak laserem, tak i removerem, dobierając metodę indywidualnie według przypadku, zawsze staramy się zrobić tak, aby jak najszybciej i najbezpieczniej dla klienta pozbyć się niechcianego pigmentu.",
      quote: "Usuwanie bez blizn i bez poparzeń - przygotowanie skóry pod nowy PMU.",
      images: [
        "https://images.unsplash.com/photo-1512290900673-0ed87ac2b6c7?q=80&w=1000&auto=format&fit=crop"
      ]
    }
  ];

  const faqItems = [
    {
      q: "Czy włos maszynowy się nie rozpływa?",
      a: "Włos maszynowy to tak samo płytka, delikatna i nietraumatyczna technika jak i puder, nie jest to piórkowa metoda, nie nacinamy skóry, nie wbijamy głęboko pigmentu. Pigmentujemy włoski precyzyjnie nasycając je warstwami pudru, delikatnie, z umiarem i wyczuciem. Dlatego włos maszynowy nie rozpływa się z czasem."
    },
    {
      q: "Czy kolor z czasem nie zrobi się czerwony lub szary?",
      a: "Pigmenty oraz techniki, które wykorzystujemy są najwyższej jakości, spotykanej na rynku PMU. Stąd pewność w ich przewidywalnym zachowaniu się z czasem, co potwierdzają zdjęcia i filmy na naszym IG. Oczywiście skóra i hormony każdego człowieka rządzą się swoimi prawami, na to nie mamy wpływu i rzadko ale zdarza się że kolor pigmentu może się wychłodzić, ale mamy rozwiązanie dla takich klientek - bezpłatna inwersja koloru w cieplejszy odcień."
    },
    {
      q: "Czy będzie rysunek wstępny przed pigmentacją?",
      a: "Oczywiście że tak! Bez niego nie ruszymy. Rysunek wstępny zostanie dopasowany do Twojej architektury twarzy, a w momencie jak będziesz go sprawdzać możemy wprowadzić zmiany, uwzględniając Twoje uwagi i życzenia."
    },
    {
      q: "Czy zabieg jest bolesny?",
      a: "W 90% przypadków zabieg jest bezbolesny, a większość klientek przysypia podczas pigmentacji. Wrażliwe klientki będą odczuwać podczas pierwszego przejścia maszynką drapanie skóry, a już od razu po nim nałożymy żel chłodzący, który zniweluje nieprzyjemne odczucia i większą część zabiegu też można się relaksować."
    },
    {
      q: "Czy korekta jest obowiązkowa?",
      a: "Najczęściej nie, ale wiele zależy od Twojej skóry, procesu regeneracji, stanu hormonalnego oraz życzenia po wygojeniu. Gdy będziemy potrzebować uzupełnić ubytki, poprawić kształt, pogrubić lub zagęścić brwi, dodać intensywności czy delikatnie zmienić kolor - wykonanie korekty będzie najlepszym rozwiązaniem."
    },
    {
      q: "Czy można robić nowy zabieg na starym makijażu permanentnym?",
      a: "Zależy od tego, jak wygląda Twój obecny makijaż permanentny, jak dawno był zrobiony, czy był usuwany oraz czy jest możliwy do poprawy. Poprosimy Cię o wysłanie zdjęcia brwi/ust, abyśmy mogły ocenić jego wygląd. Gdy resztki będą delikatne, żółte, pomarańczowe czy lekko widoczne - zrobimy cover. W przypadku jak PMU będzie miał szary, ciemny, wyraźny zarys - zaprosimy na usuwanie."
    },
    {
      q: "Czy usuwanie uszkodzi moje włoski na brwiach?",
      a: "W żadnym przypadku. Często widzimy odwrotną reakcję: włoski po usuwaniu zaczynają aktywniej odrastać, ponieważ skóra pozbywa się nadmiaru pigmentu i włoski mają miejsce na porost. Czasami po zabiegu zauważysz zbielenie włosków, ale jest to tymczasowa reakcja, wkrótce włoski wracają do swojego koloru, a jak nie będziesz chciała czekać - można zrobić hennę lub farbkę już 2-3 dni po zabiegu usuwania."
    },
    {
      q: "Czy usuwanie jest bardzo bolesne?",
      a: "Na pewno nie zaliczymy tego zabiegu do przyjemnych, ale samo usuwanie trwa około minuty, po zabiegu od razu wychłodzimy Twoją skórę i zadbamy abyś czuła się komfortowo. Każdy ma inny próg bólu, ktoś odczuwa mocniej, a ktoś wcale nie przeżywa bólu."
    },
    {
      q: "Czy po usuwaniu będą blizny?",
      a: "Usuwamy bardzo bezpiecznie oraz skutecznie. Zależy nam na tym, aby Twoja skóra była dobrze przygotowana do nowej pigmentacji, jej stan jest dla nas najważniejszy. Dlatego po usuwaniu laserem oraz removerem u nas nie ma żadnych blizn czy poparzeń. Jedynie należy rozumieć, że jak Twój PMU był zrobiony bardzo głęboko i traumatycznie przed zabiegiem u nas, co powoduje że te blizny są jeszcze przed usuwaniem, to po pozbyciu się koloru z brwi te blizny nie znikną. Będziemy łączyć techniki usuwania, aby jednocześnie usuwać pigment i działać na dobro Twojej skóry."
    }
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Rezerwacja wysłana!",
      description: `Dziękujemy ${bookingForm.name}! Skontaktujemy się telefonicznie w celu potwierdzenia dogodnego terminu na ${selectedTreatment?.name}.`,
    });
    setSelectedTreatment(null);
    setBookingForm({ name: '', phone: '', date: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Top Banner */}
      <div className="bg-[#2A2A2A] text-white py-2.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#B8C5A6]" />
        <span>Oferta Zabiegowa – Babushkina Academy Warszawa (Wolnostojący Budynek & Prywatny Parking)</span>
      </div>

      {/* Header */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge className="bg-[#B8C5A6] text-black hover:bg-[#a6b593] uppercase tracking-widest text-[10px] px-3 py-1">
            Sztuka Naturalnego Piękna
          </Badge>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">
            Zabiegi Makijażu Permanentnego
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Specjalizujemy się w uzyskaniu najbardziej realistycznego, subtelnego efektu. Bez przerysowanych konturów, bez bólu i bez kompromisów.
          </p>
        </div>
      </section>

      {/* Treatments List & Work Photos */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-20">
        {treatments.map((t, idx) => (
          <div key={t.id} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm hover:border-[#B8C5A6] transition-all">
            <div className={`lg:col-span-7 space-y-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="flex items-center gap-3">
                <Badge className="bg-[#B8C5A6] text-black text-[10px] uppercase font-bold">{t.tag}</Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B8C5A6]" /> {t.duration}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-light text-gray-900">{t.name}</h2>
              <p className="text-gray-700 text-base leading-relaxed">{t.description}</p>
              
              <blockquote className="bg-[#F8F8F6] p-4 rounded-xl border-l-4 border-[#B8C5A6] italic text-sm text-gray-800">
                {t.quote}
              </blockquote>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block uppercase tracking-wider">Cena zabiegu:</span>
                  <span className="text-2xl font-bold text-[#2A2A2A]">{t.price}</span>
                </div>
                <Button 
                  onClick={() => setSelectedTreatment(t)}
                  className="bg-[#2A2A2A] hover:bg-black text-white px-6 py-5 rounded-none text-xs tracking-widest font-semibold uppercase"
                >
                  Zarezerwuj Wizytę <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div className="grid grid-cols-1 gap-4">
                {t.images.map((imgUrl, imgIdx) => (
                  <div key={imgIdx} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-gray-100">
                    <img src={imgUrl} alt={`${t.name} - Zdjęcie Efektu`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* PRICE LIST GRAPHIC CARD (Cennik na dole podstrony) */}
      <section className="bg-[#2A2A2A] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge className="bg-[#B8C5A6] text-black text-[10px] uppercase font-bold px-3 py-1">Oficjalny Cennik Usług</Badge>
            <h2 className="text-3xl font-light text-white">Cennik Zabiegowy – Babushkina Academy</h2>
            <p className="text-gray-400 text-sm">Wszystkie zabiegi zawierają konsultację, architekturę twarzy oraz rysunek wstępny.</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 space-y-6">
            {treatments.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-2">
                <div>
                  <h3 className="font-semibold text-lg text-white">{t.name}</h3>
                  <span className="text-xs text-[#B8C5A6]">{t.duration} • {t.tag}</span>
                </div>
                <div className="text-xl font-bold text-[#B8C5A6]">{t.price}</div>
              </div>
            ))}
            <div className="pt-4 text-center">
              <p className="text-xs text-gray-400">
                Prywatny parking w Warszawie na miejscu. Charytatywna rekonstrukcja dla osób po chorobach onkologicznych – darmowa konsultacja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - All 9 Questions */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Wiedza & Bezpieczeństwo</Badge>
          <h2 className="text-3xl font-light">Najczęściej Zadawane Pytania Odnośnie Technik</h2>
          <p className="text-gray-500 text-sm mt-2">Szczegółowe odpowiedzi Andriana Babushkinej na wątpliwości klientek.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="bg-white border border-gray-200 rounded-2xl px-6">
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

      {/* Booking Dialog */}
      <Dialog open={!!selectedTreatment} onOpenChange={() => setSelectedTreatment(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Rezerwacja Zabiegu</DialogTitle>
            <DialogDescription>
              Wybierz dogodny termin na: <strong>{selectedTreatment?.name}</strong> ({selectedTreatment?.price}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="bname">Imię i Nazwisko</Label>
              <Input 
                id="bname" 
                required 
                placeholder="np. Anna Kowalska"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bphone">Numer Telefonu</Label>
              <Input 
                id="bphone" 
                required 
                type="tel" 
                placeholder="+48 500 000 000"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bdate">Preferowana Data i Godzina</Label>
              <Input 
                id="bdate" 
                required 
                type="text" 
                placeholder="np. Przyszły wtorek po 15:00"
                value={bookingForm.date}
                onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bnotes">Uwagi (np. czy posiadasz stary PMU / uczulenia)</Label>
              <Textarea 
                id="bnotes" 
                placeholder="Napisz czy brwi/usta były wcześniej pigmentowane..."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedTreatment(null)}>
                Anuluj
              </Button>
              <Button type="submit" className="bg-[#2A2A2A] hover:bg-black text-white">
                Wyślij Zapytanie
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}