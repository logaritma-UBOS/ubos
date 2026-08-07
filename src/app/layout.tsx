import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import AppShell from "@/components/AppShell";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: 'Logaritma - Kalkulator Profit & Margin Guard UMKM',
  description: 'Aplikasi kasir anti dead-stock dan margin guard untuk warung, toko, percetakan, dan laundry. Temukan HPP aslimu sekarang.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Logaritma',
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
      
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
          `
        }} />

        <body className={`${poppins.className} bg-slate-200 text-slate-900 antialiased`}>
        <AppShell>
          {children}
        </AppShell>
        <PwaInstallPrompt />
        <Toaster 
          position="top-center" 
          toastOptions={{
            classNames: {
              toast: 'group shadow-lg border border-slate-100/80 rounded-xl bg-white font-medium',
              title: 'text-slate-800 text-[13px] font-bold',
              description: 'text-slate-500 text-[12px]',
              success: 'group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50',
              error: 'group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50',
              info: 'group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50'
            }
          }} 
        />
      </body>
    </html>
  );
}
