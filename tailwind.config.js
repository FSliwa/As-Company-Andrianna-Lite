const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx,js,jsx}"],
    /* hover: tylko na urządzeniach z kursorem (@media (hover: hover) and (pointer: fine)) –
       na dotyku stan hover „przyklejał się” po stuknięciu (akordeony, „Więcej”). */
    future: {
      hoverOnlyWhenSupported: true,
    },
  theme: {
  	extend: {
  		fontFamily: {
  			display: ['var(--font-display)', 'Bodoni Moda', 'Didot', 'Georgia', 'serif'],
  			sans: ['var(--font-sans)', 'Jost', 'Inter', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			/* ——— Paleta marki AS COMPANY (wyprowadzona z makiety) ——— */
  			/* bez DEFAULT: dawny #F6F1E8 był spoza palety (body ma teraz bg-cream-50) */
  			cream: {
  				50: '#FBF8F3',
  				100: '#F3EBE0',
  				200: '#EBE1D2',
  				300: '#DED2BF',
  			},
  			espresso: {
  				DEFAULT: '#382B22',
  				700: '#33261D',
  				800: '#2B2018',
  				900: '#241B14',
  				600: '#4A3A2E',
  			},
  			mocha: {
  				DEFAULT: '#695647',
  				400: '#8A7867',
  				500: '#7A6857',
  				600: '#665342',
  				700: '#54463A',
  			},
  			gold: {
  				DEFAULT: '#B89768',
  				light: '#D8C3A0',
  				pale: '#E8DBC4',
  				dark: '#9A7C52',
  				/* drobny tekst złoty na kremie — AA: 5,0:1 na cream-50, 4,5:1 na cream-100 */
  				deep: '#806744',
  			},
  			ink: '#241B14',
  			/* ——— tokeny shadcn (zostawione dla komponentów ui/) ——— */
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  		},
  		transitionTimingFunction: {
  			as: 'cubic-bezier(0.22, 1, 0.36, 1)',
  		},
  		transitionDuration: {
  			'900': '900ms',
  		},
  		letterSpacing: {
  			label: '0.18em',
  			wider2: '0.14em',
  		},
  		/* --radius = 0 (src/index.css): rounded-lg/md/sm w komponentach ui/ dają
  		   prostokąt. Jedyny zaokrąglony element serwisu to pigułka (rounded-full). */
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'max(0px, calc(var(--radius) - 2px))',
  			sm: 'max(0px, calc(var(--radius) - 4px))'
  		},
  		maxWidth: {
  			/* Łam treści 1440 px (makieta ~1320 px); szersze ekrany dostają marginesy. */
  			shell: '1440px',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			/* Dialog, nakładka i komunikat (toast): samo zanikanie, bez przesunięć
  			   i powiększeń (zasada 9). Dawne as-rise/as-fade usunięte – były martwe,
  			   a as-rise kolidowało z @keyframes wejścia hero w src/index.css. */
  			'as-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'as-out': {
  				from: { opacity: '1' },
  				to: { opacity: '0' }
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'as-in': 'as-in 200ms ease-out both',
  			'as-out': 'as-out 150ms ease-in both',
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    /* Warianty wysokości ekranu. NIE jako theme.screens: ekran typu { raw } wyłącza
       w Tailwind 3 wszystkie warianty max-* (max-sm:, max-md: …), których serwis używa.
       short: telefon w poziomie (niski ekran < lg) · tall: ekran co najmniej 640 px wysokości. */
    plugin(function ({ addVariant }) {
      addVariant('short', '@media (max-width: 1023px) and (max-height: 500px)');
      addVariant('tall', '@media (min-height: 640px)');
    }),
  ],
}
