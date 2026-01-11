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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {/* HEADER */}
          <Suspense fallback={<div className="h-16" />}>
            <Header />
          </Suspense>

          {/* CONTENT */}
          <main className="pb-20 md:pb-0">
            {children}
          </main>

          {/* DESKTOP FOOTER ONLY */}
          <div className="hidden md:block">
            <Footer />
          </div>

          {/* MOBILE FLOATING FOOTER */}
          <MobileFooter />

          {/* TOASTERS */}
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
