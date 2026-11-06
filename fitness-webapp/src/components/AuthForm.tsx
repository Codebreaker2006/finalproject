"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(isRegister ? "/survey" : "/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="font-display text-xl tracking-tight text-ink">Fitness Log</p>
          <p className="mt-1 text-sm text-ink/60">
            {isRegister ? "Create an account to start tracking." : "Sign in to your log."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 border-t border-line pt-6">
          <div>
            <label htmlFor="email" className="block text-sm text-ink/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-ink/70 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-chalk border border-line px-3 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-glaucous/50 focus:border-glaucous"
              placeholder={isRegister ? "At least 8 characters" : "••••••••"}
            />
          </div>

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-glaucous text-chalk py-2.5 font-medium hover:bg-glaucousDark transition-colors disabled:opacity-60"
          >
            {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <a href="/login" className="text-glaucous hover:text-glaucousDark underline underline-offset-2">
                Sign in
              </a>
            </>
          ) : (
            <>
              New here?{" "}
              <a href="/register" className="text-glaucous hover:text-glaucousDark underline underline-offset-2">
                Create an account
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
