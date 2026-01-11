import { History } from "@/types/history";

const KEY = "dramabox_history";

export const getHistory = (): History[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
};

export const saveHistory = (data: History) => {
  if (typeof window === "undefined") return;

  const list = getHistory();

  // 1 drama = 1 history
  const filtered = list.filter(item => item.dramaId !== data.dramaId);

  const updated = [data, ...filtered].slice(0, 50);

  localStorage.setItem(KEY, JSON.stringify(updated));
};

export const clearHistory = () => {
  localStorage.removeItem(KEY);
};
