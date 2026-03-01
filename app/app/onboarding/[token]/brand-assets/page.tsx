import { prisma } from "@/lib/prisma";
import UploadArea from "../_components/UploadArea";

export default async function OnboardingStep2({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const onboarding = await prisma.onboarding.findUnique({
    where: { token },
    include: {
      assets: {
        orderBy: { uploadedAt: "asc" },
        select: { id: true, fileName: true, fileSize: true, fileType: true },
      },
    },
  });

  const existingAssets = onboarding?.assets ?? [];

  return (
    <div className="flex-1 flex justify-center py-10 px-4 sm:px-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sm text-[#135bec] font-medium mb-1">
            <span>Etapa 2 de 4</span>
            <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-2/4 bg-[#135bec] rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Identidade Visual
          </h1>
          <p className="text-slate-500 text-lg">
            Envie o logotipo e o manual de marca da sua empresa para personalizarmos a sua experiência.
          </p>
        </div>

        <UploadArea token={token} existingAssets={existingAssets} />
      </div>
    </div>
  );
}
