import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";
import { getUploadPresignedUrl, buildAssetKey } from "@/lib/r2";

// POST /api/onboarding/[token]/assets
// Body: { fileName: string; fileSize: number; fileType: string }
// Returns a presigned R2 upload URL and creates a pending AssetUpload record.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await requireClientSession();
    const { token } = await params;
    const { fileName, fileSize, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName e fileType são obrigatórios." }, { status: 400 });
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { token },
      include: { client: { select: { agencyId: true } } },
    });

    if (!onboarding || onboarding.id !== session.onboardingId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const r2Key = buildAssetKey({
      agencyId: onboarding.client.agencyId,
      onboardingId: onboarding.id,
      fileName,
    });

    const uploadUrl = await getUploadPresignedUrl({ key: r2Key, contentType: fileType });

    const asset = await prisma.assetUpload.create({
      data: {
        onboardingId: onboarding.id,
        fileName,
        fileSize: fileSize ?? 0,
        fileType,
        r2Key,
      },
    });

    return NextResponse.json({ uploadUrl, asset });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[assets POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE /api/onboarding/[token]/assets?assetId=<id>
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await requireClientSession();
    const { token } = await params;
    const assetId = new URL(request.url).searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json({ error: "assetId obrigatório." }, { status: 400 });
    }

    const onboarding = await prisma.onboarding.findUnique({ where: { token } });

    if (!onboarding || onboarding.id !== session.onboardingId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const asset = await prisma.assetUpload.findFirst({
      where: { id: assetId, onboardingId: onboarding.id },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset não encontrado." }, { status: 404 });
    }

    await prisma.assetUpload.delete({ where: { id: assetId } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[assets DELETE]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
