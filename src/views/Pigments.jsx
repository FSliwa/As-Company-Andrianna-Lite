import React, { useState } from 'react';
import { Filter, ShoppingBag, Sparkles, Check, Info, Droplet, Layers, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const PIGMENT_CATEGORIES = [
  { id: "all", name: "Wszystkie Produkty" },
  { id: "lips", name: "Pigmenty do Ust (Opium & Classic)" },
  { id: "brows", name: "Pigmenty do Brwi (Light Minerals)" },
  { id: "eyelids", name: "Pigmenty do Powiek (Eyelids)" },
  { id: "medical", name: "Medyczne (Areola & Trichopigmentation)" },
  { id: "special", name: "Kolekcje Autorskie (Special Edition)" },
  { id: "accessories", name: "Kartridże & Chemia (Remover / Care)" },
];

const PRODUCTS = [
  // Lips
  {
    id: "pig-lip-1",
    category: "lips",
    name: "AS OPIUM #01 Velvet Nude",
    subtitle: "Pigment do ust – ciepły naturalny nude",
    price: 189,
    capacity: "10 ml",
    colorHex: "#C47B74",
    badge: "Bestseller",
    description: "Kremowy, aksamitny odcień nude z delikatnymi różowymi podtonami. Dedykowany do technik pudrowego wypełnienia ust.",
    type: "Hybryda mineralna"
  },
  {
    id: "pig-lip-2",
    category: "lips",
    name: "AS OPIUM #05 Royal Berry",
    subtitle: "Pigment do ust – głęboka malinowa czerwień",
    price: 189,
    capacity: "10 ml",
    colorHex: "#9E384D",
    badge: null,
    description: "Intensywna, wyrazista barwa dla klientek poszukujących efektu szminki (Lipstick Effect). Doskonała trwałość po wygojeniu.",
    type: "Hybryda mineralna"
  },
  {
    id: "pig-lip-3",
    category: "lips",
    name: "AS Classic Coral Bliss",
    subtitle: "Pigment do ust – soczysty koral",
    price: 169,
    capacity: "10 ml",
    colorHex: "#D96B58",
    badge: "Promocja",
    description: "Ciepły, odmładzający odcień koralowy. Przeznaczony do korekty chłodnych ust oraz do nadawania świeżości.",
    type: "Kolekcja Classic"
  },

  // Brows - Mineral
  {
    id: "pig-brow-1",
    category: "brows",
    name: "AS OPIUM Light Minerals #01 Blonde",
    subtitle: "Pigment do brwi – jasny neutralny blond",
    price: 199,
    capacity: "10 ml",
    colorHex: "#A0866A",
    badge: "Light Minerals",
    description: "Dystrybuowany barwnik 100% mineralny. Wyłuszcza się ze skóry w sposób całkowicie czysty i przewidywalny bez czerwonych podtonów.",
    type: "100% Mineralny"
  },
  {
    id: "pig-brow-2",
    category: "brows",
    name: "AS OPIUM Light Minerals #03 Cold Brown",
    subtitle: "Pigment do brwi – chłodny średni brąz",
    price: 199,
    capacity: "10 ml",
    colorHex: "#5E4B3C",
    badge: "Light Minerals",
    description: "Czysty, chłodny brąz z delikatną nutką popielu. Równomierne osadzanie się w naskórku przy technice Ombre Powder.",
    type: "100% Mineralny"
  },
  {
    id: "pig-brow-3",
    category: "brows",
    name: "AS OPIUM Light Minerals #05 Dark Espresso",
    subtitle: "Pigment do brwi – głęboki ciemny brąz",
    price: 199,
    capacity: "10 ml",
    colorHex: "#3A2E28",
    badge: "Light Minerals",
    description: "Wyrazisty, głęboki odcień dla szatynek i brunetek. Stabilna formuła chroniąca przed szarzeniem koloru.",
    type: "100% Mineralny"
  },

  // Eyelids
  {
    id: "pig-eye-1",
    category: "eyelids",
    name: "AS OPIUM Eyelids Deep Black",
    subtitle: "Pigment do powiek – aksamitna głęboka czerń",
    price: 199,
    capacity: "10 ml",
    colorHex: "#1A1A1A",
    badge: "Eyeliner Spec",
    description: "Niezwykle gęsty, nasycony pigment do kresek zagęszczających i dekoracyjnych. Bez ryzyka migracji podskórnej.",
    type: "Special Eyelids"
  },

  // Medical PMU
  {
    id: "pig-med-1",
    category: "medical",
    name: "AS Areola #02 Natural Areola",
    subtitle: "Pigment medyczny – rekonstrukcja otoczki brodawki",
    price: 220,
    capacity: "10 ml",
    colorHex: "#B87A6F",
    badge: "Medyczny PMU",
    description: "Specjalistyczny barwnik medyczny stosowany po zabiegach mastektomii oraz w zabiegach rekonstrukcji piersi.",
    type: "Medical Grade"
  },
  {
    id: "pig-med-2",
    category: "medical",
    name: "AS Trichopigmentation Scalp Dark",
    subtitle: "Pigment do mikropigmentacji skóry głowy",
    price: 240,
    capacity: "10 ml",
    colorHex: "#2E2D2B",
    badge: "Trichopigmentation",
    description: "Specjalnie zbalansowany pigment imitujący mieszek włosowy do optycznego zagęszczania fryzury.",
    type: "Medical Grade"
  },

  // Special Editions
  {
    id: "pig-spec-1",
    category: "special",
    name: "Special Edition: Hairstrokes #02 Hyper-Realism",
    subtitle: "Edycja Autorska – metoda włoskowa hyper-realizm",
    price: 210,
    capacity: "10 ml",
    colorHex: "#4A3B32",
    badge: "Special Edition",
    description: "Płynny barwnik ułatwiający tworzenie niezwykle cienkich rysunków włosków maszynką lub piórkiem.",
    type: "Autorska Linia"
  },
  {
    id: "pig-spec-2",
    category: "special",
    name: "Special Edition: The One Ring Gold",
    subtitle: "Kolekcja Autorska – Modyfikator ocieplający",
    price: 179,
    capacity: "10 ml",
    colorHex: "#E39E42",
    badge: "Modyfikator",
    description: "Modyfikator w kroplach dodawany do barwników brwiowych w celu wyeliminowania chłodnych tonów.",
    type: "Modyfikator"
  },

  // Accessories & Care
  {
    id: "acc-1",
    category: "accessories",
    name: "Kartridże PMU Satellite (Box 20 szt.)",
    subtitle: "Sterylne kartridże z membraną ochronną 0.25 1RL",
    price: 140,
    capacity: "20 szt.",
    colorHex: "#D4DEC8",
    badge: "Akcesoria",
    description: "Japońska stal chirurgiczna, obudowa z plastycznego medycznego tworzywa. Kompatybilne z maszynami AS HERO.",
    type: "Kartridże"
  },
  {
    id: "acc-2",
    category: "accessories",
    name: "AS Chemical Remover PMU / Tattoo",
    subtitle: "Bezpieczny preparat chemiczny do usuwania PMU",
    price: 250,
    capacity: "15 ml",
    colorHex: "#E5E5E5",
    badge: "Remover",
    description: "Nieorganiczy płyn usuwający pigmenty każdego typu (w tym zielenie i błękity niewidoczne dla lasera).",
    type: "Remover"
  }
];

export default function Pigments() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    toast({
      title: "Dodano do koszyka",
      description: `${product.name} (${product.price} zł) został dodany.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Banner */}
      <div className="bg-[#B8C5A6] text-black py-2.5 px-4 text-center text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span>Największa w historii promocja w AS PIGMENTS! Rabaty na pigmenty i zestawy do -40%</span>
      </div>

      {/* Hero */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="max-w-3xl">
          <Badge className="bg-[#2A2A2A] text-white uppercase tracking-widest text-[10px] px-3 py-1 mb-4">
            REACH Certified & EU Compliant
          </Badge>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-6 leading-tight">
            Pigmenty PMU nowej generacji <span className="font-semibold block text-[#B8C5A6]">AS OPIUM & Light Minerals</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
            Odkryj certyfikowane pigmenty stworzone przez ekspertów makijażu permanentnego. Najwyższa stabilność odcieni, bezpieczny proces wyłuszczania oraz kolekcje dopasowane do każdego fototypu skóry.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#F8F8F6] p-4 rounded-xl border border-gray-200">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Szukaj pigmentu, odcienia..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium w-full md:w-auto text-right">
            Znaleziono produktów: <span className="font-bold text-gray-900">{filteredProducts.length}</span>
          </div>
        </div>
      </section>

      {/* Categories Tabs */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-none border-b border-gray-100">
          {PIGMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#2A2A2A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border border-gray-200 hover:border-[#B8C5A6] transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: product.colorHex }}
                        title={`Odcień: ${product.name}`}
                      />
                      <div>
                        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-300 mb-1">
                          {product.type}
                        </Badge>
                        <CardTitle className="text-base font-bold">{product.name}</CardTitle>
                      </div>
                    </div>
                    {product.badge && (
                      <Badge className="bg-[#B8C5A6] text-black text-[9px] uppercase px-2 py-0.5">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-gray-500">{product.subtitle}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Pojemność: <strong className="text-gray-900">{product.capacity}</strong></span>
                    <span>Certyfikat: <strong className="text-gray-[#B8C5A6]">REACH 2026</strong></span>
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Cena brutto:</span>
                  <span className="text-xl font-bold text-[#2A2A2A]">{product.price} PLN</span>
                </div>
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="bg-[#2A2A2A] hover:bg-black text-white text-xs uppercase tracking-wider px-5 py-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-2" /> Do koszyka
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">Brak produktów spełniających kryteria</h3>
            <p className="text-xs text-gray-500">Spróbuj zmienić zapytanie wyszukiwania lub kategę.</p>
          </div>
        )}
      </section>

      {/* Pigment Quality Assurance Banner */}
      <section className="bg-[#F8F8F6] py-16 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Droplet className="w-8 h-8 text-[#B8C5A6] mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-2">Linia Light Minerals</h3>
            <p className="text-xs text-gray-500">Organiczne i mineralne barwniki gwarantujące przewidywalny proces stabilizacji barwy bez odcieni czerwieni i fioletu.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Layers className="w-8 h-8 text-[#B8C5A6] mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-2">Pigmentacja Medyczna</h3>
            <p className="text-xs text-gray-500">Sterylne preparaty do zabiegów rekonstrukcji brodawki piersiowej Areola oraz kamuflażu blizn powypadkowych.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#B8C5A6] mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-2">Modyfikatory i Remover</h3>
            <p className="text-xs text-gray-500">Kompleksowy system chemicznego usuwania oraz dopasowywania ciepłoty pigmentów pod oczekiwania klientki.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
