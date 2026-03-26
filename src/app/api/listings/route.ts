import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/listings — fetch all listings, optionally filter by category
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  const listings = await getPrisma().listing.findMany({
    where: category && category !== "All" ? { category, status: "active" } : { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  // Strip encryption key values but include a boolean flag
  const publicListings = listings.map(({ encryptionKey, ...rest }: { encryptionKey: string | null; [key: string]: unknown }) => ({
    ...rest,
    hasEncryptionKey: !!encryptionKey,
  }));
  return NextResponse.json(publicListings);
}

// POST /api/listings — create a new listing after on-chain tx
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    listingId,
    title,
    description,
    category,
    price,
    rowCount,
    schemaFields,
    seller,
    blobId,
    encryptionKey,
    txId,
    previewBlobId,
  } = body;

  if (!listingId || !title || !seller || !txId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const listing = await getPrisma().listing.create({
    data: {
      listingId,
      title,
      description,
      category,
      price,
      rowCount,
      schemaFields,
      seller,
      blobId,
      encryptionKey,
      txId,
      previewBlobId: previewBlobId || null,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
