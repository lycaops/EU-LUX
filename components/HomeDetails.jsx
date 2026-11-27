"use client";

import { useLang } from "./LanguageProvider";
import VehicleScene from "./VehicleScene";
import {
  IconArrowUpRight,
  IconUsers,
  IconLuggage,
  IconSofa,
  IconClimate,
  IconBag,
  IconPlane,
  IconBuilding,
  IconBriefcase,
  IconMap,
  IconClock,
  IconHeart,
} from "./Icons";

const CABIN_ICONS = [IconSofa, IconClimate, IconBag];
const SERVICE_ICONS = [IconPlane, IconBuilding, IconBriefcase, IconMap, IconClock, IconHeart];

export default function HomeDetails() {
  const { t } = useLang();
  const details = t.details;

  return (
    <div className="home-details">
      <section className="home-detail fleet-detail" id="fleet">
        <div className="home-detail__inner fleet-detail__layout">
          <div className="home-detail__copy">
            <p className="home-detail__eyebrow">{t.nav.fleet}</p>
            <h2>{t.s3.title}</h2>
            <p className="home-detail__intro">{t.s3.body}</p>
            <h3 className="fleet-detail__model">Mercedes-Benz V-Class V250</h3>
            <dl className="fleet-specs">
              <div><dt><IconUsers />{t.booking.pax}</dt><dd>7</dd></div>
              <div><dt><IconLuggage />{details.luggage}</dt><dd>7</dd></div>
            </dl>
            <a className="btn btn--ghost detail-cta" href="/book">{t.nav.book}<IconArrowUpRight /></a>
          </div>
          <figure className="fleet-detail__vehicle">
            <img src="/v250.webp" alt="Mercedes-Benz V-Class V250 executive van" loading="lazy" />
            <figcaption>V250 · Executive comfort for up to seven guests</figcaption>
          </figure>
        </div>
      </section>

      <VehicleScene />

      <section className="home-detail interior-detail" id="interior">
        <div className="home-detail__inner">
          <header className="home-detail__heading">
            <p className="home-detail__eyebrow">{t.s5.eyebrow}</p>
            <h2>{t.s5.title}</h2>
            <p className="home-detail__intro">{t.s5.body}</p>
          </header>
          <div className="interior-detail__layout">
            <figure className="interior-feature">
              <img src="/scenes/int_3.webp" alt="Mercedes-Benz V-Class luxury passenger cabin" loading="lazy" />
              <figcaption>V-Class · Passenger cabin</figcaption>
            </figure>
            <ul className="interior-features">
              {details.cabinFeatures.map((feature, index) => {
                const Icon = CABIN_ICONS[index % CABIN_ICONS.length];
                return (
                  <li key={feature}><span aria-hidden="true"><Icon /></span><strong>{feature}</strong></li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-detail services-detail" id="services">
        <div className="home-detail__inner">
          <header className="home-detail__heading">
            <p className="home-detail__eyebrow">{t.nav.services}</p>
            <h2>{details.servicesTitle}</h2>
            <p className="home-detail__intro">{t.s6.body}</p>
          </header>
          <div className="service-list">
            {details.services.map((service, index) => {
              const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
              return (
                <article className="service-item" key={service.title}>
                  <span className="service-item__number" aria-hidden="true"><Icon /></span>
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </article>
              );
            })}
          </div>
          <a className="btn btn--solid detail-cta" href="/book">{t.nav.book}<IconArrowUpRight /></a>
        </div>
      </section>
    </div>
  );
}