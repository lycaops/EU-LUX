"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconArrowLeft } from "@/components/Icons";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ERROR_MESSAGES = {
  configuration: "Admin sign-in is unavailable until Supabase is configured.",
  unauthorized: "This account does not have administrator access.",
};

export default function AdminLoginPage() {
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

      window.location.assign("/admin/bookings?signedIn=1");
    } catch {
      setError("Unable to contact the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-page--admin">
      <aside className="auth-page__story">
        <a className="auth-page__brand" href="/" aria-label="EU Luxury Tours and Travels home">
          <img src="/logo-transparent.png" alt="" />
          <span><strong>EU Luxury</strong><small>Operations</small></span>
        </a>
        <div className="auth-page__story-copy">
          <p>EU Luxury · Operations</p>
          <h2>Every detail of the journey, in hand.</h2>
          <span>Sign in to coordinate bookings and manage your service settings.</span>
        </div>
        <span className="auth-page__location">Administrator workspace</span>
      </aside>

      <div className="auth-page__content">
        <div className="auth-card">
          <p className="auth-card__eyebrow">ADMINISTRATOR ACCESS</p>
          <h1>Welcome back</h1>
          <p className="auth-card__intro">Sign in with an administrator account to continue to the operations workspace.</p>
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
            <button className="btn btn--solid auth-card__submit" type="submit" disabled={loading || !isConfigured}>
              {loading ? "Signing in..." : "Sign in to admin"}
            </button>
          </form>
          {!isConfigured && <p className="admin-login__error" role="alert">{ERROR_MESSAGES.configuration}</p>}
          {error && <p className="admin-login__error" role="alert">{error}</p>}
          <a className="auth-card__back" href="/"><IconArrowLeft />Return to the website</a>
          <p className="auth-card__customer-link">Looking for your customer account? <a href="/account/login">Customer sign-in</a></p>
        </div>
      </div>
    </section>
  );
}
