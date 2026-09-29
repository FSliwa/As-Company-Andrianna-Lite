/* Root layout wersji rosyjskiej (/ru/…). Wspólny szkielet — src/i18n/RootShell.jsx. */
import RootShell, { rootMetadata, rootViewport } from '@/i18n/RootShell';

export const metadata = rootMetadata('ru');
export const viewport = rootViewport;

export default function RootLayout({ children }) {
  return <RootShell locale="ru">{children}</RootShell>;
}
