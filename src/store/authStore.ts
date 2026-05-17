"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { t } from "@/lib/i18n/en-IN";
import type {
  Prediction,
  RegisteredUser,
  PredictionStatus,
  SettledCoupon,
  CouponSelection,
} from "@/types";

export interface AuthState {
  currentUserId: string | null;
  registeredUsers: RegisteredUser[];
  userPredictions: Prediction[];
  userCoupons: SettledCoupon[];
  likedPredictions: string[];
  following: string[];

  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }) => { ok: boolean; error?: string };
  logout: () => void;
  getCurrentUser: () => RegisteredUser | null;
  addPrediction: (pred: Omit<Prediction, "id" | "userId" | "createdAt" | "status" | "likes">) => void;
  likePrediction: (id: string) => void;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  settleCouponFromSelections: (
    selections: CouponSelection[],
    stake: number,
    totalOdds: number
  ) => void;
  updatePredictionStatus: (id: string, status: PredictionStatus) => void;
}

const AVATAR_COLORS = [
  "#1565c0",
  "#2e7d32",
  "#c62828",
  "#6a1b9a",
  "#ef6c00",
  "#00838f",
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      registeredUsers: [],
      userPredictions: [],
      userCoupons: [],
      likedPredictions: [],
      following: [],

      login: (email, password) => {
        const user = get().registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) return { ok: false, error: t.auth.errors.invalidLogin };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      register: (data) => {
        const users = get().registeredUsers;
        if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
          return { ok: false, error: t.auth.errors.emailTaken };
        }
        if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
          return { ok: false, error: t.auth.errors.usernameTaken };
        }
        if (data.password.length < 6) {
          return { ok: false, error: t.auth.errors.passwordShort };
        }
        const newUser: RegisteredUser = {
          id: uid("reg-"),
          username: data.username.toLowerCase(),
          displayName: data.displayName,
          email: data.email.toLowerCase(),
          password: data.password,
          avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
          joinedAt: new Date().toISOString(),
        };
        set({
          registeredUsers: [...users, newUser],
          currentUserId: newUser.id,
        });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      getCurrentUser: () => {
        const id = get().currentUserId;
        if (!id) return null;
        return get().registeredUsers.find((u) => u.id === id) ?? null;
      },

      addPrediction: (pred) => {
        const user = get().getCurrentUser();
        if (!user) return;
        const newPred: Prediction = {
          ...pred,
          id: uid("pred-"),
          userId: user.id,
          createdAt: new Date().toISOString(),
          status: "pending",
          likes: 0,
        };
        set((s) => ({ userPredictions: [newPred, ...s.userPredictions] }));
      },

      likePrediction: (id) => {
        const liked = get().likedPredictions;
        if (liked.includes(id)) return;
        set({ likedPredictions: [...liked, id] });
      },

      toggleFollow: (userId) => {
        const following = get().following;
        set({
          following: following.includes(userId)
            ? following.filter((f) => f !== userId)
            : [...following, userId],
        });
      },

      isFollowing: (userId) => get().following.includes(userId),

      settleCouponFromSelections: (selections, stake, totalOdds) => {
        const user = get().getCurrentUser();
        if (!user) return;
        const coupon: SettledCoupon = {
          id: uid("uc-"),
          userId: user.id,
          title: `${selections.length}-fold Acca`,
          selections,
          stake,
          totalOdds,
          potentialWin: stake * totalOdds,
          actualWin: 0,
          status: "pending",
          createdAt: new Date().toISOString(),
          settledAt: new Date().toISOString(),
        };
        set((s) => ({ userCoupons: [coupon, ...s.userCoupons] }));
      },

      updatePredictionStatus: (id, status) => {
        set((s) => ({
          userPredictions: s.userPredictions.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        }));
      },
    }),
    { name: "oddvoral-auth" }
  )
);
