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
  themeColor: "#f8fafc",
};

export const metadata: Metadata = {
  title: "LOGARITMA.ID",
  description: "Ekosistem SaaS untuk bisnis F&B, Ritel, dan Jasa",
  icons: {
    icon: '/logo-ubos.png',
    apple: '/logo-ubos.png',
  }
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
