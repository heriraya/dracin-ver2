import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense } from "react";
import { MobileFooter } from "@/components/MobileFooter";

export const metadata: Metadata = {
  title: "DramaSia - Streaming Drama Pendek",
  description: "Nonton drama pendek gratis dan tanpa iklan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <Suspense fallback={<div className="h-16" />}>
            <Header />
          </Suspense>

          {/* 🔽 KONTEN */}
          <main className="min-h-screen pb-24">
            {children}
          </main>

          {/* 🔽 DESKTOP FOOTER */}
          <footer className="hidden md:block">
            <Footer />
          </footer>

          {/* 🔽 MOBILE FLOATING FOOTER */}
          <MobileFooter />

          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
