"use client";

import { useMemo } from "react";
import { useBulletin } from "@/providers/BulletinProvider";
import { useAuthStore } from "@/store/authStore";
import {
  buildSeedPredictions,
  buildSeedCoupons,
} from "@/data/community";

export function useCommunityData() {
  const { matches } = useBulletin();
  const userPredictions = useAuthStore((s) => s.userPredictions);
  const userCoupons = useAuthStore((s) => s.userCoupons);

  const seedPredictions = useMemo(
    () => buildSeedPredictions(matches),
    [matches]
  );
  const seedCoupons = useMemo(() => buildSeedCoupons(matches), [matches]);

  const predictions = useMemo(
    () =>
      [...userPredictions, ...seedPredictions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [userPredictions, seedPredictions]
  );

  const coupons = useMemo(
    () =>
      [...userCoupons, ...seedCoupons].sort(
        (a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
      ),
    [userCoupons, seedCoupons]
  );

  return { predictions, coupons, matches };
}
