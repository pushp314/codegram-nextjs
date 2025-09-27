// src/app/layout.tsx

import './globals.css';
import { Providers } from './providers';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <Providers>
            {children}
          </Providers>
      </body>
    </html>
  );
}