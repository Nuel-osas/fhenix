import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/listings/[id]/key?address=0x...
// Seller can always access. Buyer can access after delivery.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const address = req.nextUrl.searchParams.get("address") || req.nextUrl.searchParams.get("seller");

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const prisma = getPrisma();

  const listing = await prisma.listing.findUnique({
    where: { listingId: id },
    select: { seller: true, encryptionKey: true, status: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Seller can always access their own key
  if (listing.seller === address) {
    return NextResponse.json({ encryptionKey: listing.encryptionKey });
  }

  // Buyer can access after purchasing
  const purchase = await prisma.purchase.findFirst({
    where: { listingId: id, buyer: address },
  });
  if (purchase) {
    return NextResponse.json({ encryptionKey: listing.encryptionKey });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
