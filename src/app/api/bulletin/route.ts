import { NextResponse } from "next/server";
import { getBulletinMatches, invalidateBulletinCache } from "@/lib/bulletin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.has("t")) {
    invalidateBulletinCache();
  }

  try {
    const data = await getBulletinMatches();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
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
