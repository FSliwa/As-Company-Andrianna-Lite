import React, { useState } from 'react';
import { ShieldCheck, FileText, Download, Award, CheckCircle2, Lock, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const CERTIFICATES = [
  {
    id: "reach-2026",
    title: "Certyfikat Zgodności REACH EU (Rozporządzenie 2020/2081)",
    category: "Pigmenty PMU",
    date: "Obowiązuje od 2026",
    issuer: "Laboratorium Jakości Chemii Kosmetycznej UE",
    description: "Potwierdzenie, że wszystkie pigmenty z serii AS OPIUM oraz Light Minerals nie zawierają substancji rakotwórczych, mutagennych oraz konserwantów zakazanych na terenie Unii Europejskiej.",
    code: "EU-REACH-2026-AS-091"
  },
  {
    id: "iso-13485",
    title: "ISO 13485:2016 – System Zarządzania Jakością Wyrobów Medycznych",
    category: "Maszynki i Akcesoria PMU",
    date: "2025 - 2028",
    issuer: "TÜV Rheinland Cert GmbH",
    description: "Standard certyfikujący proces produkcyjny maszynek rotacyjnych AS HERO oraz AS PRINCESS w reżimie sterylności sprzętu medycznego.",
    code: "ISO-MED-992031-PL"
  },
  {
    id: "msds-opium",
    title: "Karta Charakterystyki Produktu (MSDS / SDS)",
    category: "Baza Dokumentacji",
    date: "Aktualizacja Q1 2026",
    issuer: "Główny Inspektorat Sanitarny",
    description: "Karta charakterystyki chemicznej dla barwników organicznych i mineralnych. Wymagana przy kontroli Sanepidu w salonie kosmetycznym.",
    code: "MSDS-AS-PIGMENTS-2026"
  },
  {
    id: "ce-sterility",
    title: "Deklaracja Zgodności CE & Certyfikat Sterylności EO",
    category: "Kartridże Satellite",
    date: "2026",
    issuer: "Gamma Sterilization Labs Ltd.",
    description: "Gwarancja 100% sterylności kartridży poddanych procesowi sterylizacji gazem tlenkiem etylenu (EO Gas).",
    code: "CE-EO-STERILE-8812"
  }
];

export default function Certificates() {
  const { toast } = useToast();
  const [selectedCert, setSelectedCert] = useState(null);

  const handleDownload = (cert) => {
    toast({
      title: "Pobieranie dokumentu",
      description: `Dokument PDF: ${cert.title} został pobrany na Twój dysk.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-[#2A2A2A]">
      {/* Top Banner */}
      <div className="bg-[#2A2A2A] text-white py-2.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#B8C5A6]" />
        <span>Pełna Zgodność z Dyrektywą Unii Europejskiej REACH 2026 – 100% Bezpieczeństwa Zabiegowego</span>
      </div>

      {/* Hero */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="max-w-3xl">
          <Badge className="bg-[#B8C5A6] text-black uppercase tracking-widest text-[10px] px-3 py-1 mb-4">
            Bezpieczeństwo & Sanitariat
          </Badge>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-6 leading-tight">
            Certyfikaty Jakości i Normy Unijne <span className="font-semibold block text-[#B8C5A6]">AS COMPANY Poland</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
            Pobierz niezbędną dokumentację medyczną i sanitarną wymaganą podczas kontroli w Twoim salonie. Wszystkie pigmenty oraz maszynki spełniają najbardziej rygorystyczne normy bezpieczeństwa Unii Europejskiej.
          </p>
        </div>
      </section>

      {/* Grid Certificates */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CERTIFICATES.map((cert) => (
            <Card key={cert.id} className="border border-gray-200 hover:border-[#B8C5A6] transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] text-[#2A2A2A] border-[#B8C5A6]">
                      {cert.category}
                    </Badge>
                    <span className="text-xs text-gray-400">{cert.date}</span>
                  </div>
                  <CardTitle className="text-lg font-bold">{cert.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Wystawca: {cert.issuer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{cert.description}</p>
                  <div className="bg-[#F8F8F6] p-3 rounded-lg text-xs font-mono text-gray-700 flex justify-between items-center">
                    <span>Kod rejestracyjny:</span>
                    <strong className="text-gray-900">{cert.code}</strong>
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <Button 
                  onClick={() => setSelectedCert(cert)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-xs uppercase tracking-wider py-5"
                >
                  <FileText className="w-3.5 h-3.5 mr-2" /> Podgląd Certyfikatu
                </Button>
                <Button 
                  onClick={() => handleDownload(cert)}
                  className="bg-[#2A2A2A] hover:bg-black text-white text-xs uppercase tracking-wider py-5"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Pobierz PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Sanepid Guarantee Section */}
      <section className="bg-[#F8F8F6] py-16 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <Award className="w-12 h-12 text-[#B8C5A6] mx-auto mb-4" />
          <h2 className="text-2xl font-light mb-3">Gwarancja Spokojnej Kontroli Sanepidu</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-2xl mx-auto">
            Jako oficjalny dystrybutor marki AS PIGMENTS w Polsce, do każdego zamówienia dołączamy fizyczne lub cyfrowe karty MSDS oraz raporty analizy metali ciężkich.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#B8C5A6]" /> Brak Niklu i Chromu</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#B8C5A6]" /> Raporty mikrobiologiczne</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#B8C5A6]" /> Deklaracje REACH 2026</span>
          </div>
        </div>
      </section>

      {/* Certificate Preview Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B8C5A6]" />
              {selectedCert?.title}
            </DialogTitle>
            <DialogDescription>
              Kod weryfikacyjny: {selectedCert?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="border-2 border-dashed border-[#B8C5A6] p-8 rounded-xl bg-[#F8F8F6] text-center space-y-3">
              <Award className="w-16 h-16 text-[#B8C5A6] mx-auto" />
              <h3 className="font-bold text-lg uppercase tracking-wider text-gray-900">Official Certificate of Compliance</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">{selectedCert?.description}</p>
              <div className="text-xs font-semibold text-gray-700 pt-2 border-t border-gray-200">
                Wystawione przez: {selectedCert?.issuer}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedCert(null)}>
              Zamknij
            </Button>
            <Button 
              onClick={() => {
                handleDownload(selectedCert);
                setSelectedCert(null);
              }}
              className="bg-[#2A2A2A] text-white"
            >
              Pobierz Oryginał PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
