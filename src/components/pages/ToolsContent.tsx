"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { BulletinBar } from "@/components/layout/BulletinBar";
import { useBulletin } from "@/providers/BulletinProvider";
import {
  buildDroppingOdds,
  buildSureBets,
  buildValueBets,
} from "@/lib/bulletin";
import { useMemo } from "react";
import { t } from "@/lib/i18n/en-IN";

export function useBulletinTools() {
  const { matches } = useBulletin();
  return useMemo(
    () => ({
      drops: buildDroppingOdds(matches),
      sure: buildSureBets(matches),
      value: buildValueBets(matches),
    }),
    [matches]
  );
}

export function ToolsLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useBulletin();
  return (
    <MainLayout showCoupon={false}>
      <BulletinBar />
      {loading ? (
        <p className="text-center py-8 text-op-text-muted animate-pulse">
          {t.bulletin.loading}
        </p>
      ) : (
        children
      )}
    </MainLayout>
  );
}
