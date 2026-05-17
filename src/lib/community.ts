import { FAKE_USERS, getUserById } from "@/data/users";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";
import type { RegisteredUser } from "@/types";

export function resolveUser(userId: string): User | RegisteredUser | null {
  const fake = getUserById(userId);
  if (fake) return fake;
  return useAuthStore.getState().registeredUsers.find((u) => u.id === userId) ?? null;
}

export function registeredToProfile(user: RegisteredUser): User {
  const preds = useAuthStore.getState().userPredictions;
  const won = preds.filter((p) => p.status === "won").length;
  const lost = preds.filter((p) => p.status === "lost").length;
  const pending = preds.filter((p) => p.status === "pending").length;
  const coupons = useAuthStore.getState().userCoupons;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatar: user.displayName.slice(0, 2).toUpperCase(),
    avatarColor: user.avatarColor,
    bio: "Oddvoral live bulletin member — shares tips on real fixtures.",
    country: "India",
    joinedAt: user.joinedAt,
    isVerified: false,
    isPro: false,
    stats: {
      predictions: preds.length,
      won,
      lost,
      pending,
      yield: preds.length ? Math.round((won / Math.max(won + lost, 1)) * 30) : 0,
      avgOdds: preds.length
        ? Math.round((preds.reduce((a, p) => a + p.odds, 0) / preds.length) * 100) / 100
        : 0,
      couponsWon: coupons.filter((c) => c.status === "won").length,
      couponsLost: coupons.filter((c) => c.status === "lost").length,
      roi: 0,
      streak: won > 0 ? Math.min(won, 5) : 0,
    },
    following: useAuthStore.getState().following,
    followers: [],
  };
}

export function getProfileUser(userId: string): User | null {
  const fake = getUserById(userId);
  if (fake) return fake;
  const reg = useAuthStore.getState().registeredUsers.find((u) => u.id === userId);
  if (reg) return registeredToProfile(reg);
  return null;
}

export function getProfileByUsername(username: string): User | null {
  const fake = FAKE_USERS.find((u) => u.username === username);
  if (fake) return fake;
  const reg = useAuthStore
    .getState()
    .registeredUsers.find((u) => u.username === username);
  if (reg) return registeredToProfile(reg);
  return null;
}
