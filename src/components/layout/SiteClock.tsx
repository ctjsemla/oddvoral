"use client";

import { useEffect, useState } from "react";
import { formatIndiaSiteClock } from "@/lib/india-time";
import { t } from "@/lib/i18n/en-IN";

export function SiteClock() {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(formatIndiaSiteClock());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" title={t.nav.siteClockTitle} suppressHydrationWarning>
      {t.nav.siteClockLabel(clock || "—")}
    </span>
  );
}
