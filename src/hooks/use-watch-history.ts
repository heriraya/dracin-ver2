"use client";

import { useEffect, useState } from "react";
import { History } from "@/types/history";
import { getHistory } from "@/lib/history";

export const useHistory = () => {
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return history;
};
