'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Facebook, Instagram, Star, Sparkles, X, Trash2, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children }) {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "AS PRINCESS Champagne Gold", price: 2999, qty: 1, type: "Maszynka PMU" },
    { id: 2, name: "AS OPIUM #01 Velvet Nude", price: 189, qty: 2, type: "Pigment 10ml" }
  ]);

  const navigationItems = [
    { name: "MASZYNKI PMU", href: "/maszynki" },
    { name: "PIGMENTY & SKLEP", href: "/pigmenty" },
    { name: "SZKOLENIA", href: "/szkolenia" },
    { name: "CERTYFIKATY", href: "/certyfikaty" },
    { name: "USŁUGI", href: "/uslugi" },
    { name: "PAKIETY", href: "/pakiety" },
    { name: "O NAS", href: "/o-nas" },
    { name: "KONTAKT", href: "/kontakt" },
  ];

  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-[#2A2A2A] flex flex-col justify-between">
      <style>{`
        :root {
          --sage-green: #B8C5A6;
          --sage-light: #D4DEC8;
          --charcoal: #2A2A2A;
          --warm-white: #FEFEFE;
          --cream: #F8F8F6;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.01em;
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--charcoal);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after, .nav-link-active::after {
          width: 100%;
        }
      `}</style>

      {/* Promotion Topbar */}
      <div className="bg-[#2A2A2A] text-white text-[11px] font-medium tracking-widest uppercase py-2 px-4 text-center flex items-center justify-center gap-2 z-50">
        <Sparkles className="w-3.5 h-3.5 text-[#B8C5A6]" />
        <span>Promocja do -40% w AS PIGMENTS! Bezpłatna dostawa od 300 PLN</span>
        <Sparkles className="w-3.5 h-3.5 text-[#B8C5A6]" />
      </div>

      {/* Fixed Main Header */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 cursor-pointer">
              <div className="border-2 border-black px-4 py-1.5">
                <div className="text-black font-bold text-lg tracking-tight leading-none">
                  AS <span className="font-light">COMPANY</span>
                </div>
                <div className="text-black text-[9px] tracking-widest uppercase">LOVELINESS PMU</div>
              </div>
            </Link>

            {/* Navigation Bar */}
            <nav className="hidden xl:flex items-center space-x-7">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link text-xs font-semibold tracking-wider transition-colors hover:text-black ${
                      isActive ? 'text-black nav-link-active' : 'text-gray-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-6">
              <Link href="/kontakt" className="text-xs font-semibold tracking-wider text-gray-700 hover:text-black transition-colors hidden sm:block">
                LOGOWANIE
              </Link>

              {/* Cart Drawer */}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <div className="relative cursor-pointer p-1">
                    <ShoppingCart className="w-5 h-5 text-gray-800 hover:text-black transition-colors" />
                    {totalItemsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#2A2A2A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {totalItemsCount}
                      </span>
                    )}
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-white flex flex-col justify-between">
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle className="text-lg font-bold flex items-center justify-between">
                      <span>Twój Koszyk Zakupowy</span>
                      <Badge variant="outline">{totalItemsCount} prod.</Badge>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm">
                        Twój koszyk jest pusty.
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-semibold block">{item.type}</span>
                            <h4 className="font-semibold text-sm text-gray-900">{item.name}</h4>
                            <span className="text-xs text-gray-500">{item.qty}x {item.price} PLN</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm">{item.price * item.qty} PLN</span>
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                      <span>Suma do zapłaty:</span>
                      <span className="text-xl text-[#2A2A2A]">{totalCartPrice} PLN</span>
                    </div>
                    <Button className="w-full bg-[#2A2A2A] hover:bg-black text-white py-6 uppercase tracking-wider text-xs font-semibold">
                      Przejdź do kasy <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#2A2A2A] text-white pt-16 pb-12 px-6 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="border border-white/20 inline-block px-3 py-1.5 mb-4">
              <div className="text-white font-bold text-base">AS COMPANY</div>
              <div className="text-white/60 text-[9px] tracking-widest">LOVELINESS PMU</div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Oficjalny dystrybutor maszynek bezprzewodowych AS HERO, AS PRINCESS oraz pigmentów mineralnych AS OPIUM w Polsce.
            </p>
            <p className="text-xs text-[#B8C5A6]">Salon & Akademia: ul. Bażantów 35, Katowice</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8C5A6] mb-4">Oferta i Produkty</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/maszynki" className="hover:text-white transition-colors">Maszynki PMU & Wynajem</Link></li>
              <li><Link href="/pigmenty" className="hover:text-white transition-colors">Pigmenty do ust & brwi</Link></li>
              <li><Link href="/pigmenty" className="hover:text-white transition-colors">Pigmenty Medyczne & Areola</Link></li>
              <li><Link href="/szkolenia" className="hover:text-white transition-colors">Szkolenia & Masterclass</Link></li>
              <li><Link href="/certyfikaty" className="hover:text-white transition-colors">Certyfikaty REACH EU</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8C5A6] mb-4">Obsługa Klienta</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Regulamin Sklepu</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Polityka Prywatności & Cookies</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Formularz Zwrotu i Reklamacji</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Czas i Koszty Dostawy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8C5A6] mb-4">Dołącz do Newslettera</h4>
            <p className="text-xs text-gray-400 mb-3">Zapisz się, aby otrzymywać informacje o nowych dostawach i rabatach do -40%.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Twój e-mail..." 
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-xs text-white placeholder-gray-500 flex-1 focus:outline-none focus:border-[#B8C5A6]"
              />
              <Button className="bg-[#B8C5A6] hover:bg-[#a6b593] text-black text-xs px-3 font-semibold">
                Zapisz
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2026 AS COMPANY LOVELINESS. Wszystkie prawa zastrzeżone.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white"><Facebook className="w-4 h-4" /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}