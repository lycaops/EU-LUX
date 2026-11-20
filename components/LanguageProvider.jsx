"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dict, LANGS, DEFAULT_LANG, detectLang } from "@/lib/i18n";

const Ctx = createContext(null);
const KEY = "euluxury_lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [suggested, setSuggested] = useState(null);

  const apply = useCallback((code) => {
    const meta = LANGS.find((l) => l.code === code) || LANGS[0];
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
  }, []);

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved && dict[saved]) {
      setLangState(saved);
      apply(saved);
      return;
    }
    // First visit: suggest the browser language, never switch silently.
    const guess = detectLang(navigator.language);
    apply(DEFAULT_LANG);
    if (guess !== DEFAULT_LANG) setSuggested(guess);
  }, [apply]);

  const setLang = useCallback((code) => {
    setLangState(code);
    apply(code);
    setSuggested(null);
    try { localStorage.setItem(KEY, code); } catch {}
    try { document.cookie = `${KEY}=${code};path=/;max-age=31536000;samesite=lax`; } catch {}
  }, [apply]);

  const dismissSuggestion = useCallback(() => {
    setSuggested(null);
    try { localStorage.setItem(KEY, lang); } catch {}
  }, [lang]);

  const t = dict[lang];
  return (
    <Ctx.Provider value={{ lang, setLang, t, suggested, dismissSuggestion }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
