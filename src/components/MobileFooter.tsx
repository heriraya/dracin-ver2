"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Mic, Crown, History } from "lucide-react";

const menus = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/foryou", label: "Untuk Anda", icon: Sparkles },
  { href: "/language", label: "Bhs Indo", icon: Mic },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/history", label: "Riwayat", icon: History },
];

export function MobileFooter() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-strong shadow-xl">
        {menus.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center px-3 py-1 text-xs transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
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
