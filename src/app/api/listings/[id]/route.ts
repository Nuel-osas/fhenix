import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/listings/[id] — fetch a single listing by listingId
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const listing = await getPrisma().listing.findUnique({
    where: { listingId: id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Don't expose the encryption key in public listing responses
  const publicListing = { ...listing };
  delete (publicListing as { encryptionKey?: string }).encryptionKey;
  return NextResponse.json(publicListing);
}

// PATCH /api/listings/[id] — update price or deactivate
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { seller, price, status } = body;

  const listing = await getPrisma().listing.findUnique({
    where: { listingId: id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.seller !== seller) {
    return NextResponse.json({ error: "Not the listing owner" }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};
  if (price !== undefined) updateData.price = price;
  if (status !== undefined) updateData.status = status;

  const updated = await getPrisma().listing.update({
    where: { listingId: id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
