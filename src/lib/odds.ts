import type { OddsFormat } from "@/types";

export function decimalToFractional(decimal: number): string {
  const profit = decimal - 1;
  const gcd = (a: number, b: number): number => (b < 0.0001 ? a : gcd(b, a % b));
  let num = Math.round(profit * 100);
  let den = 100;
  const divisor = gcd(num, den);
  num /= divisor;
  den /= divisor;
  return `${num}/${den}`;
}

export function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`;
  return `${Math.round(-100 / (decimal - 1))}`;
}

export function formatOdds(decimal: number, format: OddsFormat): string {
  if (format === "fractional") return decimalToFractional(decimal);
  if (format === "american") return decimalToAmerican(decimal);
  return decimal.toFixed(2);
}

export function calculateImpliedProbability(odds: number): number {
  return (1 / odds) * 100;
}

export function calculateArbitrageProfit(odds: number[]): number {
  const sum = odds.reduce((acc, o) => acc + 1 / o, 0);
  if (sum >= 1) return 0;
  return ((1 / sum - 1) * 100);
}

export function calculateCouponReturn(
  selections: { odds: number }[],
  stake: number
): { totalOdds: number; potentialWin: number } {
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  return { totalOdds, potentialWin: stake * totalOdds };
}

export function randomOdds(base: number, variance = 0.15): number {
  const delta = (Math.random() - 0.5) * variance * 2;
  return Math.max(1.01, Math.round((base + delta) * 100) / 100);
}

export function markBestOdds(
  entries: { home?: number; draw?: number; away?: number; over?: number; under?: number; yes?: number; no?: number }[]
) {
  const keys = ["home", "draw", "away", "over", "under", "yes", "no"] as const;
  for (const key of keys) {
    const values = entries
      .map((e, i) => ({ val: e[key], i }))
      .filter((x) => x.val !== undefined) as { val: number; i: number }[];
    if (values.length === 0) continue;
    const best = Math.max(...values.map((v) => v.val));
    values.forEach((v) => {
      if (entries[v.i][key] === best) {
        (entries[v.i] as Record<string, unknown>).isBest = true;
      }
    });
  }
  return entries;
}
