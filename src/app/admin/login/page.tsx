"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OddvoralLogo } from "@/components/brand/OddvoralLogo";
import { useAdminStore } from "@/store/adminStore";
import { useAdminReady } from "@/hooks/useAdminReady";

function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] text-sm text-gray-500">
      Loading admin…
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const ready = useAdminReady();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated) router.replace("/admin/analytics");
  }, [ready, isAuthenticated, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    if (login(password)) {
      router.replace("/admin/analytics");
      return;
    }
    setError("Invalid password");
    setSubmitting(false);
  };

  if (!ready) return <AdminLoading />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-lg p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <OddvoralLogo size={40} />
          <div>
            <h1 className="font-bold text-lg text-gray-900">Admin</h1>
            <p className="text-xs text-gray-500">Oddvoral analytics</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-op-accent/40"
          placeholder="Enter admin password"
          autoFocus
          disabled={submitting}
        />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-op-header text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-op-accent transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-[10px] text-gray-400 mt-4 text-center">
          Demo password: oddvoral-admin
        </p>
      </form>
    </div>
  );
}
