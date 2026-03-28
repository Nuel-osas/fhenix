import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DIRECT_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const API_KEY = process.env.NEXT_PUBLIC_WALRUS_API_KEY || "";
const BASE_URL = process.env.NEXT_PUBLIC_WALRUS_SPONSOR_URL || "https://walrus-sponsor.krill.tube";

// POST /api/walrus/upload — proxy upload to Walrus (tries Krill, falls back to direct)
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob | null;
  const creatorAddress = formData.get("creator_address") as string;
  const epochs = formData.get("epochs") as string || "3";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Try Krill sponsor first
  try {
    const krillForm = new FormData();
    krillForm.append("file", file, "data.bin");
    krillForm.append("creator_address", creatorAddress);
    krillForm.append("epochs", epochs);
    krillForm.append("deletable", "true");

    const res = await fetch(`${BASE_URL}/v1/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: krillForm,
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        blobId: data.blob_id,
        sponsoredBlobId: data.sponsored_blob_id,
        txDigest: data.tx_digest,
      });
    }
  } catch {
    // Krill failed, try direct
  }

  // Fallback: direct Walrus publisher (server-side, no CORS)
  try {
    const buf = await file.arrayBuffer();
    const res = await fetch(`${DIRECT_PUBLISHER}/v1/blobs?epochs=${epochs}`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: Buffer.from(buf),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: `Walrus upload failed: ${text}` }, { status: 502 });
    }

    const data = await res.json();

    if (data.newlyCreated) {
      return NextResponse.json({ blobId: data.newlyCreated.blobObject.blobId });
    }
    if (data.alreadyCertified) {
      return NextResponse.json({ blobId: data.alreadyCertified.blobId });
    }

    return NextResponse.json({ error: "Unexpected Walrus response" }, { status: 500 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
