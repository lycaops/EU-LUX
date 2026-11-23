import { createSupabaseBrowserClient } from "./browser";

export async function getSignInGreeting(expectedRole) {
  const supabase = createSupabaseBrowserClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("No signed-in user was found.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role !== expectedRole) throw new Error("The signed-in user role does not match this page.");

  const metadataName = user.user_metadata?.full_name;
  const name = profile.full_name || (typeof metadataName === "string" ? metadataName : "");
  const role = expectedRole === "admin" ? "administrator" : "customer";
  return `Welcome${name ? `, ${name}` : ""}! You are signed in as a ${role}.`;
}
