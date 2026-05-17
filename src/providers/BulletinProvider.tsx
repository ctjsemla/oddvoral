"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Match, Sport } from "@/types";
import {
  filterBySport,
  filterLive,
  filterPopular,
  getMatchFromList,
} from "@/lib/bulletin";
import { t } from "@/lib/i18n/en-IN";

interface BulletinContextValue {
  matches: Match[];
  source: string;
  updatedAt: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getMatch: (id: string) => Match | undefined;
  getBySport: (sport: Sport) => Match[];
  getLive: () => Match[];
  getPopular: (limit?: number) => Match[];
}

const BulletinContext = createContext<BulletinContextValue | null>(null);

const POLL_MS = 45_000;

export function BulletinProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [source, setSource] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/bulletin", { cache: "no-store" });
      const data = await res.json();
      const list = data.matches ?? [];
      if (!res.ok && list.length === 0) {
        throw new Error(data.error ?? t.bulletin.loadError);
      }
      if (list.length === 0) {
        throw new Error(t.bulletin.loadError);
      }
      setMatches(list);
      setSource(data.source ?? "live");
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
      setError(null);
    } catch (e) {
      try {
        const { generateFallbackBulletin } = await import("@/data/matches-fallback");
        const fallback = generateFallbackBulletin();
        setMatches(fallback);
        setSource("fallback");
        setUpdatedAt(new Date().toISOString());
        setError(
          e instanceof Error && e.message !== t.bulletin.loadError
            ? e.message
            : null
        );
      } catch {
        setError(e instanceof Error ? e.message : t.bulletin.connectionError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => {
      void refresh();
    }, 0);
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(id);
    };
  }, [refresh]);

  const value = useMemo<BulletinContextValue>(
    () => ({
      matches,
      source,
      updatedAt,
      loading,
      error,
      refresh,
      getMatch: (id) => getMatchFromList(matches, id),
      getBySport: (sport) => filterBySport(matches, sport),
      getLive: () => filterLive(matches),
      getPopular: (limit) => filterPopular(matches, limit),
    }),
    [matches, source, updatedAt, loading, error, refresh]
  );

  return (
    <BulletinContext.Provider value={value}>{children}</BulletinContext.Provider>
  );
}

export function useBulletin() {
  const ctx = useContext(BulletinContext);
  if (!ctx) throw new Error("useBulletin must be used within BulletinProvider");
  return ctx;
}
