"use client";

import { formatOdds } from "@/lib/odds";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { CouponSelection } from "@/types";
import { t } from "@/lib/i18n/en-IN";

interface OddsCellProps {
  value?: number;
  isBest?: boolean;
  dropped?: boolean;
  previous?: number;
  onClick?: () => void;
  label?: string;
  matchInfo?: Omit<CouponSelection, "odds" | "outcome" | "bookmaker" | "market">;
  outcome?: string;
  bookmaker?: string;
  market?: string;
}

export function OddsCell({
  value,
  isBest,
  dropped,
  previous,
  onClick,
  label,
  matchInfo,
  outcome,
  bookmaker,
  market,
}: OddsCellProps) {
  const oddsFormat = useStore((s) => s.settings.oddsFormat);
  const addToCoupon = useStore((s) => s.addToCoupon);

  if (!value) {
    return <td className="px-2 py-2 text-center text-op-text-muted text-xs">—</td>;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (matchInfo && outcome && bookmaker && market) {
      addToCoupon({
        ...matchInfo,
        outcome,
        odds: value,
        bookmaker,
        market,
      });
    }
  };

  return (
    <td className="px-1 py-1.5 text-center">
      <button
        onClick={handleClick}
        title={
          previous
            ? `${t.tools.previous}: ${formatOdds(previous, oddsFormat)}`
            : undefined
        }
        className={cn(
          "w-full min-w-[52px] px-2 py-1.5 rounded text-sm font-semibold transition-all cursor-pointer",
          "hover:ring-2 hover:ring-op-accent/40",
          isBest
            ? "bg-red-50 text-op-best border border-red-200"
            : "bg-gray-50 text-op-text hover:bg-green-50",
          dropped && "relative"
        )}
      >
        {formatOdds(value, oddsFormat)}
        {dropped && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-op-drop rounded-full" />
        )}
        {label && (
          <span className="block text-[10px] font-normal text-op-text-muted">{label}</span>
        )}
      </button>
    </td>
  );
}
