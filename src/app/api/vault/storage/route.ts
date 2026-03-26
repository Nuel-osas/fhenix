import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const BYTES_PER_USDCX = 100 * 1024 * 1024; // 100MB

// GET /api/vault/storage?owner=0x... — get vault storage quota & usage
export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "owner is required" }, { status: 400 });
  }

  const prisma = getPrisma();

  // Sum all purchased storage
  const storageResult = await prisma.vaultStorage.aggregate({
    where: { owner },
    _sum: { totalBytes: true },
  });
  const totalBytes = Number(storageResult._sum.totalBytes ?? 0);

  // Sum all file sizes
  const filesResult = await prisma.vaultFile.aggregate({
    where: { owner },
    _sum: { fileSize: true },
  });
  const usedBytes = Number(filesResult._sum.fileSize ?? 0);

  return NextResponse.json({
    totalBytes,
    usedBytes,
    remainingBytes: totalBytes - usedBytes,
  });
}

// POST /api/vault/storage — record a storage purchase after on-chain ETH tx
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, txId, quantity } = body;

    if (!owner || !txId) {
      return NextResponse.json({ error: "Missing required fields: owner and txId are required" }, { status: 400 });
    }

    const units = quantity ?? 1;
    const totalBytes = BigInt(units) * BigInt(BYTES_PER_USDCX);

    const storage = await getPrisma().vaultStorage.create({
      data: {
        owner,
        totalBytes,
        txId,
      },
    });

    return NextResponse.json(
      {
        id: storage.id,
        owner: storage.owner,
        totalBytes: Number(storage.totalBytes),
        txId: storage.txId,
        createdAt: storage.createdAt,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("POST /api/vault/storage error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
