"use client";

import { useEffect, useState } from "react";
import { WatchHistory } from "@/types/watch-history";
import { getWatchHistory } from "@/lib/watch-history";

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistory[]>([]);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  return history;
};
