/* Root layout wersji angielskiej (/en/…). Wspólny szkielet — src/i18n/RootShell.jsx. */
import RootShell, { rootMetadata, rootViewport } from '@/i18n/RootShell';

export const metadata = rootMetadata('en');
export const viewport = rootViewport;

export default function RootLayout({ children }) {
  return <RootShell locale="en">{children}</RootShell>;
}
