"use client";

import { useState, FormEvent } from "react";

type Props = {
  hasPassword: boolean;
};

export default function AdminLoginForm({ hasPassword }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!hasPassword) {
      setError("Admin password is not configured on the server.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Incorrect password.");
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Unable to sign in right now. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-[11px] font-medium text-[#374151]"
        >
          Admin password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] text-[#111827] outline-none focus:border-[#4B5FC6]"
          placeholder="Enter password"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !password.trim() || !hasPassword}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
