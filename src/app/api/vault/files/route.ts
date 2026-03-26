import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/vault/files?owner=0x... — list vault files for an owner
export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "owner is required" }, { status: 400 });
  }

  const files = await getPrisma().vaultFile.findMany({
    where: { owner },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      owner: true,
      fileName: true,
      fileSize: true,
      blobId: true,
      createdAt: true,
    },
  });

  // Convert BigInt to Number for JSON serialization
  const serialized = files.map((f: typeof files[number]) => ({
    ...f,
    fileSize: Number(f.fileSize),
  }));

  return NextResponse.json(serialized);
}

// POST /api/vault/files — save a vault file record after encrypting & uploading to Walrus
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { owner, fileName, fileSize, blobId, encryptionKey } = body;

  if (!owner || !fileName || !fileSize || !blobId || !encryptionKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prisma = getPrisma();

  // Check quota
  const storageResult = await prisma.vaultStorage.aggregate({
    where: { owner },
    _sum: { totalBytes: true },
  });
  const totalBytes = Number(storageResult._sum.totalBytes ?? 0);

  const filesResult = await prisma.vaultFile.aggregate({
    where: { owner },
    _sum: { fileSize: true },
  });
  const usedBytes = Number(filesResult._sum.fileSize ?? 0);

  if (usedBytes + fileSize > totalBytes) {
    return NextResponse.json(
      { error: "Insufficient vault storage. Purchase more space." },
      { status: 403 }
    );
  }

  const file = await prisma.vaultFile.create({
    data: {
      owner,
      fileName,
      fileSize: BigInt(fileSize),
      blobId,
      encryptionKey,
    },
  });

  return NextResponse.json(
    { ...file, fileSize: Number(file.fileSize) },
    { status: 201 }
  );
}
