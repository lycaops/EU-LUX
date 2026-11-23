"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ERROR_MESSAGES = {
  configuration: "Customer sign-in is unavailable until Supabase is configured.",
  unauthorized: "This account does not have customer access.",
};

export default function AccountLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getNextPath = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  };

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason && ERROR_MESSAGES[reason]) setError(ERROR_MESSAGES[reason]);
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

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

      if (profileError) {
        const { error: signOutError } = await supabase.auth.signOut();
        setError(signOutError
          ? "Unable to verify account access, and sign-out failed. Please try again."
          : "Unable to verify account access. Please try again.");
        return;
      }

      if (profile?.role === "admin") {
        router.replace("/admin?signedIn=1");
        router.refresh();
        return;
      }

      if (profile?.role !== "customer") {
        const { error: signOutError } = await supabase.auth.signOut();
        setError(signOutError
          ? `${ERROR_MESSAGES.unauthorized} Sign-out failed; please sign out and try again.`
          : ERROR_MESSAGES.unauthorized);
        return;
      }

      const next = getNextPath();
      router.replace(`${next}${next.includes("?") ? "&" : "?"}signedIn=1`);
      router.refresh();
    } catch {
      setError("Unable to contact the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isConfigured) {
      setError(ERROR_MESSAGES.configuration);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (authError) {
        setError(authError.message || "Account creation failed. Please try again.");
        return;
      }

      if (!data.user) {
        setError("Account creation failed. Please try again.");
        return;
      }

      if (data.session) {
        router.replace(getNextPath());
        router.refresh();
        return;
      }

      setSuccess("Account created. Check your email for a confirmation link, then sign in.");
      setMode("signin");
    } catch {
      setError("Unable to contact the sign-up service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login">
      <div className="admin-login__panel">
        <p className="workspace__eyebrow">EU LUXURY · YOUR JOURNEYS</p>
        <h1>{mode === "signup" ? "Create your account" : "Customer sign-in"}</h1>
        <p>{mode === "signup" ? "Create an account to manage your journeys." : "Sign in to view your account."}</p>
        <form onSubmit={mode === "signup" ? signUp : signIn}>
          {mode === "signup" && (
            <label>
              Full name
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}
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
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={mode === "signup" ? 6 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="btn btn--solid" type="submit" disabled={loading || !isConfigured}>
            {loading ? (mode === "signup" ? "Creating account..." : "Signing in...") : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
        {!isConfigured && <p className="admin-login__error" role="alert">{ERROR_MESSAGES.configuration}</p>}
        {error && <p className="admin-login__error" role="alert">{error}</p>}
        {success && <p className="admin-login__success" role="status">{success}</p>}
        <button
          className="admin-login__switch"
          type="button"
          onClick={() => {
            setMode((current) => current === "signin" ? "signup" : "signin");
            setError("");
            setSuccess("");
          }}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
        <a href="/">Return to the website</a>
      </div>
    </section>
  );
}
