import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Only allow relative, single-slash paths so the redirect cannot leave the site.
function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const fail = (reason) => NextResponse.redirect(`${origin}/account/login?error=${reason}`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return fail("configuration");
  if (!code) return fail("oauth");

  const cookieStore = cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return fail("oauth");

  // Google-created users receive the default customer role through the auth trigger.
  // Administrators signing in here still land in the operations workspace.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const destination = profile?.role === "admin" ? "/admin/bookings" : next;
  const separator = destination.includes("?") ? "&" : "?";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base = process.env.NODE_ENV === "development" || !forwardedHost
    ? origin
    : `https://${forwardedHost}`;
  return NextResponse.redirect(`${base}${destination}${separator}signedIn=1`);
}
