/* Root layout wersji polskiej (adresy bez prefiksu). Wspólny szkielet — src/i18n/RootShell.jsx. */
import RootShell, { rootMetadata, rootViewport } from '@/i18n/RootShell';

export const metadata = rootMetadata('pl');
export const viewport = rootViewport;

export default function RootLayout({ children }) {
  return <RootShell locale="pl">{children}</RootShell>;
}
