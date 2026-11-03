import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JanSetu AI — Government services, simplified for everyone',
  description: 'A citizen-first guide to Indian government services, schemes and public processes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
