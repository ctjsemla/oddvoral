"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getMatch: (id: string) => Match | undefined;
  getBySport: (sport: Sport) => Match[];
  getLive: () => Match[];
  getPopular: (limit?: number) => Match[];
}

const BulletinContext = createContext<BulletinContextValue | null>(null);

/** Fast refresh while live fixtures exist; slower otherwise. */
const POLL_LIVE_MS = 10_000;
const POLL_IDLE_MS = 30_000;
function hasLiveMatches(list: Match[]) {
  return list.some((m) => m.status === "live");
}

export function BulletinProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [source, setSource] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matchesRef = useRef(matches);
  const initialLoadDone = useRef(false);

  matchesRef.current = matches;

  const refresh = useCallback(async (silent = false) => {
    if (!silent && !initialLoadDone.current) {
      setLoading(true);
    } else if (silent) {
      setRefreshing(true);
    }
    try {
      const res = await fetch(`/api/bulletin?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
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
      if (!silent || matchesRef.current.length === 0) {
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
      }
    } finally {
      initialLoadDone.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    const schedulePoll = () => {
      if (cancelled) return;
      const delay = hasLiveMatches(matchesRef.current) ? POLL_LIVE_MS : POLL_IDLE_MS;
      pollTimer = setTimeout(async () => {
        await refresh(true);
        schedulePoll();
      }, delay);
    };

    void refresh(false).then(() => {
      if (!cancelled) schedulePoll();
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh(true);
        clearTimeout(pollTimer);
        schedulePoll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const value = useMemo<BulletinContextValue>(
    () => ({
      matches,
      source,
      updatedAt,
      loading,
      refreshing,
      error,
      refresh: () => refresh(true),
      getMatch: (id) => getMatchFromList(matches, id),
      getBySport: (sport) => filterBySport(matches, sport),
      getLive: () => filterLive(matches),
      getPopular: (limit) => filterPopular(matches, limit),
    }),
    [matches, source, updatedAt, loading, refreshing, error, refresh]
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
