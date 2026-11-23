"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSignInGreeting } from "@/lib/supabase/greeting";

const LINKS = [
  { href: "/admin", label: "Admin panel" },
  { href: "/admin/bookings", label: "Booking desk" },
  { href: "/admin/booking-configuration", label: "Booking configuration" },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("signedIn") !== "1") return;
    let active = true;
    getSignInGreeting("admin")
      .then((greeting) => { if (active) setNotice(greeting); })
      .catch(() => { if (active) setNotice("Welcome! You are signed in as an administrator."); });
    return () => { active = false; };
  }, []);

  return (
    <div className="admin-navigation">
      <nav className="admin-navigation__links" aria-label="Admin pages">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={pathname === href ? "is-active" : ""}
          >
            {label}
          </Link>
        ))}
      </nav>
      {notice && <p className="workspace__notice" role="status">{notice}</p>}
    </div>
  );
}
