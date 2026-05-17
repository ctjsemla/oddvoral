import { notFound } from "next/navigation";
import { SportContent } from "@/components/pages/SportContent";
import { SPORTS } from "@/data/sports";
import type { Sport } from "@/types";

const VALID_SPORTS = SPORTS.map((s) => s.id);

export function generateStaticParams() {
  return VALID_SPORTS.map((sport) => ({ sport }));
}

export default async function SportPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport } = await params;
  if (!VALID_SPORTS.includes(sport as Sport)) notFound();
  return <SportContent sport={sport as Sport} />;
}
