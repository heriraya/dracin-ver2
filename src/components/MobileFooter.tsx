"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Mic, Crown, History } from "lucide-react";

const menus = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/foryou", label: "Untuk Anda", icon: Sparkles },
  { href: "/language", label: "Bhs Indo", icon: Mic },
  { href: "/history", label: "Riwayat", icon: History },
];

export function MobileFooter() {
  const pathname = usePathname();

  // ❗ Optional: sembunyikan footer saat nonton
  if (pathname.startsWith("/watch")) return null;

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-1 px-3 py-2 rounded-full glass-strong shadow-2xl">
        {menus.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center px-3 py-1 text-[11px] transition-all ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition ${
                  active ? "text-primary" : ""
                }`}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
