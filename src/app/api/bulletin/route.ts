import { NextResponse } from "next/server";
import { getBulletinMatches } from "@/lib/bulletin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getBulletinMatches();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch {
    const { generateFallbackBulletin } = await import("@/data/matches-fallback");
    return NextResponse.json({
      matches: generateFallbackBulletin(),
      source: "fallback",
      updatedAt: new Date().toISOString(),
    });
  }
}
