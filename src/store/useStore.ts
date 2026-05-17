"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOOKMAKERS } from "@/data/bookmakers";
import type { CouponSelection, OddsFormat, Sport, UserSettings } from "@/types";

interface AppState {
  settings: UserSettings;
  coupon: CouponSelection[];
  favorites: string[];
  alerts: { matchId: string; outcome: string; targetOdds: number }[];

  setOddsFormat: (format: OddsFormat) => void;
  toggleBookmaker: (id: string) => void;
  toggleFavoriteSport: (sport: Sport) => void;
  addToCoupon: (selection: CouponSelection) => void;
  removeFromCoupon: (matchId: string) => void;
  clearCoupon: () => void;
  toggleFavorite: (matchId: string) => void;
  addAlert: (alert: { matchId: string; outcome: string; targetOdds: number }) => void;
}

const defaultSettings: UserSettings = {
  oddsFormat: "decimal",
  timezone: "Asia/Kolkata",
  enabledBookmakers: BOOKMAKERS.map((b) => b.id),
  favoriteSports: ["football", "basketball"],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      coupon: [],
      favorites: [],
      alerts: [],

      setOddsFormat: (format) =>
        set((s) => ({ settings: { ...s.settings, oddsFormat: format } })),

      toggleBookmaker: (id) =>
        set((s) => {
          const enabled = s.settings.enabledBookmakers;
          const next = enabled.includes(id)
            ? enabled.filter((b) => b !== id)
            : [...enabled, id];
          return { settings: { ...s.settings, enabledBookmakers: next } };
        }),

      toggleFavoriteSport: (sport) =>
        set((s) => {
          const favs = s.settings.favoriteSports;
          const next = favs.includes(sport)
            ? favs.filter((f) => f !== sport)
            : [...favs, sport];
          return { settings: { ...s.settings, favoriteSports: next } };
        }),

      addToCoupon: (selection) =>
        set((s) => {
          const filtered = s.coupon.filter((c) => c.matchId !== selection.matchId);
          return { coupon: [...filtered, selection] };
        }),

      removeFromCoupon: (matchId) =>
        set((s) => ({ coupon: s.coupon.filter((c) => c.matchId !== matchId) })),

      clearCoupon: () => set({ coupon: [] }),

      toggleFavorite: (matchId) =>
        set((s) => ({
          favorites: s.favorites.includes(matchId)
            ? s.favorites.filter((f) => f !== matchId)
            : [...s.favorites, matchId],
        })),

      addAlert: (alert) =>
        set((s) => ({ alerts: [...s.alerts, alert] })),
    }),
    { name: "oddvoral-odds-store" }
  )
);
