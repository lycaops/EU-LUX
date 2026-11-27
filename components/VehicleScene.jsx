"use client";

import { useEffect, useRef } from "react";
import { useLang } from "./LanguageProvider";
import { IconUsers, IconLuggage, IconSofa, IconClimate, IconCheck } from "./Icons";

// Geometry and timing constants carried over from the source scroll scene.
const BGW = 5504, BGH = 3072;
const VCW = 1672, VCH = 941;
const V_FRONT = { cx: 261.4, cy: 655.4, size: 212 };
const V_REAR = { cx: 1378.75, cy: 665.75, size: 212 };
const V_ENTRY = 1854, V_WHEEL = 5 * Math.PI, V_DOOR = 352, V_ZOOM = 2.24, V_FX = 955, V_FY = 456;

const BG_SRC = "/scenes/v250-milan/duomo-piazza.jpg";
const IMG_SRC = {
  vehicle: "/scenes/v250-milan/vehicle.webp",
  door: "/scenes/v250-milan/door.webp",
  glow: "/scenes/v250-milan/glow.webp",
  wheelFront: "/scenes/v250-milan/wheelFront.webp",
  wheelRear: "/scenes/v250-milan/wheelRear.webp",
};

const SPEC_ICONS = [IconUsers, IconLuggage, IconSofa, IconClimate, IconCheck];

const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const lp = (a, b, t) => a + (b - a) * t;
const sstep = (e0, e1, x) => { const t = cl((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const eOutQuint = (t) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eIO3 = (t) => { t = cl(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eIO4 = (t) => { t = cl(t, 0, 1); return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; };

function vcState(t, zm) {
  const drive = eOutQuint(t / 2.65);
  const brake = Math.sin(Math.PI * sstep(0.9, 2.68, t));
  return {
    carX: (1 - drive) * V_ENTRY,
    wheel: (1 - drive) * V_WHEEL,
    pitch: (-0.26 * Math.PI / 180) * brake * (1 - sstep(2.45, 2.7, t)),
    doorPop: sstep(3.05, 3.4, t),
    doorX: eIO3((t - 3.32) / 1.42) * V_DOOR,
    glow: sstep(3.12, 4.25, t),
    zoom: eIO4((t - 4.15) / 2.8),
    cam: lp(1, zm, eIO4((t - 4.15) / 2.8)),
  };
}

export default function VehicleScene() {
  const { t } = useLang();
  const spec = t.details.specScene;

  const trackRef = useRef(null);
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const specsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const track = trackRef.current;
    const bg = bgRef.current;
    const specs = specsRef.current;
    if (!canvas || !scene || !track || !bg) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const imgs = {};
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let ready = false, w = 0, h = 0, dpr = 1;
    let currentP = 0, targetP = 0, frame = 0;

    function sizeCanvas() {
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (!cw || !ch) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cw; h = ch;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }

    function draw(p) {
      if (!ready || !w) return;
      if (!imgs.vehicle || !imgs.door || !imgs.glow || !imgs.wheelFront || !imgs.wheelRear) return;
      const c = ctx;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = "high";

      const rs = Math.min(w * (w < 640 ? 0.94 : 0.76) / VCW, h * (w < 640 ? 0.76 : 0.62) / VCH);
      const rw = VCW * rs;
      const ox = (w - rw) / 2;
      const zoomTarget = w < 520 ? 1.62 : w < 900 ? 1.9 : V_ZOOM;
      // Keep the wheel bottoms on the piazza paving; on tall screens reserve room for the synchronized background zoom.
      const wheelBase = (V_FRONT.cy + V_FRONT.size / 2 + V_REAR.cy + V_REAR.size / 2) / 2;
      const maxFocusY = h * (1 - 0.5 / zoomTarget - 0.035);
      const groundY = Math.min(h * 0.86, maxFocusY + (wheelBase - V_FY) * rs);
      const oy = groundY - wheelBase * rs;
      const st = vcState(cl(p, 0, 1) * 7, zoomTarget);
      const lx = lp(w / 2, ox + V_FX * rs, st.zoom), ly = lp(h / 2, oy + V_FY * rs, st.zoom);

      // Apply the same camera matrix to the photo so pavement and van stay in one believable space.
      const bgScale = Math.max(w / BGW, h / BGH);
      const bgW = BGW * bgScale, bgH = BGH * bgScale;
      if (bg.style.width !== bgW + "px") bg.style.width = bgW + "px";
      if (bg.style.height !== bgH + "px") bg.style.height = bgH + "px";
      const bgLeft = (w - bgW) / 2, bgTop = (h - bgH) / 2;
      const bgX = w / 2 + st.cam * (bgLeft - lx), bgY = h / 2 + st.cam * (bgTop - ly);
      bg.style.transform = `translate3d(${bgX}px,${bgY}px,0) scale(${st.cam})`;

      // The spec panel clears the frame before the cabin close-up takes over.
      if (specs) {
        const o = 1 - sstep(0.5, 0.64, p);
        specs.style.opacity = o.toFixed(3);
        specs.style.transform = `translate3d(0,${(-18 * (1 - o)).toFixed(1)}px,0)`;
        specs.style.visibility = o < 0.02 ? "hidden" : "visible";
      }

      c.translate(w / 2, h / 2);
      c.scale(st.cam, st.cam);
      c.translate(-lx, -ly);

      const fy = oy + wheelBase * rs;
      // Soft contact shadow beneath the vehicle.
      {
        const sx = ox + (V_FRONT.cx * 0.5 + V_REAR.cx * 0.5 + st.carX) * rs, sy = fy - 2 * rs;
        c.save();
        c.translate(sx, sy);
        c.scale(1, 0.075);
        const shadow = c.createRadialGradient(0, 0, 0, 0, 0, rw * 0.5);
        shadow.addColorStop(0, "rgba(0,0,0,.50)");
        shadow.addColorStop(0.7, "rgba(0,0,0,.20)");
        shadow.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = shadow;
        c.beginPath(); c.arc(0, 0, rw * 0.5, 0, 7); c.fill();
        c.restore();
      }

      c.save();
      c.translate(ox, oy);
      c.scale(rs, rs);
      c.translate(st.carX, 0);
      if (Math.abs(st.pitch) > 1e-5) { c.translate(820, 660); c.rotate(st.pitch); c.translate(-820, -660); }
      if (st.glow > 0.005) {
        c.save(); c.globalAlpha = st.glow * 0.55; c.globalCompositeOperation = "multiply";
        c.drawImage(imgs.glow, 0, 0, VCW, VCH); c.restore();
      }
      c.drawImage(imgs.vehicle, 0, 0, VCW, VCH);
      if (Math.abs(st.wheel) > 0.002) {
        [[imgs.wheelFront, V_FRONT], [imgs.wheelRear, V_REAR]].forEach(([im, wheel]) => {
          c.save(); c.translate(wheel.cx, wheel.cy); c.rotate(st.wheel);
          c.drawImage(im, -wheel.size / 2, -wheel.size / 2, wheel.size, wheel.size); c.restore();
        });
      }
      // The sliding-door panel is its own layer; translate it along the rail to reveal the cabin.
      c.save(); c.translate(st.doorX, 0);
      if (st.doorPop > 0.01) {
        c.save();
        c.shadowColor = "rgba(0,0,0," + (0.24 * st.doorPop).toFixed(3) + ")";
        c.shadowBlur = 5.5 * st.doorPop * rs;
        c.shadowOffsetX = -3 * st.doorPop * rs;
        c.shadowOffsetY = 0;
        c.drawImage(imgs.door, 0, 0, VCW, VCH);
        c.restore();
      } else c.drawImage(imgs.door, 0, 0, VCW, VCH);
      // Retained lower-sill repair from the supplied door-gap-fixed source.
      {
        c.save();
        c.beginPath(); c.moveTo(776, 652); c.lineTo(1216, 652); c.lineTo(1219, 710); c.lineTo(773, 710); c.closePath(); c.clip();
        const lower = c.createLinearGradient(0, 652, 0, 711);
        lower.addColorStop(0, "rgba(22,24,26,.88)");
        lower.addColorStop(0.15, "rgba(31,33,35,.99)");
        lower.addColorStop(0.29, "rgba(17,18,20,.99)");
        lower.addColorStop(0.4, "rgba(8,9,10,.99)");
        lower.addColorStop(0.48, "rgba(39,41,43,.99)");
        lower.addColorStop(0.55, "rgba(21,22,24,.99)");
        lower.addColorStop(0.7, "rgba(37,39,41,.99)");
        lower.addColorStop(0.9, "rgba(22,23,25,.99)");
        lower.addColorStop(1, "rgba(9,10,11,.99)");
        c.fillStyle = lower; c.fillRect(770, 652, 452, 59);
        // Reuse the original body chrome strip so the extended door sill stays aligned.
        c.drawImage(imgs.vehicle, 700, 676, 60, 14, 772, 676, 447, 14);
        c.restore();
      }
      c.restore();
      c.restore();
    }

    function measure() {
      const travel = Math.max(track.offsetHeight - window.innerHeight, 1);
      return cl(-track.getBoundingClientRect().top / travel, 0, 1);
    }

    function renderFrame() {
      const delta = targetP - currentP;
      if (reduce.matches) currentP = targetP;
      else currentP = Math.abs(delta) < 0.001 ? targetP : currentP + delta * 0.16;
      draw(currentP);
      if (Math.abs(targetP - currentP) >= 0.001) frame = requestAnimationFrame(renderFrame);
      else frame = 0;
    }

    function onScroll() {
      targetP = measure();
      if (!frame) frame = requestAnimationFrame(renderFrame);
    }

    function resize() {
      sizeCanvas();
      targetP = measure();
      currentP = targetP;
      draw(currentP);
    }

    let cancelled = false;
    Promise.all([
      ...Object.entries(IMG_SRC).map(([key, src]) => new Promise((resolve) => {
        const im = new Image();
        im.onload = () => { imgs[key] = im; resolve(); };
        im.onerror = () => resolve();
        im.src = src;
      })),
      new Promise((resolve) => {
        if (bg.complete && bg.naturalWidth) return resolve();
        bg.onload = () => resolve();
        bg.onerror = () => resolve();
      }),
    ]).then(() => {
      if (cancelled) return;
      ready = true;
      resize();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(resize);
      ro.observe(scene);
      ro.observe(track);
    }

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <section className="vs" aria-label={spec.title}>
      <div className="vs-track" ref={trackRef}>
        <div className="vs-scene" ref={sceneRef}>
          <img className="vs-bg" ref={bgRef} src={BG_SRC} alt="" aria-hidden="true" />
          <canvas className="vs-canvas" ref={canvasRef} role="img" aria-label={spec.body} />
          <div className="vs-overlay">
            <div className="vs-copy" ref={specsRef}>
              <p className="vs-eyebrow">{spec.eyebrow}</p>
              <h2>{spec.title}</h2>
              <p className="vs-body">{spec.body}</p>
              <dl className="vs-specs">
                {spec.specs.map((item, index) => {
                  const Icon = SPEC_ICONS[index % SPEC_ICONS.length];
                  return (
                    <div key={item.label}>
                      <dt><Icon />{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  );
                })}
              </dl>
              <p className="vs-hint">{spec.hint}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
