"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { saveHistory } from "@/lib/history";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDramaDetail, useEpisodes } from "@/hooks/useDramaDetail";
import { ChevronLeft, ChevronRight, Play, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DramaDetailDirect, DramaDetailResponseLegacy } from "@/types/drama";

const EPISODES_PER_PAGE = 30;

/* ================= HELPERS ================= */
function isDirectFormat(data: unknown): data is DramaDetailDirect {
  return (
    data !== null &&
    typeof data === "object" &&
    "bookId" in data &&
    "bookName" in data
  );
}

function isLegacyFormat(data: unknown): data is DramaDetailResponseLegacy {
  return (
    data !== null &&
    typeof data === "object" &&
    "data" in data &&
    (data as DramaDetailResponseLegacy).data?.book !== undefined
  );
}

/* ================= PAGE ================= */
export default function WatchPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [quality, setQuality] = useState(720);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { data: detailData, isLoading: detailLoading } = useDramaDetail(bookId);
  const { data: episodes, isLoading: episodesLoading } = useEpisodes(bookId);

  /* ===== INIT EPISODE DARI URL ===== */
  useEffect(() => {
    const ep = parseInt(searchParams.get("ep") || "0", 10);
    if (!isNaN(ep) && ep >= 0) {
      setCurrentEpisode(ep);
      setCurrentPage(Math.floor(ep / EPISODES_PER_PAGE));
    }
  }, [searchParams]);

  /* ===== DATA BUKU ===== */
  const book = useMemo(() => {
    if (isDirectFormat(detailData)) {
      return {
        bookId: detailData.bookId,
        bookName: detailData.bookName,
      };
    }

    if (isLegacyFormat(detailData)) {
      return {
        bookId: detailData.data.book.bookId,
        bookName: detailData.data.book.bookName,
      };
    }

    return null;
  }, [detailData]);

  /* ===== EPISODE AKTIF ===== */
  const currentEpisodeData = useMemo(() => {
    if (!episodes) return null;
    return episodes[currentEpisode] || null;
  }, [episodes, currentEpisode]);

  /* ===== SIMPAN HISTORY (AUTO) ===== */
useEffect(() => {
  if (!book || !currentEpisodeData) return;

  saveHistory({
    dramaId: book.bookId,
    slug: book.bookId, // ✅ FIX DI SINI
    title: book.bookName,
    poster: currentEpisodeData.chapterImg,
    episode: currentEpisode,
    updatedAt: Date.now(),
  });
}, [book, currentEpisode, currentEpisodeData]);


  /* ===== CDN & QUALITY ===== */
  const defaultCdn = useMemo(() => {
    if (!currentEpisodeData) return null;
    return (
      currentEpisodeData.cdnList.find((c) => c.isDefault === 1) ||
      currentEpisodeData.cdnList[0] ||
      null
    );
  }, [currentEpisodeData]);

  const availableQualities = useMemo(() => {
    const list =
      defaultCdn?.videoPathList
        ?.map((v) => v.quality)
        .filter((q): q is number => typeof q === "number") || [];

    return Array.from(new Set(list.length ? list : [720])).sort((a, b) => b - a);
  }, [defaultCdn]);

  useEffect(() => {
    if (!availableQualities.includes(quality)) {
      setQuality(availableQualities[0]);
    }
  }, [availableQualities, quality]);

  /* ===== VIDEO URL ===== */
  const videoUrl = useMemo(() => {
    if (!defaultCdn) return "";

    const v =
      defaultCdn.videoPathList.find((v) => v.quality === quality) ||
      defaultCdn.videoPathList.find((v) => v.isDefault === 1) ||
      defaultCdn.videoPathList[0];

    return v?.videoPath || "";
  }, [defaultCdn, quality]);

  /* ===== NAVIGASI ===== */
  const handleEpisodeChange = (index: number) => {
    setCurrentEpisode(index);
    router.push(`/watch/${bookId}?ep=${index}`);
  };

  const handleVideoEnded = () => {
    if (!episodes) return;
    if (currentEpisode < episodes.length - 1) {
      handleEpisodeChange(currentEpisode + 1);
    }
  };

  /* ===== PAGINATION ===== */
  const totalPages = useMemo(() => {
    if (!episodes) return 0;
    return Math.ceil(episodes.length / EPISODES_PER_PAGE);
  }, [episodes]);

  const startIndex = currentPage * EPISODES_PER_PAGE;
  const endIndex = Math.min(
    startIndex + EPISODES_PER_PAGE,
    episodes?.length || 0
  );

  const currentPageEpisodes = useMemo(() => {
    if (!episodes) return [];
    return episodes.slice(startIndex, endIndex);
  }, [episodes, startIndex, endIndex]);

  /* ===== LOADING ===== */
  if (detailLoading || episodesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!book || !episodes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Drama tidak ditemukan
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <main className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/detail/${bookId}`}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* PLAYER */}
          <div>
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                key={`${currentEpisode}-${quality}`}
                src={videoUrl}
                controls
                autoPlay
                onEnded={handleVideoEnded}
                poster={currentEpisodeData?.chapterImg}
                className="w-full h-full"
              />

              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 bg-black/60 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {availableQualities.map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q)}
                      >
                        {q}p
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <h1 className="mt-4 font-bold text-xl">
              {book.bookName} — Episode {currentEpisode + 1}
            </h1>
          </div>

{/* EPISODE LIST */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                Episode {startIndex + 1} - {endIndex}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1.5 rounded-lg bg-muted disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="p-1.5 rounded-lg bg-muted disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {currentPageEpisodes.map((ep) => (
                <button
                  key={ep.chapterId}
                  onClick={() => handleEpisodeChange(ep.chapterIndex)}
                  className={`rounded-lg aspect-square ${
                    ep.chapterIndex === currentEpisode
                      ? "bg-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  {ep.chapterIndex + 1}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
