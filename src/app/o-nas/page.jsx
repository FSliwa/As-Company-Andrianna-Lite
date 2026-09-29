import About from '@/views/About';

/* Wrapper serwerowy: metadata trasy; sam widok jest komponentem klienckim. */
export const metadata = {
  title: 'O nas — Andriana Babushkina',
  description:
    'Linergistka, trenerka i sędzia międzynarodowa, autorka techniki Super Natural Brows. Salon makijażu permanentnego i Babushkina Academy w Warszawie.',
  alternates: { canonical: '/o-nas' },
};

export default function Page() {
  return <About />;
}
