"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LANGS } from "@/lib/i18n";

export default function ProfileForm({ email, fullName, phone, preferredLang }) {
  const [form, setForm] = useState({ fullName, phone, preferredLang });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const { error } = await supabase.from("profiles").update({
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        preferred_lang: form.preferredLang,
      }).eq("id", user.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: form.fullName.trim() } });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="booking-edit profile-form" onSubmit={saveProfile}>
      <label>Email<input value={email} readOnly /></label>
      <label>Full name<input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required /></label>
      <label>Phone<input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
      <label>Preferred language<select value={form.preferredLang} onChange={(event) => setForm((current) => ({ ...current, preferredLang: event.target.value }))}>{LANGS.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select></label>
      <div className="booking-edit__actions">
        <button className="btn btn--solid" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      </div>
      {message && <p className="workspace__notice" role="status">{message}</p>}
    </form>
  );
}
