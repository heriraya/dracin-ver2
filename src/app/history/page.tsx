"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory, type History } from "@/lib/history";
import { Play, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (!history.length) {
    return (
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto text-center py-24">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <h1 className="text-xl font-bold mb-2">Belum ada history</h1>
          <p className="text-muted-foreground">
            Drama yang kamu tonton akan muncul di sini
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">History Tontonan</h1>
          <button
            onClick={() => {
              clearHistory();
              setHistory([]);
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:underline"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </button>
        </div>

        <div className="grid gap-4">
          {history.map((item) => (
            <Link
              key={item.dramaId}
              href={`/watch/${item.slug}?ep=${item.episode}`}
              className="flex gap-4 p-4 rounded-xl bg-card hover:bg-muted transition"
            >
              <img
                src={item.poster}
                alt={item.title}
                className="w-20 h-28 rounded-lg object-cover"
              />

              <div className="flex-1">
                <h2 className="font-semibold line-clamp-1">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Episode terakhir: {item.episode + 1}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Terakhir ditonton:{" "}
                  {new Date(item.updatedAt).toLocaleString()}
                </p>
              </div>

              <Play className="w-5 h-5 self-center opacity-50" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
