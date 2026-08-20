import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UBOS - UMKM Business Operation System",
  description: "Sistem Operasi Bisnis untuk UMKM Indonesia",
};

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import FeedbackButton from "@/components/FeedbackButton"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  let businessId = null
  if (session?.user?.id) {
    const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
    if (business) businessId = business.id
  }

  return (
    <html lang="id">
      <body className={`${poppins.className} bg-gray-50 antialiased`}>
        {children}
        <FeedbackButton businessId={businessId} />
      </body>
    </html>
  );
}
