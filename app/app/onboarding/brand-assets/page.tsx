import Link from "next/link";

const steps = [
  { label: "Dados da Empresa", status: "done" },
  { label: "Identidade Visual", status: "active" },
  { label: "Acessos", status: "pending" },
  { label: "Estratégia", status: "pending" },
];

const uploadedFiles = [
  { name: "Vértice_Logo_Vector.svg", size: "2.4 MB", icon: "image", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { name: "Brand_Guidelines_2024.pdf", size: "15.8 MB", icon: "picture_as_pdf", iconBg: "bg-red-50", iconColor: "text-red-600" },
];

export default function BrandAssetsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-row overflow-hidden bg-[#f6f6f8] font-sans text-slate-900 antialiased">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex-shrink-0 hidden lg:flex flex-col justify-between h-screen fixed left-0 top-0 z-10">
        <div className="p-8 flex flex-col gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#135bec] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">change_history</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Vértice</h2>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 text-lg font-bold leading-normal">Configuração do Onboarding</h1>
            <p className="text-slate-500 text-sm font-medium">Complete seu perfil para começarmos.</p>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <div key={step.label}>
                {step.status === "done" && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined filled text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <p className="text-slate-700 text-sm font-semibold">{step.label}</p>
                  </div>
                )}
                {step.status === "active" && (
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#135bec]/10 border-l-4 border-[#135bec]">
                    <div className="text-[#135bec] w-6 h-6 flex items-center justify-center rounded-full bg-[#135bec]/20 text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-[#135bec] text-sm font-bold">{step.label}</p>
                  </div>
                )}
                {step.status === "pending" && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-60">
                    <div className="text-slate-400 w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-xs font-medium shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{step.label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-500">person</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-slate-900">Alex Morgan</p>
              <p className="text-xs text-slate-500">Vértice Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#135bec] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">change_history</span>
            </div>
            <span className="font-bold text-slate-900">Vértice</span>
          </div>
          <button className="text-slate-500">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="flex-1 flex justify-center py-10 px-4 sm:px-8">
          <div className="w-full max-w-4xl flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-[#135bec] font-medium mb-2">
                <span>Etapa 2 de 4</span>
                <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-[#135bec]"></div>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Identidade Visual</h1>
              <p className="text-slate-500 text-lg">
                Envie o logotipo e o manual de marca da sua empresa para personalizarmos a sua experiência.
              </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 flex flex-col gap-8">
              {/* Upload Area */}
              <div className="relative group cursor-pointer">
                <input className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" multiple type="file" />
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#135bec] transition-all duration-200 px-6 py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-2">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-slate-900">Clique ou arraste arquivos para enviar</p>
                    <p className="text-sm text-slate-500">SVG, PNG, JPG ou PDF (máx. 10MB)</p>
                  </div>
                  <button className="mt-4 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                    Selecionar Arquivos
                  </button>
                </div>
              </div>

              {/* File List */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Arquivos Enviados ({uploadedFiles.length})
                </h3>

                {uploadedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${file.iconBg} flex items-center justify-center ${file.iconColor} shrink-0`}>
                        <span className="material-symbols-outlined">{file.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{file.size}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Enviado
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto">
                <Link
                  href="/onboarding"
                  className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Voltar
                </Link>
                <Link
                  href="/onboarding/platforms"
                  className="flex items-center gap-2 px-8 py-3 bg-[#135bec] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                >
                  <span>Salvar e Continuar</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
