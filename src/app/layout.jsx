import '@/index.css';
import Layout from '@/Layout';
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: 'AS COMPANY LOVELINESS | Maszynki PMU, Pigmenty & Akademia Katowice',
  description: 'Oficjalny serwis dystrybutora maszynek bezprzewodowych AS HERO, AS PRINCESS oraz barwników mineralnych AS OPIUM w Polsce. Usługi salonu, koworking i szkolenia PMU.',
  keywords: 'maszynka pmu, pigmenty mineralne, makijaż permanentny katowice, as princess, as hero, szkolenia pmu, ambasadorki pmu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Layout>
          {children}
        </Layout>
        <Toaster />
      </body>
    </html>
  );
}
