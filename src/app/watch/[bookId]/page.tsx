"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { saveHistory } from "@/lib/history";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDramaDetail, useEpisodes } from "@/hooks/useDramaDetail";
import { ChevronLeft, ChevronRight, Loader2, Settings, X } from "lucide-react";
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
  const [showEpisodeList, setShowEpisodeList] = useState(false);

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
      slug: book.bookId,
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
    setCurrentPage(Math.floor(index / EPISODES_PER_PAGE));
    router.push(`/watch/${bookId}?ep=${index}`);
    setShowEpisodeList(false);
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
    <main className="min-h-screen bg-black">
      {/* VIDEO PLAYER FULLSCREEN */}
      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
          key={`${currentEpisode}-${quality}`}
          src={videoUrl}
          controls
          autoPlay
          onEnded={handleVideoEnded}
          poster={currentEpisodeData?.chapterImg}
          className="w-full h-full object-contain"
        />

        {/* HEADER OVERLAY */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <Link
              href={`/detail/${bookId}`}
              className="flex items-center gap-2 text-white hover:text-gray-300"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm font-medium">Kembali</span>
            </Link>

            <button
              onClick={() => setShowEpisodeList(true)}
              className="text-white text-sm font-medium hover:text-gray-300"
            >
              Ep.{currentEpisode + 1} / {episodes.length} Episodes
            </button>
          </div>
        </div>

        {/* QUALITY SETTINGS */}
        <div className="absolute top-20 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-3 bg-black/60 rounded-lg text-white backdrop-blur-sm hover:bg-black/80">
                <Settings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              {availableQualities.map((q) => (
                <DropdownMenuItem
                  key={q}
                  onClick={() => setQuality(q)}
                  className="text-white hover:bg-gray-800"
                >
                  {q}p {q === quality && "✓"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* EPISODE LIST MODAL */}
      {showEpisodeList && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="relative p-6 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <img
                  src={currentEpisodeData?.chapterImg}
                  alt={book.bookName}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-white font-bold text-lg">{book.bookName}</h2>
                  <p className="text-gray-400 text-sm mt-1">{episodes.length} episode</p>
                </div>
                <button
                  onClick={() => setShowEpisodeList(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-6 mt-6">
                <button className="text-yellow-500 font-semibold pb-2 border-b-2 border-yellow-500">
                  EPISODE
                </button>
                <button className="text-gray-400 font-semibold pb-2">
                  DESKRIPSI
                </button>
              </div>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="text-white disabled:opacity-30 disabled:cursor-not-allowed hover:text-yellow-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white text-sm">
                {startIndex + 1} - {endIndex} / {episodes.length}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="text-white disabled:opacity-30 disabled:cursor-not-allowed hover:text-yellow-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* EPISODE GRID */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-5 gap-3">
                {currentPageEpisodes.map((ep) => (
                  <button
                    key={ep.chapterId}
                    onClick={() => handleEpisodeChange(ep.chapterIndex)}
                    className={`aspect-square rounded-xl text-lg font-bold transition-all ${
                      ep.chapterIndex === currentEpisode
                        ? "bg-yellow-500 text-black"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {ep.chapterIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
