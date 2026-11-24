"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconArrowLeft, IconGoogle } from "@/components/Icons";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Google Identity Services client ID. When set, Google's own "Sign in with Google" button is
// rendered and its ID token is exchanged for a Supabase session. Without it we fall back to
// the Supabase OAuth redirect button.
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

const ERROR_MESSAGES = {
  configuration: "Customer sign-in is unavailable until Supabase is configured.",
  unauthorized: "This account does not have customer access.",
  oauth: "Google sign-in could not be completed. Please try again.",
};

export default function AccountLoginPage() {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const credentialHandler = useRef(() => {});

  const getNextPath = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  };

  // Shared post-authentication gate: verifies the account role and sends the user to the
  // right workspace.
  const completeSignIn = async (supabase, user) => {
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
      window.location.assign("/admin/bookings?signedIn=1");
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
    window.location.assign(`${next}${next.includes("?") ? "&" : "?"}signedIn=1`);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") {
      setMode("signup");
    }
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason && ERROR_MESSAGES[reason]) setError(ERROR_MESSAGES[reason]);
  }, []);

  // Exchange the Google Identity Services ID token for a Supabase session, then run the
  // same role gate as the password flow.
  const handleGoogleCredential = async (response) => {
    setError("");
    setSuccess("");

    if (!response?.credential) {
      setError(ERROR_MESSAGES.oauth);
      return;
    }

    if (!isConfigured) {
      setError(ERROR_MESSAGES.configuration);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (authError || !user) {
        setError(ERROR_MESSAGES.oauth);
        return;
      }

      await completeSignIn(supabase, user);
    } catch {
      setError("Unable to contact the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Keep the GIS callback pointing at the latest handler without re-initialising Google.
  useEffect(() => {
    credentialHandler.current = handleGoogleCredential;
  });

  // Load the Google script once, then render Google's official button into our container.
  useEffect(() => {
    if (!googleClientId) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => credentialHandler.current(response),
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        logo_alignment: "left",
        width: 240,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", render);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", render);
      };
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", render);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", render);
    };
  }, []);

  // Supabase OAuth redirect sign-in, used when no Google client ID is configured.
  const signInWithGoogleRedirect = async () => {
    setError("");
    setSuccess("");

    if (!isConfigured) {
      setError(ERROR_MESSAGES.configuration);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const next = getNextPath();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (oauthError) {
        setError("Unable to start Google sign-in. Please try again.");
        setLoading(false);
      }
      // On success the browser leaves for Google, so the button stays in its loading state.
    } catch {
      setError("Unable to contact the sign-in service. Please try again.");
      setLoading(false);
    }
  };

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

      await completeSignIn(supabase, user);
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
        const next = getNextPath();
        window.location.assign(`${next}${next.includes("?") ? "&" : "?"}signedIn=1`);
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
    <section className="auth-page auth-page--customer">
      <aside className="auth-page__story">
        <a className="auth-page__brand" href="/" aria-label="EU Luxury Tours and Travels home">
          <img src="/logo-transparent.png" alt="" />
          <span><strong>EU Luxury</strong><small>Tours &amp; Travels</small></span>
        </a>
        <div className="auth-page__story-copy">
          <p>Travel, thoughtfully arranged</p>
          <h2>Your next journey starts with a warmer welcome.</h2>
          <span>Keep your trip details close, and every new arrival effortless.</span>
        </div>
        <span className="auth-page__location">Private journeys · Italy &amp; Europe</span>
      </aside>

      <div className="auth-page__content">
        <div className="auth-card">
          <p className="auth-card__eyebrow">YOUR JOURNEYS</p>
          <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-card__intro">{mode === "signup" ? "Create a customer account to request and manage your journeys." : "Sign in to see your upcoming journeys and booking details."}</p>

          <div className="auth-card__tabs" role="group" aria-label="Account access">
            <button type="button" aria-pressed={mode === "signin"} className={mode === "signin" ? "is-active" : ""} onClick={() => { setMode("signin"); setError(""); setSuccess(""); }}>Sign in</button>
            <button type="button" aria-pressed={mode === "signup"} className={mode === "signup" ? "is-active" : ""} onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>Create account</button>
          </div>

          {googleClientId ? (
            <div className="auth-card__google" ref={googleButtonRef} />
          ) : (
            <button
              type="button"
              className="auth-card__oauth"
              onClick={signInWithGoogleRedirect}
              disabled={loading || !isConfigured}
            >
              <IconGoogle />
              Continue with Google
            </button>
          )}
          <p className="auth-card__divider" aria-hidden="true"><span>or</span></p>

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
            <button className="btn btn--solid auth-card__submit" type="submit" disabled={loading || !isConfigured}>
              {loading ? (mode === "signup" ? "Creating account..." : "Signing in...") : mode === "signup" ? "Create customer account" : "Sign in"}
            </button>
          </form>
          {!isConfigured && <p className="admin-login__error" role="alert">{ERROR_MESSAGES.configuration}</p>}
          {error && <p className="admin-login__error" role="alert">{error}</p>}
          {success && <p className="admin-login__success" role="status">{success}</p>}
          <a className="auth-card__back" href="/"><IconArrowLeft />Return to the website</a>
        </div>
      </div>
    </section>
  );
}
