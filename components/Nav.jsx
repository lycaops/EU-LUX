"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { LANGS, dict } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function Nav() {
  const { lang, setLang, t, suggested, dismissSuggestion } = useLang();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const current = LANGS.find((l) => l.code === lang);
  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => {
    let active = true;
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (active) setSignedIn(Boolean(data.user));
      });
    } catch {
      if (active) setSignedIn(false);
    }
    return () => { active = false; };
  }, []);

  const signOut = async () => {
    try {
      await createSupabaseBrowserClient().auth.signOut();
    } finally {
      window.location.assign("/account/login");
    }
  };

  return (
    <>
      <header className="nav">
        <Link href="/" className="nav__brand" aria-label="EU Luxury Tours & Travels" onClick={closeMobileMenu}>
          <span className="nav__emblem" aria-hidden="true">
            <img src="/logo-transparent.png" alt="" />
          </span>
          <span className="nav__wordmark">
            <strong>EU Luxury</strong>
            <small>Tours &amp; Travels</small>
          </span>
        </Link>
        <nav id="primary-navigation" className={`nav__links${mobileOpen ? " is-open" : ""}`} aria-label="Main">
          <a href="/" onClick={closeMobileMenu}>{t.nav.home}</a>
          <a href="/#fleet" onClick={closeMobileMenu}>{t.nav.fleet}</a>
          <a href="/#interior" onClick={closeMobileMenu}>{t.nav.interior}</a>
          <a href="/#services" onClick={closeMobileMenu}>{t.nav.services}</a>
          <div className="nav__account">
            <button
              type="button"
              className="nav__account-trigger"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((current) => !current)}
            >
              {t.nav.account}
            </button>
            <div className="nav__account-menu" role="menu">
              {signedIn ? (
                <>
                  <a role="menuitem" href="/account" onClick={closeMobileMenu}>Your bookings</a>
                  <a role="menuitem" href="/account/profile" onClick={closeMobileMenu}>Profile</a>
                  <button role="menuitem" type="button" onClick={signOut}>Sign out</button>
                </>
              ) : (
                <a role="menuitem" href="/account/login" onClick={closeMobileMenu}>Sign in</a>
              )}
            </div>
          </div>
        </nav>
        <div className="nav__actions">
          <div className="lang">
            <button className="lang__btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
              {current.short}
            </button>
            {open && (
              <ul className="lang__menu" role="listbox">
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <button
                      aria-current={l.code === lang}
                      lang={l.code}
                      onClick={() => { setLang(l.code); setOpen(false); }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a className="btn btn--solid nav__book" href="/book" onClick={closeMobileMenu}>
            {t.nav.book}<span className="nav__book-arrow" aria-hidden="true" />
          </a>
          <button
            className="nav__toggle"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-controls="primary-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {suggested && (
        <div className="suggest" role="dialog" aria-live="polite">
          <span lang={suggested}>{dict[suggested].lang.suggest}</span>
          <span style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <button className="btn btn--solid" onClick={() => setLang(suggested)}>{dict[suggested].lang.yes}</button>
            <button onClick={dismissSuggestion}>{dict[suggested].lang.no}</button>
          </span>
        </div>
      )}
    </>
  );
}
