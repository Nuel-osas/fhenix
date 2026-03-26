import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/ratings?seller=0x... — fetch ratings for a seller
export async function GET(req: NextRequest) {
  const seller = req.nextUrl.searchParams.get("seller");

  if (!seller) {
    return NextResponse.json({ error: "seller param required" }, { status: 400 });
  }

  const ratings = await getPrisma().rating.findMany({
    where: { seller },
    orderBy: { createdAt: "desc" },
  });

  const totalScore = ratings.reduce((sum: number, r: { score: number }) => sum + r.score, 0);
  const average = ratings.length > 0 ? totalScore / ratings.length : 0;

  return NextResponse.json({
    ratings,
    average: Math.round(average * 10) / 10,
    count: ratings.length,
  });
}

// POST /api/ratings — create a rating after on-chain tx
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listingId, buyer, seller, score, txId } = body;

  if (!listingId || !buyer || !seller || !score || !txId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (score < 1 || score > 5) {
    return NextResponse.json({ error: "Score must be 1-5" }, { status: 400 });
  }

  // Check buyer has purchased
  const purchase = await getPrisma().purchase.findFirst({
    where: { listingId, buyer },
  });
  if (!purchase) {
    return NextResponse.json({ error: "Must purchase before rating" }, { status: 403 });
  }

  // Check not already rated
  const existing = await getPrisma().rating.findUnique({
    where: { listingId_buyer: { listingId, buyer } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already rated this listing" }, { status: 409 });
  }

  const rating = await getPrisma().rating.create({
    data: { listingId, buyer, seller, score, txId },
  });

  return NextResponse.json(rating, { status: 201 });
}
