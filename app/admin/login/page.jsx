"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ERROR_MESSAGES = {
  configuration: "Admin sign-in is unavailable until Supabase is configured.",
  unauthorized: "This account does not have administrator access.",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason && ERROR_MESSAGES[reason]) setError(ERROR_MESSAGES[reason]);
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setError("");

    if (!isConfigured) {
      setError(ERROR_MESSAGES.configuration);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Sign-in failed. Check your email and password.");
        return;
      }

      if (!user) {
        setError("Sign-in failed. Please try again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "admin") {
        const { error: signOutError } = await supabase.auth.signOut();
        if (profileError) {
          setError(signOutError
            ? "Unable to verify administrator access, and sign-out failed. Please try again."
            : "Unable to verify administrator access. Please try again.");
        } else {
          setError(signOutError
            ? `${ERROR_MESSAGES.unauthorized} Sign-out failed; please sign out and try again.`
            : ERROR_MESSAGES.unauthorized);
        }
        return;
      }

      router.replace("/admin?signedIn=1");
      router.refresh();
    } catch {
      setError("Unable to contact the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login">
      <div className="admin-login__panel">
        <p className="workspace__eyebrow">EU LUXURY · OPERATIONS</p>
        <h1>Administrator sign-in</h1>
        <p>Use an administrator account to access the operations workspace.</p>
        <form onSubmit={signIn}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="btn btn--solid" type="submit" disabled={loading || !isConfigured}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {!isConfigured && <p className="admin-login__error" role="alert">{ERROR_MESSAGES.configuration}</p>}
        {error && <p className="admin-login__error" role="alert">{error}</p>}
        <a href="/">Return to the website</a>
      </div>
    </section>
  );
}
