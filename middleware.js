import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function redirectToLogin(request, error, cookies = []) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  if (error) url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  cookies.forEach(({ name, value, ...options }) => response.cookies.set(name, value, options));
  return response;
}

export async function middleware(request) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return redirectToLogin(request, "configuration");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, ...options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return redirectToLogin(request, null, response.cookies.getAll());
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return redirectToLogin(request, "unauthorized", response.cookies.getAll());
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
