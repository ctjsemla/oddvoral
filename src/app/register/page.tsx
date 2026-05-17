"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthStore } from "@/store/authStore";
import { UserPlus } from "lucide-react";
import { t } from "@/lib/i18n/en-IN";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = register(form);
    if (result.ok) {
      router.push("/community");
    } else {
      setError(result.error ?? t.auth.errors.registerFailed);
    }
  };

  return (
    <MainLayout showSidebar={false} showCoupon={false}>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-op-surface border border-op-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="text-op-accent" />
            <h1 className="text-2xl font-bold">{t.auth.register}</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.auth.username}</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 border border-op-border rounded-md"
                pattern="[a-zA-Z0-9_]+"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.auth.displayName}</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 border border-op-border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.auth.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 border border-op-border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.auth.password}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 border border-op-border rounded-md"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-op-accent text-white py-2.5 rounded-md font-semibold hover:bg-op-header"
            >
              {t.auth.createAccount}
            </button>
          </form>

          <p className="text-center text-sm text-op-text-muted mt-6">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="text-op-accent font-semibold hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
