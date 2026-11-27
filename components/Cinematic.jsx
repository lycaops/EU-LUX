"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "./LanguageProvider";
import HomeDetails from "./HomeDetails";
import { formatDate } from "@/lib/i18n";

// Text block -> background index. Hero + Arrival share the villa scene.
const BG_FOR_STEP = [0, 0, 1, 2, 4, 5];
const STEPS = ["s1", "s2", "s3", "s4", "s6", "s7"];

// Van pose per step.
const POSES = [
  { x: "-13vw", y: "3vh", scale: 0.86, rotationY: 0, opacity: 1 },  // hero
  { x: "-2vw", y: "1vh", scale: 1.02, rotationY: 0, opacity: 1 },  // arrival
  { x: "4vw", y: "4vh", scale: 1.38, rotationY: 0, opacity: 0 },    // exterior photo includes the vehicle
  { x: "18vw", y: "0vh", scale: 0.52, rotationY: 0, opacity: 0 },  // journey image includes the vehicle
  { x: "11vw", y: "1vh", scale: 0.68, rotationY: 0, opacity: 1 },   // experience
  { x: "0vw", y: "10vh", scale: 0.6, rotationY: 0, opacity: 0 },    // booking photo includes the vehicle
];

function Words({ text }) {
  return text.split(" ").map((w, i) => (
    <span className="word" key={i}>
      <span>{w}</span>{"\u00A0"}
    </span>
  ));
}

export default function Cinematic() {
  const { t, lang } = useLang();
  const root = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [form, setForm] = useState({ pickup: "", dropoff: "", date: "", time: "", pax: "2" });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    let resizeTimer;
    const updateWidth = () => setViewportWidth(window.innerWidth);
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateWidth, 140);
    };
    updateWidth();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (reduced) return;
    let ctx;
    let cancelled = false;

    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const bgs = gsap.utils.toArray(".scene-bg");
        const texts = gsap.utils.toArray(".scene-text");
        const mobile = window.innerWidth < 800;
        const tablet = window.innerWidth < 1100;
        const last = STEPS.length - 1;
        // Van placement per breakpoint. The van shares the same ground line as the
        // background photo and keeps a believable size on every screen, so it always
        // reads as part of the scene instead of floating away from it.
        const VAN_POSES = {
          mobile: {
            0: { x: "0vw", y: "5vh", scale: 1.16 },  // hero
            1: { x: "0vw", y: "10vh", scale: 1.3 },  // arrival
            4: { x: "0vw", y: "9vh", scale: 1.1 },   // experience: resting pose on the road
          },
          tablet: {
            0: { x: "-17vw", y: "5vh", scale: 0.92 },  // hero
            1: { x: "-3vw", y: "9vh", scale: 1.14 },  // arrival
            4: { x: "12vw", y: "9vh", scale: 0.84 },  // experience: resting pose on the road
          },
          desktop: {
            0: { x: "-17vw", y: "7vh", scale: 1.04 }, // hero
            1: { x: "-4vw", y: "10vh", scale: 1.18 }, // arrival
            4: { x: "14vw", y: "10vh", scale: 0.88 }, // experience: resting pose on the road
          },
        };
        // At the experience scene the van leaves the road: it zooms in and sweeps out of the
        // bottom-left corner before fading away.
        const VAN_EXIT = {
          mobile: { x: "-78vw", y: "72vh", scale: 2.8 },
          tablet: { x: "-80vw", y: "68vh", scale: 2.6 },
          desktop: { x: "-80vw", y: "68vh", scale: 2.8 },
        };
        const exitPose = () => (mobile ? VAN_EXIT.mobile : tablet ? VAN_EXIT.tablet : VAN_EXIT.desktop);
        // Before the exterior scene (whose photo already shows the vehicle) the van zooms in
        // place towards the camera, so the cut never reveals a second vehicle.
        const VAN_ZOOM = {
          mobile: { x: "0vw", y: "10vh", scale: 1.7 },
          tablet: { x: "-3vw", y: "9vh", scale: 1.7 },
          desktop: { x: "-4vw", y: "10vh", scale: 1.7 },
        };
        const zoomPose = () => (mobile ? VAN_ZOOM.mobile : tablet ? VAN_ZOOM.tablet : VAN_ZOOM.desktop);
        const poseForStep = (i) => {
          if (!(i in VAN_POSES.desktop)) return POSES[i];
          const group = mobile ? VAN_POSES.mobile : tablet ? VAN_POSES.tablet : VAN_POSES.desktop;
          return { ...POSES[i], ...group[i] };
        };

        gsap.set(".van", { ...poseForStep(0), xPercent: -50, transformPerspective: 1200 });
        gsap.set(".van-reflection", { xPercent: -50 });
        gsap.set(".booking", { xPercent: -50, autoAlpha: 0, y: 40 });
        gsap.set(texts[0], { autoAlpha: 1 });
        gsap.set(texts.slice(1), { autoAlpha: 0 });
        gsap.set(texts.slice(1).flatMap((el) => [...el.querySelectorAll(".word > span")]), { yPercent: 110 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: root.current.querySelector(".stage"),
            start: "top top",
            end: mobile ? "+=420%" : "+=620%",
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => setActive(Math.round(self.progress * last)),
          },
        });

        // Slow ambient parallax on every background for the full run.
        tl.fromTo(bgs, { scale: 1.06 }, { scale: 1.16, duration: last, ease: "none" }, 0);

        // The arrival move is kept short so the van fully settles before the departure zoom
        // begins; a long arrival would otherwise be cut off mid-motion.
        const poseTo = (i) => ({ ...poseForStep(i), duration: i === 1 ? 0.5 : i === 4 ? 1.2 : i === 5 ? 0.45 : 0.9 });
        for (let i = 1; i <= last; i++) {
          const at = i - 0.7;
          // text out / in
          tl.to(texts[i - 1], { autoAlpha: 0, y: -32, duration: i === last ? 0.25 : 0.25 }, i === last ? at + 0.35 : at);
          tl.set(texts[i], { y: 0 }, at);
          tl.to(texts[i], { autoAlpha: 1, duration: i === last ? 0.22 : 0.22 }, i === last ? at + 0.55 : at + 0.18);
          tl.to(texts[i].querySelectorAll(".word > span"), { yPercent: 0, duration: i === last ? 0.32 : 0.42, stagger: 0.04, ease: "power3.out" }, i === last ? at + 0.55 : at + 0.18);
          // background crossfade when the scene changes
          if (BG_FOR_STEP[i] !== BG_FOR_STEP[i - 1]) {
            const bgAt = i === last ? at + 0.55 : i === 4 ? at - 0.2 : at;
            tl.to(bgs[BG_FOR_STEP[i]], { opacity: 1, duration: 0.7 }, bgAt);
            tl.to(bgs[BG_FOR_STEP[i - 1]], { opacity: 0, duration: 0.7 }, bgAt + 0.3);
          }
          // van camera move
          const vanAt = i === 4 ? at - 0.2 : [2, 3].includes(i) ? at - 0.3 : at;
          if (i === 4) {
            // Experience scene: the van zooms in and then holds that position on the road while
            // the copy is on screen. It does not move again until the copy starts to fade out.
            tl.to(".van", { ...poseForStep(4), duration: 0.5 }, vanAt);
            tl.to(".van-reflection", { opacity: 1, duration: 0.5 }, vanAt);
          } else if (i === last) {
            // As the experience copy fades away (same moment: at + 0.35), the van zooms in once
            // more and sweeps off the bottom-left of the screen, disappearing with the scene.
            tl.to(".van", { ...exitPose(), opacity: 0, duration: 0.7, ease: "power2.in" }, at + 0.35);
            tl.to(".van-reflection", { opacity: 0, duration: 0.5 }, at + 0.35);
          } else if (i === 2) {
            // The exterior scene uses a photograph that already contains the vehicle, so the
            // animated van zooms towards the camera and vanishes just before that scene begins.
            const zoomAt = vanAt - 0.15;
            tl.to(".van", { ...zoomPose(), duration: 0.4, ease: "power2.in" }, zoomAt);
            tl.to(".van", { opacity: 0, duration: 0.35, ease: "power1.in" }, zoomAt + 0.05);
            tl.to(".van-reflection", { opacity: 0, duration: 0.4 }, zoomAt);
          } else {
            tl.to(".van", poseTo(i), vanAt);
            tl.to(".van-reflection", { opacity: POSES[i].opacity ? 1 : 0, duration: 0.6 }, vanAt);
          }
        }
        tl.to(".booking", { autoAlpha: 1, y: 0, duration: 0.45 }, last - 0.05);
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, [reduced, lang, viewportWidth]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const q = new URLSearchParams(form).toString();

  return (
    <div ref={root} className={reduced ? "static" : ""} id="experience">
      <section className="stage" aria-label="EU Luxury Tours & Travels">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className={`scene-bg bg-${n}`} aria-hidden="true" />
        ))}
        <div className="van-reflection" aria-hidden="true" />
        <div className="van">
          <img src="/v250.webp" alt="Mercedes-Benz V-Class V250" width="1671" height="941" />
        </div>

        {STEPS.map((key, i) => {
          const s = t[key];
          const Tag = i === 0 ? "h1" : "h2";
          return (
            <div className={`scene-text scene-text--${key}`} key={key}>
              <p className="eyebrow">{s.eyebrow}</p>
              <Tag><Words text={s.title} /></Tag>
              {s.body && <p>{s.body}</p>}
              {i === 0 && (
                <div className="cta">
                  <a className="btn btn--solid" href="/book">{s.cta1}</a>
                  <a className="btn btn--ghost" href="#experience">{s.cta2}</a>
                </div>
              )}
            </div>
          );
        })}

        <div className={`booking ${active === STEPS.length - 1 || reduced ? "active" : ""}`} id="booking">
          <form action="/book" method="get">
            <div><label htmlFor="pickup">{t.booking.pickup}</label>
              <input id="pickup" name="pickup" value={form.pickup} onChange={onChange} placeholder={t.booking.pickupPh} required /></div>
            <div><label htmlFor="dropoff">{t.booking.dropoff}</label>
              <input id="dropoff" name="dropoff" value={form.dropoff} onChange={onChange} placeholder={t.booking.dropoffPh} required /></div>
            <div><label htmlFor="date">{t.booking.date}</label>
              <input id="date" name="date" type="date" value={form.date} onChange={onChange} required /></div>
            <div><label htmlFor="time">{t.booking.time}</label>
              <input id="time" name="time" type="time" value={form.time} onChange={onChange} required /></div>
            <div><label htmlFor="pax">{t.booking.pax}</label>
              <select id="pax" name="pax" value={form.pax} onChange={onChange}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}
              </select></div>
            <button className="btn btn--solid" type="submit">{t.booking.cta}</button>
            {form.date && <p className="hint">{t.booking.preview}: {formatDate(form.date, lang)}{form.time ? ` · ${form.time}` : ""}</p>}
          </form>
        </div>

        <div className="progress" aria-hidden="true">
          {STEPS.map((k, i) => <i key={k} className={i === active ? "on" : ""} />)}
        </div>
      </section>
      <HomeDetails />
    </div>
  );
}
