"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { getLeaderboard, getUserById } from "@/data/users";
import { useCommunityData } from "@/hooks/useCommunityData";
import { Users, ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n/en-IN";

export function CommunityPreview() {
  const topUsers = getLeaderboard(3);
  const { predictions } = useCommunityData();
  const recentPreds = predictions.slice(0, 3);

  return (
    <section className="bg-op-surface border border-op-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-op-border bg-op-row-alt">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-op-accent" />
          <h2 className="font-bold text-lg">{t.home.communityTitle}</h2>
        </div>
        <Link
          href="/community"
          className="text-sm text-op-accent font-medium flex items-center gap-1 hover:underline"
        >
          {t.home.viewAll} <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-op-border">
        <div className="p-4 md:col-span-2 space-y-3">
          {recentPreds.map((p) => {
            const user = getUserById(p.userId);
            if (!user) return null;
            return (
              <div
                key={p.id}
                className="block p-3 rounded-lg hover:bg-op-row-hover"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/user/${user.username}`}
                    className="hover:opacity-90 transition-opacity"
                  >
                    <UserAvatar
                      name={user.displayName}
                      color={user.avatarColor}
                      size="sm"
                    />
                  </Link>
                  <Link
                    href={`/user/${user.username}`}
                    className="text-sm font-medium hover:text-op-accent"
                  >
                    {user.displayName}
                  </Link>
                </div>
                <Link href={`/match/${p.matchId}`} className="block hover:text-op-accent">
                  <p className="text-sm font-medium">
                    {p.homeTeam} - {p.awayTeam}
                    <span className="text-op-text-muted font-normal ml-2 text-xs">
                      {p.league}
                    </span>
                  </p>
                  <p className="text-xs text-op-text-muted mt-0.5 line-clamp-1">{p.comment}</p>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="p-4">
          <h3 className="text-xs font-semibold text-op-text-muted uppercase mb-3">
            {t.home.leaders}
          </h3>
          <ul className="space-y-3">
            {topUsers.map((u, i) => (
              <li key={u.id}>
                <Link
                  href={`/user/${u.username}`}
                  className="flex items-center gap-2 hover:text-op-accent"
                >
                  <span className="text-xs font-bold w-4">{i + 1}</span>
                  <UserAvatar name={u.displayName} color={u.avatarColor} size="sm" />
                  <span className="text-sm font-medium">{u.displayName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
