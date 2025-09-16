import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

export const metadata: Metadata = {
  title: 'AccessKey',
  description: 'Sistema de Controle de Acesso RFID',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WebSocketProvider>
          <AppShell>{children}</AppShell>
        </WebSocketProvider>
        <Toaster />
      </body>
    </html>
  );
}
