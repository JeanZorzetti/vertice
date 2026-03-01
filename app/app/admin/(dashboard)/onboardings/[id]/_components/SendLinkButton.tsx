"use client";

import { useState } from "react";

export default function SendLinkButton({ clientEmail }: { clientEmail: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");

  async function send() {
    setState("loading");
    await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clientEmail }),
    });
    setState("sent");
    setTimeout(() => setState("idle"), 4000);
  }

  if (state === "sent") {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
        <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
        Link enviado!
      </div>
    );
  }

  return (
    <button
      onClick={send}
      disabled={state === "loading"}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm shadow-blue-500/30 transition-all"
    >
      {state === "loading" ? (
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
      ) : (
        <span className="material-symbols-outlined text-[16px]">send</span>
      )}
      Reenviar link
    </button>
  );
}
