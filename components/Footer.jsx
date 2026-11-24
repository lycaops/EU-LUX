"use client";
import { useLang } from "./LanguageProvider";
import { getLegal } from "@/lib/legal";
import { COOKIE_SETTINGS_EVENT } from "./CookieConsent";
import { IconPin, IconPhone, IconMail, IconFacebook, IconX, IconInstagram, IconLinkedin, IconTiktok } from "./Icons";

const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/", Icon: IconFacebook },
  { name: "X", href: "https://x.com/", Icon: IconX },
  { name: "Instagram", href: "https://www.instagram.com/", Icon: IconInstagram },
  { name: "LinkedIn", href: "https://www.linkedin.com/", Icon: IconLinkedin },
  { name: "TikTok", href: "https://www.tiktok.com/", Icon: IconTiktok },
];

export default function Footer() {
  const { t, lang } = useLang();
  const openCookieSettings = () => {
    try { window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT)); } catch {}
  };
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <img src="/logo-transparent.png" alt="EU Luxury Tours & Travels" />
          <p>{t.footer.about}</p>
          <p>NCC - Noleggio con conducente</p>
        </div>
        <div>
          <h4>{t.footer.contact}</h4>
          <p>EU LUXURY TOURS &amp; TRAVELS</p>
          <p className="footer__contact-item">
            <IconPin className="footer__icon" />
            <span>Via Penghe, Selvazzano Dentro, Italy</span>
          </p>
          <a className="footer__contact-item" href="tel:+393246879934">
            <IconPhone className="footer__icon" />
            <span>+39 324 6879 934</span>
          </a>
          <a className="footer__contact-item" href="mailto:eu.luxury.tours@gmail.com">
            <IconMail className="footer__icon" />
            <span>eu.luxury.tours@gmail.com</span>
          </a>
        </div>
        <div>
          <h4>{t.footer.legal}</h4>
          <a href="/privacy">{t.footer.privacy}</a>
          <a href="/terms">{t.footer.terms}</a>
          <button type="button" className="footer__cookie-btn" onClick={openCookieSettings}>
            {getLegal(lang).banner.settings}
          </button>
          <h4 className="footer__vat-heading">{t.footer.vat}</h4>
          <p className="footer__vat">05599350286</p>
        </div>
      </div>
      <div className="footer__legal">
        <span>© {new Date().getFullYear()} EU Luxury Tours &amp; Travels. {t.footer.rights}</span>
        <ul className="footer__social" aria-label="Social media">
          {SOCIAL_LINKS.map(({ name, href, Icon }) => (
            <li key={name}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}>
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
