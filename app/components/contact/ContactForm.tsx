"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          topic,
          message,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Unable to send message right now.");
      }

      setStatus("sent");
      setMessage("");
      setName("");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#4B5FC6]"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#4B5FC6]"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Topic
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#4B5FC6]"
        >
          <option value="general">General question</option>
          <option value="correction">Correction</option>
          <option value="partnership">Partnership</option>
          <option value="event">Event</option>
          <option value="business">Business listing</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          className="min-h-[140px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#4B5FC6]"
          placeholder="How can we help?"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#991B1B]">
          {error}
        </div>
      )}
      {status === "sent" && !error && (
        <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF3] px-3 py-2 text-[12px] text-[#065F46]">
          Thanks! Your message has been sent. We&apos;ll reply by email soon.
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#9CA3AF]">
          By submitting, you agree to receive a reply via email.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
