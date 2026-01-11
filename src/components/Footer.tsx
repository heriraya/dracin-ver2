import Link from "next/link";
import { Play, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          <span className="font-bold">DramaSia</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Beranda
          </Link>
          <a
            href="https://example.com"
            target="_blank"
            className="flex items-center gap-1 hover:text-foreground"
          >
            External <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
