"use client";
import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { getLegal } from "@/lib/legal";
import { IconArrowLeft } from "./Icons";

export default function LegalPage({ docKey }) {
  const { lang } = useLang();
  const content = getLegal(lang);
  const doc = content[docKey];

  return (
    <article className="page legal">
      <p className="legal__eyebrow">{content.eyebrow}</p>
      <h1>{doc.title}</h1>
      <p className="legal__updated">
        {content.labels.updated}: {doc.updated}
      </p>

      {doc.sections.map((section, index) => (
        <section className="legal__section" id={section.id} key={index}>
          <h2>{section.heading}</h2>
          {section.body?.map((text, i) => (
            <p key={`p${i}`}>{text}</p>
          ))}
          {section.list && (
            <ul>
              {section.list.map((item, i) => (
                <li key={`l${i}`}>{item}</li>
              ))}
            </ul>
          )}
          {section.body2?.map((text, i) => (
            <p key={`q${i}`}>{text}</p>
          ))}
        </section>
      ))}

      <Link className="legal__back" href="/">
        <IconArrowLeft />
        {content.labels.back}
      </Link>
    </article>
  );
}
