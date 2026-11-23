import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/account/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, preferred_lang")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div>
          <p className="workspace__eyebrow">EU LUXURY · YOUR ACCOUNT</p>
          <h1>Profile</h1>
          <p className="workspace__intro">Manage your contact details and preferred language.</p>
        </div>
        <div className="workspace__header-actions">
          <a className="btn btn--ghost" href="/account">Your bookings</a>
          <a className="btn btn--solid" href="/">View website</a>
        </div>
      </header>
      <ProfileForm
        email={user.email || ""}
        fullName={profile?.full_name || user.user_metadata?.full_name || ""}
        phone={profile?.phone || ""}
        preferredLang={profile?.preferred_lang || "en"}
      />
    </section>
  );
}
