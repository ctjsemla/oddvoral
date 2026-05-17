"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/data/sports";
import { useBulletin } from "@/providers/BulletinProvider";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n/en-IN";
import type { Sport } from "@/types";

export function SportSidebar({ activeSport }: { activeSport?: Sport }) {
  const pathname = usePathname();
  const { matches } = useBulletin();

  return (
    <aside className="bg-op-surface border border-op-border rounded-lg overflow-hidden">
      <div className="bg-op-header text-white px-4 py-2.5 font-semibold text-sm">
        {t.footer.sports}
      </div>
      <ul className="divide-y divide-op-border">
        {SPORTS.map((sport) => {
          const href = `/sport/${sport.id}`;
          const active = activeSport === sport.id || pathname === href;
          const count = matches.filter((m) => m.sport === sport.id).length;
          return (
            <li key={sport.id}>
              <Link
                href={href}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-op-row-hover",
                  active && "bg-green-50 text-op-accent font-medium border-l-3 border-op-accent"
                )}
              >
                <span className="flex items-center gap-2">
                  <span>{sport.icon}</span>
                  {sport.name}
                </span>
                <span className="text-xs text-op-text-muted">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
