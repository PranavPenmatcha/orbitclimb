import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Starfield from '@/components/Starfield';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ORBIT — Daily Rarity Game',
  description: 'Pick a category. Answer rare, climb higher. Seven prompts a day, ranked by how few players said what you said.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
        style={
          {
            '--font-display': 'var(--font-display-loaded), "Segoe UI", system-ui, sans-serif',
            '--font-mono': 'var(--font-mono-loaded), "SF Mono", ui-monospace, monospace',
          } as React.CSSProperties
        }
      >
        <Starfield />
        {children}
      </body>
    </html>
  );
}
