import { WatchHistory } from "@/types/watch-history";

const KEY = "dramabox_watch_history";

export const getWatchHistory = (): WatchHistory[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
};

export const addWatchHistory = (item: WatchHistory) => {
  if (typeof window === "undefined") return;

  const history = getWatchHistory();

  const filtered = history.filter(h => h.id !== item.id);

  const updated = [item, ...filtered].slice(0, 50);

  localStorage.setItem(KEY, JSON.stringify(updated));
};

export const clearWatchHistory = () => {
  localStorage.removeItem(KEY);
};
