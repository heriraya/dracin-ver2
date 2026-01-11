"use client";

import Link from "next/link";
import { useHistory } from "@/hooks/use-history";

export default function HistoryContinue() {
  const history = useHistory();

  if (!history.length) return null;

  return (
    <section className="px-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">
        Lanjutkan Menonton
      </h2>

      <div className="flex gap-4 overflow-x-auto">
        {history.map(item => (
          <Link
            key={item.dramaId}
            href={`/watch/${item.slug}/${item.episode}`}
            className="min-w-[140px]"
          >
            <img
              src={item.poster}
              className="rounded-xl h-44 object-cover"
            />
            <p className="text-sm mt-1 line-clamp-2">
              {item.title}
            </p>
            <span className="text-xs text-gray-400">
              Episode {item.episode}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
