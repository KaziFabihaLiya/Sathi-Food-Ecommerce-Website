"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (!res || res.error) {
      setError("Invalid credentials, or too many attempts. Please try again later.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="panel w-full max-w-sm space-y-5 p-8">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-forest">Shathi Foods</h1>
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" required autoComplete="username" className="field bg-white" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className="field bg-white" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
        <button type="submit" disabled={busy} className="btn-dark w-full">{busy ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );
}
