"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-gray-100 p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] text-center">
        <p className="font-bold text-[#0d121b] mb-1">Mensagem enviada.</p>
        <p className="text-sm text-[#4c669a]">A gente responde por e-mail em breve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-[#0d121b] mb-1.5">Nome</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec]"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[#0d121b] mb-1.5">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec]"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-[#0d121b] mb-1.5">Mensagem</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] resize-none"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">Não deu pra enviar agora. Tenta de novo em instantes.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-11 rounded-lg bg-[#135bec] text-white font-bold text-sm hover:bg-[#0c3b9e] transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
