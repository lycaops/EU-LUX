"use client";
import { useLang } from "./LanguageProvider";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <img src="/logo-transparent.png" alt="EU Luxury Tours & Travels" />
          <p>{t.footer.about}</p>
        </div>
        <div>
          <h4>{t.footer.contact}</h4>
          <p>EU LUXURY TOURS &amp; TRAVELS</p>
          <p>Via Penghe, Selvazzano Dentro, Italy</p>
        </div>
        <div>
          <h4>{t.footer.legal}</h4>
          <p>{t.footer.vat}: 000000000</p>
          <a href="/privacy">{t.footer.privacy}</a>
          <a href="/terms">{t.footer.terms}</a>
        </div>
      </div>
      <div className="footer__legal">
        <span>© {new Date().getFullYear()} EU Luxury Tours &amp; Travels. {t.footer.rights}</span>
        <span>{t.footer.vat}: 000000000</span>
      </div>
    </footer>
  );
}
