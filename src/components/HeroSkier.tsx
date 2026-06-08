import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import skierAsset from "@/assets/skier.png";

const DURATION = 3.6;
const DELAY = 0.4;

// Path keyframes (left%, top%) — starts small in center-background, grows
// as he comes toward the viewer, ends large on the right.
// Skier travels forward-right toward the final resting frame (last entry).
// The final frame's position/scale is fixed — earlier frames are derived
// from it: smaller and offset up-left so motion reads as "coming toward
// the viewer and to the right".
const PATH = [
  { left: 71, top: 51, scale: 1.065 },
  { left: 73, top: 52, scale: 1.331 },
  { left: 75, top: 54, scale: 1.531 },
  { left: 77, top: 55, scale: 1.664 },
];

type Puff = { id: number; left: string; top: string };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Centripetal Catmull-Rom (alpha = 0.5) — smoother curvature through anchors,
// no overshoot, more natural pacing than uniform parameterization.
type Anchor = { left: number; top: number; scale: number };

const CR_ALPHA = 0.5;

function knotInterval(p0: Anchor, p1: Anchor) {
  const dx = p1.left - p0.left;
  const dy = p1.top - p0.top;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Guard against zero-length intervals; fall back to a tiny epsilon.
  return Math.pow(Math.max(dist, 1e-6), CR_ALPHA);
}

function centripetalCR1D(
  p0: number, p1: number, p2: number, p3: number,
  t0: number, t1: number, t2: number, t3: number,
  t: number,
) {
  const a1 = ((t1 - t) * p0 + (t - t0) * p1) / (t1 - t0);
  const a2 = ((t2 - t) * p1 + (t - t1) * p2) / (t2 - t1);
  const a3 = ((t3 - t) * p2 + (t - t2) * p3) / (t3 - t2);
  const b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0);
  const b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);
  return ((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1);
}

function centripetalCR(
  p0: Anchor, p1: Anchor, p2: Anchor, p3: Anchor,
  u: number, // 0..1 within the p1->p2 segment
): Anchor {
  const t0 = 0;
  const t1 = t0 + knotInterval(p0, p1);
  const t2 = t1 + knotInterval(p1, p2);
  const t3 = t2 + knotInterval(p2, p3);
  const t = t1 + u * (t2 - t1);
  return {
    left: centripetalCR1D(p0.left, p1.left, p2.left, p3.left, t0, t1, t2, t3, t),
    top: centripetalCR1D(p0.top, p1.top, p2.top, p3.top, t0, t1, t2, t3, t),
    scale: centripetalCR1D(p0.scale, p1.scale, p2.scale, p3.scale, t0, t1, t2, t3, t),
  };
}


// Densified path along a Catmull-Rom spline through PATH anchors.
const STEPS_PER_SEGMENT = 24;
const DENSE_PATH: Anchor[] = (() => {
  const out: Anchor[] = [];
  for (let i = 0; i < PATH.length - 1; i++) {
    const p0 = PATH[i - 1] ?? PATH[i];
    const p1 = PATH[i];
    const p2 = PATH[i + 1];
    const p3 = PATH[i + 2] ?? PATH[i + 1];
    const steps = i === PATH.length - 2 ? STEPS_PER_SEGMENT + 1 : STEPS_PER_SEGMENT;
    for (let s = 0; s < steps; s++) {
      out.push(centripetalCR(p0, p1, p2, p3, s / STEPS_PER_SEGMENT));
    }
  }
  return out;
})();

// Sample position along the dense path at progress t in [0..1]
function samplePath(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const idx = Math.min(
    Math.floor(clamped * (DENSE_PATH.length - 1)),
    DENSE_PATH.length - 2,
  );
  const local = clamped * (DENSE_PATH.length - 1) - idx;
  const a = DENSE_PATH[idx];
  const b = DENSE_PATH[idx + 1];
  return {
    left: lerp(a.left, b.left, local),
    top: lerp(a.top, b.top, local),
    scale: lerp(a.scale, b.scale, local),
  };
}


export function HeroSkier() {
  const reduceMotion = useReducedMotion();
  const [puffs, setPuffs] = useState<Puff[]>([]);

  const progress = useMotionValue(0);
  const opacity = useMotionValue(0);
  const left = useTransform(progress, (p) => `${samplePath(p).left}%`);
  const top = useTransform(progress, (p) => `${samplePath(p).top}%`);
  const scale = useTransform(progress, (p) => samplePath(p).scale);

  useEffect(() => {
    if (reduceMotion) return;
    const c1 = animate(progress, 1, {
      duration: DURATION,
      delay: DELAY,
      ease: [0.22, 1, 0.36, 1],
    });
    const c2 = animate(opacity, 1, { duration: 0.4, delay: DELAY });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [reduceMotion, progress, opacity]);

  useEffect(() => {
    if (reduceMotion) return;
    let nextId = 0;
    const startAt = performance.now() + DELAY * 1000;
    const endAt = startAt + DURATION * 1000;

    const interval = window.setInterval(() => {
      const now = performance.now();
      if (now < startAt || now > endAt) return;
      const t = (now - startAt) / (DURATION * 1000);
      const { left, top } = samplePath(t);
      const id = nextId++;
      const jx = (Math.random() - 0.5) * 3;
      const jy = (Math.random() - 0.5) * 2;
      setPuffs((prev) => [
        ...prev,
        { id, left: `${left + jx}%`, top: `${top + jy + 4}%` },
      ]);
      window.setTimeout(() => {
        setPuffs((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    }, 90);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const final = PATH[PATH.length - 1];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]" aria-hidden>
      <AnimatePresence>
        {puffs.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.75, scale: 0.4, y: 0 }}
            animate={{ opacity: 0, scale: 1.8, y: -16 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute h-6 w-6 rounded-full bg-white blur-md"
            style={{ left: p.left, top: p.top, transform: "translate(-50%, -50%)" }}
          />
        ))}
      </AnimatePresence>

      {reduceMotion ? (
        <div
          className="absolute"
          style={{
            left: `${final.left}%`,
            top: `${final.top}%`,
            transform: `translate(-50%, -50%) scale(${final.scale})`,
            width: "clamp(200px, 27.5vw, 400px)",
          }}
        >
          <img
            src={skierAsset}
            alt=""
            className="w-full h-auto drop-shadow-2xl"
            style={{ transform: "scaleX(-1)", filter: "saturate(0.85) brightness(0.92) hue-rotate(-6deg)" }}
          />
        </div>
      ) : (
        <motion.div
          className="absolute"
          style={{
            width: "clamp(200px, 27.5vw, 400px)",
            translateX: "-50%",
            translateY: "-50%",
            left,
            top,
            scale,
            opacity,
          }}
        >
          <img
            src={skierAsset}
            alt=""
            className="w-full h-auto drop-shadow-2xl"
            draggable={false}
            style={{ transform: "scaleX(-1)", filter: "saturate(0.85) brightness(0.92) hue-rotate(-6deg)" }}
          />
        </motion.div>
      )}
    </div>
  );
}
