"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PromoBannerId } from "@/data/promo-banners";

export interface BannerClickEvent {
  bannerId: PromoBannerId;
  at: string;
  source: "logo" | "claim";
}

interface AdminState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  bannerClicks: BannerClickEvent[];
  login: (password: string) => boolean;
  logout: () => void;
  setHasHydrated: () => void;
  trackBannerClick: (bannerId: PromoBannerId, source: "logo" | "claim") => void;
  getClicksInRange: (start: Date, end: Date) => BannerClickEvent[];
}

const ADMIN_PASSWORD = "oddvoral-admin";

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasHydrated: false,
      bannerClicks: [],

      setHasHydrated: () => set({ hasHydrated: true }),

      login: (password) => {
        if (password !== ADMIN_PASSWORD) return false;
        set({ isAuthenticated: true });
        return true;
      },

      logout: () => set({ isAuthenticated: false }),

      trackBannerClick: (bannerId, source) => {
        set((s) => ({
          bannerClicks: [
            ...s.bannerClicks,
            { bannerId, source, at: new Date().toISOString() },
          ].slice(-5000),
        }));
      },

      getClicksInRange: (start, end) => {
        const a = start.getTime();
        const b = end.getTime();
        return get().bannerClicks.filter((e) => {
          const t = new Date(e.at).getTime();
          return t >= a && t <= b;
        });
      },
    }),
    {
      name: "oddvoral-admin",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        bannerClicks: state.bannerClicks,
      }),
      onRehydrateStorage: () => (_state, err) => {
        if (!err) {
          useAdminStore.getState().setHasHydrated();
        }
      },
    }
  )
);

export function countTrackedClicks(
  events: BannerClickEvent[],
  bannerId?: PromoBannerId
): number {
  return events.filter((e) => !bannerId || e.bannerId === bannerId).length;
}
