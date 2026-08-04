import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import AppShell from "@/components/AppShell";

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  title: 'UBOS - Universal Business Operation System',
  description: 'Pusat Kontrol Ekosistem & Operasional Bisnis UMKM',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UBOS',
  },
  icons: {
    icon: '/icon192.png',
    shortcut: '/favicon.ico',
    apple: '/icon192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} font-sans`}>
      <body className={`${poppins.className} bg-slate-200 text-slate-900 antialiased`}>
        <AppShell>
          {children}
        </AppShell>
        <Toaster position="top-center" toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
          },
        }} />
      </body>
    </html>
  );
}
