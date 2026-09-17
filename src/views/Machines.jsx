import React, { useState } from 'react';
import { ShieldCheck, Zap, BatteryCharging, Feather, Cpu, Sliders, Check, ArrowRight, RotateCw, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const MACHINES_DATA = [
  {
    id: "as-hero",
    name: "AS HERO",
    subtitle: "Precision Rotary PMU Machine",
    price: 1499,
    originalPrice: null,
    badge: "Bestseller",
    description: "Kompaktowa, wysoce precyzyjna maszynka rotacyjna idealna dla ceniących lekkość i bezwzględną stabilność prowadzenia igły.",
    features: [
      "Silnik bezszczotkowy najnowszej generacji",
      "Ergonomiczny chwyt redukujący zmęczenie dłoni",
      "Uniwersalne złącze kartridży z systemem membranowym",
      "Waga zaledwie 105g"
    ],
    specs: {
      rpm: "6 000 - 9 500 RPM",
      stroke: "2.5 mm (stały)",
      weight: "105 g",
      power: "Przewodowe złącze RCA / opcja akumulatora"
    },
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "as-hero-2",
    name: "AS HERO 2",
    subtitle: "Next-Gen Wireless Hybrid PMU Machine",
    price: 1999,
    originalPrice: null,
    badge: "Nowość 2026",
    description: "Hybrydowa bezprzewodowa maszynka nowej generacji. Łączy moc maszynek tatuażowych z miękkością wymaganą przy delikatnych pigmentacjach PMU.",
    features: [
      "Cyfrowy wyświetlacz OLED pokazujący stan baterii i napięcie",
      "2 wymienne akumulatory o pojemności 1200mAh w zestawie",
      "System bezpośredniego przełożenia napędu (Direct Drive)",
      "Tryb pracy ciągłej z kablem USB-C"
    ],
    specs: {
      rpm: "6 000 - 10 000 RPM (7 prędkości)",
      stroke: "2.1 - 3.0 mm (regulowany)",
      weight: "107 g",
      power: "2x Akumulator (do 4h pracy każdy) / USB-C"
    },
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "as-princess-gold",
    name: "AS PRINCESS Champagne Gold",
    subtitle: "Luxury Flagship PMU Machine",
    price: 2999,
    originalPrice: 3500,
    badge: "Promocja -500 PLN",
    description: "Luksusowe urządzenie klasy Premium. Zaprojektowane z lotniczego aluminium w kolorze szampańskiego złota, z unikalną amortyzacją wibracji.",
    features: [
      "Bezprzewodowa swoboda ruchu z dołączonymi 2 bateriami",
      "7 precyzyjnych biegów dedykowanych technikom pikselowym i konturowym",
      "Płynny wysuw igły 0 - 3.2 mm z mikrometryczną podziałką",
      "Model objęty pełnym serwisem door-to-door"
    ],
    specs: {
      rpm: "6 000 - 10 000 RPM (7 biegów)",
      stroke: "2.1 - 3.0 mm (7 stopni skoku)",
      weight: "107 g",
      power: "2x Bezprzewodowa bateria + Ładowarka"
    },
    color: "Champagne Gold",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "as-princess-pink",
    name: "AS PRINCESS Rose Pink",
    subtitle: "Luxury Flagship PMU Machine",
    price: 2999,
    originalPrice: 3500,
    badge: "Promocja -500 PLN",
    description: "Elegancka wariacja flagowej maszynki AS PRINCESS w limitowanym wykończeniu różowego złota. Doskonała precyzja i nieskazitelna estetyka.",
    features: [
      "Stylowy, satynowy różowy korpus odporny na zarysowania",
      "Ultracicha praca nie powodująca dyskomfortu u klientki",
      "Rekomendowana do technik pudrowych oraz mikroblading hybrydowego",
      "W zestawie eleganckie etui podróżne"
    ],
    specs: {
      rpm: "6 000 - 10 000 RPM",
      stroke: "2.1 - 3.0 mm",
      weight: "107 g",
      power: "2x Bezprzewodowa bateria + Ładowarka"
    },
    color: "Rose Pink",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop"
  }
];

const SPEED_LEVELS = [
  { level: 1, rpm: "6 000 RPM", name: "Pikselowa", desc: "Delikatny cień, idealna do miękkich przejsć w brwiach pudrowych." },
  { level: 2, rpm: "6 500 RPM", name: "Pudrowa", desc: "Zagęszczenie pigmentu, technika Ombre Brows i Powder Effect." },
  { level: 3, rpm: "7 000 RPM", name: "Hybrydowa", desc: "Uniwersalna praca na ustach i brwiach z mieszanymi pigmentami." },
  { level: 4, rpm: "7 500 RPM", name: "Liniowa", desc: "Włoskowa metoda Hairstrokes, precyzyjne mikrolinie." },
  { level: 5, rpm: "8 000 RPM", name: "Konturowa", desc: "Wyrazisty kontur ust oraz kreska zagęszczająca linię rzęs (Eyeliner)." },
  { level: 6, rpm: "9 000 RPM", name: "Tatuażowa I", desc: "Głębokie nasycenie barwnika, praca z gęstszymi pigmentami." },
  { level: 7, rpm: "10 000 RPM", name: "Tatuażowa II", desc: "Maksymalna częstotliwość nakłuć do zaawansowanych prac medycznych i kamuflażu." },
];

export default function Machines() {
  const { toast } = useToast();
  const [selectedSpeed, setSelectedSpeed] = useState(SPEED_LEVELS[0]);
  const [selectedMachineForRental, setSelectedMachineForRental] = useState(null);
  const [rentalForm, setRentalForm] = useState({ name: '', phone: '', email: '', salonName: '' });

  const handleAddToCart = (machine) => {
    toast({
      title: "Dodano do koszyka",
      description: `${machine.name} (${machine.price} zł) znajduje się w Twoim koszyku.`,
    });
  };

  const handleRentalSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Zgłoszenie wynajmu wysłane!",
      description: `Dziękujemy ${rentalForm.name}. Skontaktujemy się z Tobą pod numerem ${rentalForm.phone} w celu finalizacji umowy wynajmu.`,
    });
    setSelectedMachineForRental(null);
    setRentalForm({ name: '', phone: '', email: '', salonName: '' });
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Top Banner */}
      <div className="bg-[#2A2A2A] text-white py-2.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#B8C5A6]" />
        <span>Oferta Specjalna: Zamów maszynkę AS PRINCESS lub skorzystaj z modelu wynajmu za 369 zł/mc</span>
        <Sparkles className="w-3.5 h-3.5 text-[#B8C5A6]" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-[#B8C5A6] text-black hover:bg-[#a6b593] uppercase tracking-widest text-[10px] px-3 py-1 mb-4">
              Technologia PMU Premium
            </Badge>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-6 leading-tight">
              Innowacyjne Maszynki Bezprzewodowe <span className="font-semibold block text-[#B8C5A6]">AS HERO & AS PRINCESS</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Zaprojektowane z myślą o najwyższym komfortowym standardzie pracy linergistek. Lekka konstrukcja ze stopu lotniczego aluminium, 7 trybów prędkości, zmienny skok i wymienne akumulatory zapewniają bezkompromisową precyzję.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#2A2A2A] hover:bg-black text-white px-8 py-6 rounded-none text-sm tracking-widest font-medium"
              >
                PRZEGLĄDAJ MODELE <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedMachineForRental(MACHINES_DATA[2])}
                className="border-[#2A2A2A] text-[#2A2A2A] hover:bg-gray-50 px-8 py-6 rounded-none text-sm tracking-widest font-medium"
              >
                WYNAJEM 369 ZŁ / MC
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=1000&auto=format&fit=crop" 
                alt="AS PMU Machine"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100 max-w-xs hidden sm:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A]">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Zasilanie</p>
                  <p className="font-semibold text-sm">2x Akumulator (3h+)</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Ciągła praca bez kabli z opcją ładowania w trakcie zabiegu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-[#F8F8F6] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-3">Zaawansowane Parametry Techniczne</h2>
            <p className="text-gray-500 text-sm">Przełom w dziedzinie makijażu permanentnego – zoptymalizowane pod kątem pigmentów mineralnych i hybrydowych.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A] mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">7 Trybów Prędkości</h3>
              <p className="text-gray-600 text-sm">Precyzyjnie skalibrowane od 6 000 do 10 000 RPM z cyfrowym sterowaniem dla każdego rodzaju skóry.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A] mb-4">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Zmienny Skok 2.1 - 3.0mm</h3>
              <p className="text-gray-600 text-sm">7 stopni regulacji skoku igły poprzez proste obrócenie korpusu. Idealne dopasowanie oporu.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A] mb-4">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Waga Zaledwie 107g</h3>
              <p className="text-gray-600 text-sm">Aerodynamiczne aluminium sprawia, że dłoń nie męczy się nawet podczas wielogodzinnych sesji.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#B8C5A6]/20 flex items-center justify-center text-[#2A2A2A] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Wysuw Igły 0 - 3.2mm</h3>
              <p className="text-gray-600 text-sm">Rozkręcana konstrukcja kompatybilna z uniwersalnymi kartridżami z membraną sterylną.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive RPM / Speed Simulator Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="border-[#B8C5A6] text-[#2A2A2A] mb-3">Interaktywny Przewodnik</Badge>
          <h2 className="text-3xl font-light mb-4">Wybierz Prędkość i Technikę Pracy</h2>
          <p className="text-gray-600 text-sm">Kliknij poszczególne poziomy obrotów RPM, aby poznać dedykowane zastosowanie i zalecaną technikę pigmentacji.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {SPEED_LEVELS.map((speed) => (
              <button
                key={speed.level}
                onClick={() => setSelectedSpeed(speed)}
                className={`py-4 px-3 rounded-xl text-center border transition-all ${
                  selectedSpeed.level === speed.level 
                    ? 'bg-[#2A2A2A] text-white border-[#2A2A2A] shadow-md transform -translate-y-1' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs uppercase tracking-wider font-semibold opacity-75 mb-1">Poziom {speed.level}</div>
                <div className="font-bold text-sm">{speed.rpm}</div>
              </button>
            ))}
          </div>

          <div className="bg-[#F8F8F6] p-8 rounded-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#B8C5A6] text-black font-bold text-xs px-2.5 py-1 rounded">
                  {selectedSpeed.rpm}
                </span>
                <h3 className="text-xl font-bold">{selectedSpeed.name}</h3>
              </div>
              <p className="text-gray-600 text-sm max-w-xl">{selectedSpeed.desc}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-right">
                <span className="text-xs text-gray-500 uppercase tracking-wider block">Rekomendowana Igła</span>
                <span className="font-semibold text-sm">1RL 0.25 mm / 3RL 0.18 mm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog / Product List */}
      <section id="catalog" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h2 className="text-3xl font-light mb-2">Katalog Urządzeń PMU</h2>
            <p className="text-gray-500 text-sm">Wszystkie maszynki objęte są 24-miesięczną gwarancją producenta oraz wsparciem technicznym.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {MACHINES_DATA.map((machine) => (
            <Card key={machine.id} className="overflow-hidden border border-gray-200 hover:border-[#B8C5A6] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img 
                    src={machine.image} 
                    alt={machine.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {machine.badge && (
                    <Badge className="absolute top-4 left-4 bg-black text-white uppercase text-[10px] tracking-widest px-3 py-1">
                      {machine.badge}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">{machine.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-500">{machine.subtitle}</CardDescription>
                    </div>
                    <div className="text-right">
                      {machine.originalPrice && (
                        <span className="text-xs text-gray-400 line-through block">{machine.originalPrice} zł</span>
                      )}
                      <span className="text-xl font-bold text-[#2A2A2A]">{machine.price} zł</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{machine.description}</p>
                  
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Cechy Kluczowe:</p>
                    <ul className="space-y-1">
                      {machine.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#B8C5A6]" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#F8F8F6] p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">RPM:</span> <span className="font-medium">{machine.specs.rpm}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Skok:</span> <span className="font-medium">{machine.specs.stroke}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Waga:</span> <span className="font-medium">{machine.specs.weight}</span></div>
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <Button 
                  onClick={() => handleAddToCart(machine)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-black text-white text-xs tracking-wider uppercase py-5"
                >
                  Dodaj do Koszyka
                </Button>
                {machine.name.includes("PRINCESS") && (
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedMachineForRental(machine)}
                    className="border-[#B8C5A6] text-[#2A2A2A] hover:bg-[#B8C5A6]/10 text-xs tracking-wider uppercase py-5"
                  >
                    Wynajmij (369 zł/mc)
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Rental Special Section */}
      <section className="bg-[#2A2A2A] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-[#B8C5A6] text-black hover:bg-[#B8C5A6] uppercase text-[10px] tracking-widest px-3 py-1 mb-4">
              Model Subskrypcyjny B2B
            </Badge>
            <h2 className="text-3xl md:text-4xl font-light mb-6">Program Wynajmu Maszynek PMU dla Salonów</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Rozwijaj swój salon bez zamrażania kapitału. Wynajmij bezprzewodową maszynkę **AS PRINCESS** na dogodnych warunkach ze stałą opłatą **369 zł miesięcznie**.
            </p>
            <ul className="space-y-3 mb-8 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#B8C5A6]" />
                <span>Brak wysokiej opłaty początkowej – startujesz od pierwszego dnia</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#B8C5A6]" />
                <span>Pełny serwis i maszynka zastępcza w 24h w przypadku awarii</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#B8C5A6]" />
                <span>Możliwość wykupu urządzenia na własność po okresie subskrypcji</span>
              </li>
            </ul>
            <Button 
              onClick={() => setSelectedMachineForRental(MACHINES_DATA[2])}
              className="bg-[#B8C5A6] hover:bg-[#a6b593] text-black font-semibold text-xs tracking-widest uppercase px-8 py-6 rounded-none"
            >
              WYSŁIJ ZAPYTANIE O WYNAJEM
            </Button>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-[#B8C5A6]">Kalkulator Korzyści Wynajmu</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Koszt zakupu nowej maszynki:</span>
                <span className="font-semibold text-white">2 999 PLN</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Miesięczny koszt wynajmu:</span>
                <span className="font-semibold text-[#B8C5A6]">369 PLN / mc</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Przewidywana liczba zabiegów w miesiącu:</span>
                <span className="font-semibold text-white">10 zabiegów</span>
              </div>
              <div className="flex justify-between py-2 pt-4">
                <span className="text-gray-300 font-semibold">Koszt sprzętu na 1 zabieg:</span>
                <span className="font-bold text-[#B8C5A6] text-lg">tylko 36.90 PLN!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal / Dialog for Rental Application */}
      <Dialog open={!!selectedMachineForRental} onOpenChange={() => setSelectedMachineForRental(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Wniosek o Wynajem Maszynki PMU</DialogTitle>
            <DialogDescription>
              Wypełnij krótki formularz, aby zarezerwować model {selectedMachineForRental?.name} w opcji 369 zł/mc.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRentalSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Imię i Nazwisko</Label>
              <Input 
                id="name" 
                required 
                placeholder="np. Anna Kowalska"
                value={rentalForm.name}
                onChange={(e) => setRentalForm({...rentalForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Numer Telefonu</Label>
              <Input 
                id="phone" 
                required 
                type="tel" 
                placeholder="+48 600 000 000"
                value={rentalForm.phone}
                onChange={(e) => setRentalForm({...rentalForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Adres E-mail</Label>
              <Input 
                id="email" 
                required 
                type="email" 
                placeholder="salon@example.com"
                value={rentalForm.email}
                onChange={(e) => setRentalForm({...rentalForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="salonName">Nazwa Salonu / Działalności</Label>
              <Input 
                id="salonName" 
                placeholder="np. Studio Beauty Katowice"
                value={rentalForm.salonName}
                onChange={(e) => setRentalForm({...rentalForm, salonName: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedMachineForRental(null)}>
                Anuluj
              </Button>
              <Button type="submit" className="bg-[#2A2A2A] hover:bg-black text-white">
                Wyślij Wniosek
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
