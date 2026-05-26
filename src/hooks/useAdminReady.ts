"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/adminStore";

/** Wait for persisted admin auth before redirecting (avoids login loop). */
export function useAdminReady() {
  const hasHydrated = useAdminStore((s) => s.hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => useAdminStore.getState().setHasHydrated();

    const unsub = useAdminStore.persist.onFinishHydration(() => {
      finish();
      setReady(true);
    });

    if (useAdminStore.persist.hasHydrated()) {
      finish();
      setReady(true);
    } else {
      void useAdminStore.persist.rehydrate();
    }

    const fallback = window.setTimeout(() => {
      finish();
      setReady(true);
    }, 800);

    return () => {
      unsub();
      clearTimeout(fallback);
    };
  }, []);

  return ready || hasHydrated;
}
