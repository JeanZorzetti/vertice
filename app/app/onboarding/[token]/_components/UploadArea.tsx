"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ExistingAsset {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface UploadedFile extends ExistingAsset {
  status: "done" | "uploading" | "error";
  errorMsg?: string;
}

interface UploadAreaProps {
  token: string;
  existingAssets: ExistingAsset[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fileIcon(fileType: string): { icon: string; iconBg: string; iconColor: string } {
  if (fileType.startsWith("image/")) return { icon: "image", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" };
  if (fileType === "application/pdf") return { icon: "picture_as_pdf", iconBg: "bg-red-50", iconColor: "text-red-600" };
  return { icon: "description", iconBg: "bg-slate-50", iconColor: "text-slate-600" };
}

export default function UploadArea({ token, existingAssets }: UploadAreaProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(
    existingAssets.map((a) => ({ ...a, status: "done" }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    // Add pending entry
    setFiles((prev) => [
      ...prev,
      {
        id: tempId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: "uploading",
      },
    ]);

    try {
      // 1. Get presigned URL
      const res = await fetch(`/api/onboarding/${token}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, fileType: file.type }),
      });

      if (!res.ok) throw new Error("Falha ao obter URL de upload.");
      const { uploadUrl, asset } = await res.json();

      // 2. Upload directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Falha no upload do arquivo.");

      // 3. Replace temp entry with real asset
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...asset, status: "done" as const } : f
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, status: "error", errorMsg: msg } : f
        )
      );
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    Array.from(selected).forEach(uploadFile);
    // Reset input so same file can be re-selected after error
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  }

  async function removeFile(id: string) {
    // Only call API if it's a real (non-temp) asset
    if (!id.startsWith("temp_")) {
      await fetch(`/api/onboarding/${token}/assets?assetId=${id}`, { method: "DELETE" });
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleContinue() {
    setSaving(true);
    setError("");

    const doneFiles = files.filter((f) => f.status === "done");

    const res = await fetch(`/api/onboarding/${token}/step`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepNumber: 2,
        data: { assetCount: doneFiles.length, assets: doneFiles.map((f) => f.id) },
      }),
    });

    if (!res.ok) {
      setError("Erro ao salvar. Tente novamente.");
      setSaving(false);
      return;
    }

    router.push(`/onboarding/${token}/platforms`);
  }

  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 flex flex-col gap-8">
      {/* Drop Zone */}
      <div
        className="relative group cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          className="hidden"
          multiple
          type="file"
          accept="image/*,application/pdf,.svg"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#135bec] transition-all duration-200 px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-slate-900">Clique ou arraste arquivos para enviar</p>
            <p className="text-sm text-slate-500">SVG, PNG, JPG ou PDF (máx. 10 MB por arquivo)</p>
          </div>
          <button
            type="button"
            className="mt-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Selecionar Arquivos
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Arquivos ({files.filter((f) => f.status === "done").length} enviados
            {isUploading ? ", enviando..." : ""})
          </h3>

          {files.map((file) => {
            const { icon, iconBg, iconColor } = fileIcon(file.fileType);
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}
                  >
                    {file.status === "uploading" ? (
                      <span className="material-symbols-outlined animate-spin text-[#135bec]">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined">{icon}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{file.fileName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{formatBytes(file.fileSize)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      {file.status === "uploading" && (
                        <span className="text-xs text-[#135bec] font-medium">Enviando...</span>
                      )}
                      {file.status === "done" && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Enviado
                        </span>
                      )}
                      {file.status === "error" && (
                        <span className="text-xs text-red-600 font-medium">{file.errorMsg}</span>
                      )}
                    </div>
                  </div>
                </div>
                {file.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <a
          href={`/onboarding/${token}`}
          className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
        >
          Voltar
        </a>
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving || isUploading}
          className="flex items-center gap-2 px-8 py-3 bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:scale-100"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              Salvando...
            </>
          ) : (
            <>
              <span>Salvar e Continuar</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
