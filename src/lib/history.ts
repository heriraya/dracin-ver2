export type History = {
  dramaId: string;
  slug: string;
  title: string;
  poster: string;
  episode: number;
  updatedAt: number;
};

const KEY = "dramabox_history";
const LIMIT = 20;

export function getHistory(): History[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(item: History) {
  if (typeof window === "undefined") return;

  const list = getHistory().filter(
    (h) => h.dramaId !== item.dramaId
  );

  list.unshift(item);

  localStorage.setItem(
    KEY,
    JSON.stringify(list.slice(0, LIMIT))
  );
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
