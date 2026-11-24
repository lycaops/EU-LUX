"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { getLegal } from "@/lib/legal";

export const COOKIE_CONSENT_KEY = "euluxury_cookie_consent";
export const COOKIE_SETTINGS_EVENT = "euluxury:open-cookie-settings";

export default function CookieConsent() {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  const copy = getLegal(lang).banner;

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_CONSENT_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
    const openSettings = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-cookie-consent", visible);
    return () => document.body.classList.remove("has-cookie-consent");
  }, [visible]);

  const decide = (value) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
      document.cookie = `${COOKIE_CONSENT_KEY}=${value};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* storage unavailable – the choice simply will not persist */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-modal="false" aria-label={copy.title}>
      <div className="cookie-consent__text">
        <strong>{copy.title}</strong>
        <p>{copy.body}</p>
      </div>
      <div className="cookie-consent__actions">
        <button type="button" className="btn btn--ghost" onClick={() => decide("rejected")}>
          {copy.reject}
        </button>
        <button type="button" className="btn btn--solid" onClick={() => decide("accepted")}>
          {copy.accept}
        </button>
      </div>
      <Link className="cookie-consent__link" href="/privacy">
        {copy.policy}
      </Link>
    </div>
  );
}
