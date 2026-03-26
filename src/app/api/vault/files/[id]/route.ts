import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/vault/files/[id]?owner=0x... — get file details + encryption key (owner only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = req.nextUrl.searchParams.get("owner");

  if (!owner) {
    return NextResponse.json({ error: "owner is required" }, { status: 400 });
  }

  const file = await getPrisma().vaultFile.findFirst({
    where: { id: parseInt(id, 10), owner },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...file,
    fileSize: Number(file.fileSize),
  });
}
