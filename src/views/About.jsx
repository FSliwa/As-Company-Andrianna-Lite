'use client';

import React from "react";
import { Award, Star, CheckCircle, Heart, Sparkles, MapPin, Car, ShieldCheck, ArrowRight, Trophy, Users, Globe2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function About() {
  const achievements = [
    { label: "Wygrane na Mistrzostwach Świata", val: "5x I & II Miejsce" },
    { label: "Włos Maszynowy (Światowe Podium)", val: "1. & 2. Miejsca" },
    { label: "Brwi Pudrowe & Usta", val: "1. Miejsca" },
    { label: "Przeszkolonych Kursantek (Ostatni Rok)", val: "100+ z włosa" },
    { label: "Baza Kursantek za Granicą", val: "50+ Osob" },
    { label: "Doświadczenie w Prowadzeniu Salonów", val: "7 lat Katowice / 3 lata Wawa" }
  ];

  const galleryAndriana = [
    {
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
      title: "Andriana Babushkina",
      subtitle: "International PMU Trainer & Judge"
    },
    {
      url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1000&auto=format&fit=crop",
      title: "Prime Speaker & Prelegent",
      subtitle: "Międzynarodowe Konferencje PMU"
    },
    {
      url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop",
      title: "Autorka SuperNatural Brows",
      subtitle: "80% Wygojenia bez Kompromisów"
    }
  ];

  const gallerySalon = [
    {
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop",
      title: "Wolnostojący Budynek & Prywatny Parking",
      subtitle: "Prestiżowa Lokalizacja w Warszawie"
    },
    {
      url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
      title: "Wnętrza Babushkina Academy",
      subtitle: "Komfort, Elegancja i Sterylność"
    },
    {
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
      title: "Stanowiska Zabiegowe i Szkoleniowe",
      subtitle: "Sprzęt Najwyższej Klasy Światowej"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Top Banner */}
      <div className="bg-[#2A2A2A] text-white py-2.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#B8C5A6]" />
        <span>Babushkina Academy Warszawa – Prestiżowy Salon & Międzynarodowa Akademia PMU</span>
      </div>

      {/* SECTION 1: Wizytówka Andriana Babushkina */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge className="bg-[#B8C5A6] text-black hover:bg-[#a6b593] uppercase tracking-widest text-[10px] px-3 py-1">
              Wizytówka Persona & Twórczyni Marki
            </Badge>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight leading-tight">
              Andriana Babushkina
            </h1>
            <p className="text-lg text-[#B8C5A6] font-semibold tracking-wide uppercase">
              Linergista, Trener, Prelegent oraz Sędzia w dziedzinie makijażu permanentnego międzynarodowego poziomu
            </p>
            
            <div className="text-gray-600 text-base leading-relaxed space-y-4">
              <p>
                Kilka razy wygrała podium Światowych Mistrzostw. <strong>2 razy w kategorii WŁOS MASZYNOWY (1 oraz 2 miejsca)</strong>, <strong>2 razy w kategorii BRWI PUDROWE (1 miejsca)</strong>, a także kategoria <strong>USTA (1 miejsce)</strong>.
              </p>
              <p>
                Wykonała tysiące pigmentacji dla klientek oraz przeszkoliła setki kursantek z różnych technologii, za ostatni rok tylko ponad <strong>100 kursantek z techniki włosa maszynowego</strong>.
              </p>
              <p>
                Twórczyni szybkich, naturalnych technik makijażu permanentnego brwi oraz ust z 80% wygojeniem. Autorka techniki <strong>„SuperNatural brows”</strong> - włos maszynowy bez kompromisów między jakością a szybkością. Pigmentacja jej kursantek jest na wysokim poziomie i wykonywana w 2-2,5 godziny, a sama wykonuje włos maszynowy w <strong>1,5-2 godziny, bez bólu, bez blizn i migracji pigmentu po czasie</strong>.
              </p>
              <p>
                <strong>7 lat prowadziła salon w Katowicach</strong>, który stał się najbardziej wybieranym oraz zaufanym wśród klientek na całym Śląsku salonem makijażu permanentnego z listą oczekiwania na zabieg ponad pół roku.
              </p>
              <p>
                <strong>3 lata prowadzi Salon i Akademię makijażu permanentnego w Warszawie</strong>, wykonując pigmentację i szkoląc osoby z różnych zakątków Polski i Świata. Jest zapraszana na pokazy, masterclassy i prowadzenie kursów w inne kraje, baza kursantek za granicą już nalicza ponad 50 osób.
              </p>
              <p>
                Sama również przeszła ogromną ilość szkoleń, odwiedziła mnóstwo Konferencji i pokazów od światowych liderek branży, a teraz sama znajduje się na tym poziomie i jest często spotykana na najlepszych branżowych wydarzeniach jako <strong>Prime Speaker i Stage Prelegent</strong>.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/szkolenia">
                <Button className="bg-[#2A2A2A] hover:bg-black text-white px-8 py-6 rounded-none text-xs tracking-widest font-semibold uppercase">
                  Zobacz Ofertę Szkoleń <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/uslugi">
                <Button variant="outline" className="border-[#2A2A2A] text-[#2A2A2A] px-8 py-6 rounded-none text-xs tracking-widest font-semibold uppercase hover:bg-gray-50">
                  Zerezerwuj Zabieg
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                alt="Andriana Babushkina"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-[#B8C5A6]" />
                  <span className="font-bold text-sm">Wielokrotna Mistrzyni Świata PMU</span>
                </div>
                <p className="text-xs text-gray-200">Twórczyni autorskiej metody SuperNatural Brows</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-[#2A2A2A] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {achievements.map((item, idx) => (
            <div key={idx} className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-[#B8C5A6]">{item.val}</div>
              <div className="text-[11px] text-gray-300 font-medium leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Andriana */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Fotogaleria Autorska</Badge>
          <h2 className="text-3xl font-light">Andriana Babushkina w Akcji</h2>
          <p className="text-gray-500 text-sm mt-2">Wystąpienia sceniczne, pokazy Masterclass oraz praca z kursantkami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {galleryAndriana.map((img, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-md bg-gray-100 aspect-[4/3]">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white opacity-95">
                <h3 className="font-bold text-lg">{img.title}</h3>
                <p className="text-xs text-[#B8C5A6]">{img.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Salon & Akademia Babushkina Academy Warszawa */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop"
                  alt="Babushkina Academy Salon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-gray-200 mt-8">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"
                  alt="Prywatny Parking i Wnętrza"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <Badge className="bg-[#B8C5A6] text-black hover:bg-[#a6b593] uppercase tracking-widest text-[10px] px-3 py-1">
              Studio & Akademia w Warszawie
            </Badge>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
              „Babushkina Academy” Warszawa
            </h2>
            
            <div className="flex items-center gap-6 py-3 border-y border-gray-100 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B8C5A6]" />
                <span>Wolnostojący Budynek</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#B8C5A6]" />
                <span>Prywatny Parking dla Klientów</span>
              </div>
            </div>

            <div className="text-gray-600 text-base leading-relaxed space-y-4">
              <p>
                Akademia i salon makijażu permanentnego <strong>„Babushkina Academy” w Warszawie</strong> to prestiżowe, ładnie wykończone studio w wolno stojącym budynku z prywatnym parkingiem dla klientów, w którym każdy poczuje się profesjonalnie zaopiekowany, upiększony i usłyszany przez Specjalistę.
              </p>
              <p>
                Stawiamy na sztukę piękna, polegającą na <strong>naturalności, subtelności i podkreśleniu indywidualnej urody</strong> każdej klientki. Za pomocą technik makijażu permanentnego dodajemy kobietom i mężczyznom pewności siebie, radości z wyglądu w lustrze, uzupełniamy niedoskonałości wynikające z natury lub przeżytych chorób.
              </p>
              
              <div className="bg-[#F8F8F6] p-6 rounded-2xl border-l-4 border-[#B8C5A6] space-y-2">
                <div className="flex items-center gap-2 text-black font-semibold">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Działalność Charytatywna</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Charytatywnie opiekujemy się osobami, które straciły włoski w wyniku chorób onkologicznych oraz tworzymy brwi od nowa na najbardziej wymagającym płótnie - twarzach klientów, którzy nam zaufali.
                </p>
              </div>

              <blockquote className="italic text-lg text-gray-800 font-serif border-l-2 border-gray-300 pl-4 py-1">
                „Proszę zrobić brwi, aby nikt nie zauważył że były zrobione” – życzenie, które spełniamy w 100%, specjalizując się w uzyskaniu najbardziej realistycznego efektu w świecie makijażu permanentnego, wykorzystując technikę włosa maszynowego „SuperNatural brows”.
              </blockquote>

              <p>
                Wykonamy również technikę pudrową lub combo dla tych, którzy chcą mieć bardziej podkreślony kształt, ale nadal w naturalnej wersji. Zadbamy aby makijaż permanentny ust wyglądał o tyle subtelnie, żeby klientki zawsze czuły się z nim komfortowo. Dobieramy kolory do natury, wyrównujemy koloryt, nadajemy świeżości i podkreślamy kształt - bez konturów, bez przesady, bez wyraźnych odcieni.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Salon & Parking */}
      <section className="bg-[#F8F8F6] py-20 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Galeria Obiektu</Badge>
            <h2 className="text-3xl font-light">Zobacz Nasze Studio w Warszawie</h2>
            <p className="text-gray-500 text-sm mt-2">Komfortowy parking, przytulna atmosfera i luksusowe warunki zabiegowe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {gallerySalon.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}