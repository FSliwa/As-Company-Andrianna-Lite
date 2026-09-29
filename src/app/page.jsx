import Home from '@/views/Home';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  alternates: { canonical: '/' },
};

export default function Page() {
  return <Home />;
}
