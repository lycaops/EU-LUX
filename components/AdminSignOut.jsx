"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminSignOut() {
  const [error, setError] = useState("");

  const signOut = async () => {
    setError("");
    try {
      const { error: signOutError } = await createSupabaseBrowserClient().auth.signOut();
      if (signOutError) {
        setError("Sign-out failed. Please try again.");
        return;
      }

      window.location.assign("/admin/login");
    } catch {
      setError("Sign-out failed. Please try again.");
    }
  };

  return (
    <div className="admin-signout">
      <button type="button" className="action-link" onClick={signOut}>Sign out</button>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
