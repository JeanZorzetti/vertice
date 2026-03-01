"use client";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-[#f6f6f8] font-sans text-slate-900 antialiased">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/3 xl:w-5/12 relative flex-col justify-between bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#135bec]/30 to-slate-900/90"></div>

        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-4xl">change_history</span>
            <span className="text-xl font-bold tracking-wide">VÉRTICE</span>
          </div>

          <div className="flex flex-col gap-4 text-white/90 max-w-md">
            <p className="text-2xl font-medium leading-relaxed">
              &ldquo;Marketing não é mais sobre o que você fabrica, mas sobre as histórias que você conta.&rdquo;
            </p>
            <p className="text-sm font-normal text-white/60 uppercase tracking-widest mt-2">— Seth Godin</p>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#f6f6f8]">
        <div className="w-full max-w-[480px] flex flex-col gap-10">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 text-[#135bec] mb-4">
            <span className="material-symbols-outlined text-4xl">change_history</span>
            <span className="text-xl font-bold tracking-wide text-slate-900">VÉRTICE</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-slate-900 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Bem-vindo ao seu onboarding
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Digite o e-mail associado à sua conta Vértice para receber o link de acesso.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                E-mail corporativo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-[#135bec] transition-colors duration-200">
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>mail</span>
                </div>
                <input
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-0 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#135bec] focus:ring-offset-2 focus:ring-offset-[#f6f6f8] shadow-sm transition-all duration-200 text-base outline-none"
                  id="email"
                  name="email"
                  placeholder="nome@empresa.com.br"
                  required
                  type="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-[#135bec] hover:bg-[#135bec]/90 text-white text-base font-bold rounded-xl shadow-lg shadow-[#135bec]/20 transition-all duration-200 flex items-center justify-center gap-2 group mt-2 cursor-pointer"
            >
              <span>Enviar Link de Acesso</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200" style={{ fontSize: "20px" }}>
                arrow_forward
              </span>
            </button>
          </form>

          <div className="flex flex-col gap-4 items-center text-center mt-4">
            <p className="text-sm text-slate-500">
              Ao clicar em &ldquo;Enviar Link de Acesso&rdquo;, você concorda com os nossos{" "}
              <a className="text-[#135bec] font-semibold hover:underline underline-offset-4" href="#">
                Termos de Uso
              </a>{" "}
              e a{" "}
              <a className="text-[#135bec] font-semibold hover:underline underline-offset-4" href="#">
                Política de Privacidade
              </a>.
            </p>
            <div className="w-full h-px bg-slate-200 my-2"></div>
            <p className="text-sm text-slate-500">
              Já tem uma senha?{" "}
              <a className="text-[#135bec] font-bold hover:underline" href="#">
                Entrar com senha
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
