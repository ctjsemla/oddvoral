"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthStore } from "@/store/authStore";
import { LogIn } from "lucide-react";
import { t } from "@/lib/i18n/en-IN";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.ok) {
      router.push("/community");
    } else {
      setError(result.error ?? t.auth.errors.loginFailed);
    }
  };

  const handleDemoLogin = () => {
    const demoEmail = "demo@oddvoral.com";
    const demoPass = "demo123";
    let result = login(demoEmail, demoPass);
    if (!result.ok) {
      register({
        username: "demo_user",
        email: demoEmail,
        password: demoPass,
        displayName: "Demo User",
      });
      result = login(demoEmail, demoPass);
    }
    if (result.ok) router.push("/community");
  };

  return (
    <MainLayout showSidebar={false} showCoupon={false}>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-op-surface border border-op-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LogIn className="text-op-accent" />
            <h1 className="text-2xl font-bold">{t.auth.login}</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 border border-op-border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.auth.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 border border-op-border rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-op-accent text-white py-2.5 rounded-md font-semibold hover:bg-op-header"
            >
              {t.auth.login}
            </button>
          </form>

          <button
            onClick={handleDemoLogin}
            className="w-full mt-3 border border-op-border py-2.5 rounded-md text-sm font-medium hover:bg-op-row-hover"
          >
            {t.auth.demoLogin}
          </button>

          <p className="text-center text-sm text-op-text-muted mt-6">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-op-accent font-semibold hover:underline">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
