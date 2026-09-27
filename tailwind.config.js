/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			display: ['var(--font-display)', 'Bodoni Moda', 'Didot', 'Georgia', 'serif'],
  			sans: ['var(--font-sans)', 'Jost', 'Inter', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			/* ——— Paleta marki AS COMPANY (wyprowadzona z makiety) ——— */
  			cream: {
  				DEFAULT: '#F6F1E8',
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
  			label: '0.22em',
  			wider2: '0.14em',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		maxWidth: {
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
  			'as-rise': {
  				from: { opacity: '0', transform: 'translateY(18px)' },
  				to: { opacity: '1', transform: 'none' }
  			},
  			'as-fade': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'as-rise': 'as-rise 0.8s cubic-bezier(0.22,1,0.36,1) both',
  			'as-fade': 'as-fade 1.1s ease-out both',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
