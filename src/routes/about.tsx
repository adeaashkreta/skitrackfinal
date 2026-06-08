import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  Mountain as MountainIcon,
  Users,
  CalendarCheck,
  Building2,
  LifeBuoy,
  Sparkles,
  ArrowRight,
  Globe2,
  Snowflake,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/weather-hero.jpg";
import avatarElise from "@/assets/elise.jpg";
import avatarMarcus from "@/assets/marcus.jpeg";
import avatarYuki from "@/assets/yuki.webp";
import avatarLukas from "@/assets/lukas.webp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SkiTrack" },
      {
        name: "description",
        content:
          "SkiTrack helps skiers discover, book and track adventures at the world's best resorts. List your resort or get booking support.",
      },
      { property: "og:title", content: "About — SkiTrack" },
      {
        property: "og:description",
        content:
          "Built by skiers, for skiers. Partner with SkiTrack or get help with an existing reservation.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  {
    value: "120+",
    label: "Listed resorts",
    sub: "Alps, Rockies, Hokkaido and beyond.",
    Icon: MountainIcon,
  },
  {
    value: "48k",
    label: "Riders hosted",
    sub: "Skiers and boarders planning with us.",
    Icon: Users,
  },
  {
    value: "27k",
    label: "Bookings completed",
    sub: "Stays, lessons and lift packages booked.",
    Icon: CalendarCheck,
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="hero" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background/70" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background pointer-events-none"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 pt-32 md:pt-40 pb-40 md:pb-48">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md text-white px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                <Sparkles className="h-3.5 w-3.5" />
                About SkiTrack
              </span>
              <h1 className="mt-5 text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                Built by skiers,
                <br />
                for skiers.
              </h1>
              <p className="mt-4 text-lg md:text-xl text-white/85 max-w-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
                We bring together the best resorts, live mountain conditions, and effortless
                booking so you can spend less time planning and more time on the slopes.
              </p>
            </div>

            {/* Stat widgets */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ value, label, sub, Icon }, i) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 shadow-xl shadow-black/30",
                    i === 0 && "col-span-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                      {label}
                    </p>
                    <span className="h-9 w-9 rounded-full bg-white/15 ring-1 ring-white/20 text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-white tabular-nums leading-none">
                    {value}
                  </p>
                  <p className="mt-2 text-xs text-white/60 truncate">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* Body with Stripe-style page guide lines */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 z-[5] flex justify-center px-6 lg:px-12"
          style={{
            top: 0,
            bottom: 0,
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, transparent 240px, black 320px)",
            maskImage:
              "linear-gradient(to bottom, transparent 0, transparent 240px, black 320px)",
          }}
          aria-hidden
        >
          <div className="w-full max-w-7xl h-full border-l border-r border-border/60" />
        </div>

        <main className="relative mx-auto max-w-7xl px-6 lg:px-12 -mt-32 md:-mt-40 pb-16 space-y-16">
          {/* Contact section */}

          <section>

            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              {/* List your resort */}
              <div className="h-full rounded-2xl border border-border bg-card p-8 flex flex-col">
                <div className="flex items-center gap-4">
                  <span className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      For operators
                    </p>
                    <h3 className="text-xl font-bold text-foreground leading-tight">
                      List your resort or services
                    </h3>
                  </div>
                </div>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Add your resort, lessons, rentals or après spots to SkiTrack and reach
                  thousands of skiers planning their next trip. We handle discovery, live
                  conditions, and reservations end-to-end.
                </p>
                <div className="mt-auto pt-7 flex flex-col gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-fit"
                  >
                    <a href="mailto:partners@skitrack.app">
                      Become a partner <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Partnerships team replies within 2 business days.
                  </p>
                </div>
              </div>

              {/* Booking support */}
              <div className="h-full rounded-2xl border border-border bg-card p-8 flex flex-col">
                <div className="flex items-center gap-4">
                  <span className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <LifeBuoy className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      For travellers
                    </p>
                    <h3 className="text-xl font-bold text-foreground leading-tight">
                      Booking &amp; reservation support
                    </h3>
                  </div>
                </div>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Need to change dates, add guests, or sort out a payment on an existing
                  booking? Our concierge team is here to make it painless.
                </p>
                <div className="mt-auto pt-7 flex flex-col gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-fit"
                  >
                    <a href="mailto:support@skitrack.app">
                      Contact support <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Live chat in your dashboard · 7 days a week.
                  </p>
                </div>
              </div>
            </div>

          </section>

          {/* Partnership */}
          <section id="partnership">
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-end mb-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                Partner with SkiTrack
              </h2>
              <p className="text-muted-foreground md:text-right leading-relaxed">
                Everything you need to turn your resort, school or rental shop into a booking magnet
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1 — Global resort exposure */}
              <div className="flex flex-col">
                <div className="rounded-3xl bg-primary/10 p-7 min-h-[360px] flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-primary/80 mb-3">
                    <Globe2 className="h-4 w-4" />
                    Distribution
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground leading-tight">
                    Global resort exposure
                  </h3>

                  <div className="mt-auto rounded-2xl bg-card border border-border p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-extrabold">
                        AV
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          Alpe d'Vista Resort
                        </p>
                        <p className="text-xs text-muted-foreground">
                          France · Featured listing
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { l: "Views", v: "12.4k" },
                        { l: "Saves", v: "1.8k" },
                        { l: "Books", v: "342" },
                      ].map((s) => (
                        <div
                          key={s.l}
                          className="rounded-lg bg-background border border-border px-2 py-1.5 text-center"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {s.l}
                          </p>
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            {s.v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Reach 48k+ active skiers planning trips on SkiTrack every month.
                </p>
              </div>

              {/* Card 2 — End-to-end bookings (highlighted) */}
              <div className="flex flex-col">
                <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-7 min-h-[360px] flex flex-col text-primary-foreground shadow-xl shadow-primary/20">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/80 mb-3">
                    <CalendarCheck className="h-4 w-4" />
                    Reservations
                  </div>
                  <h3 className="text-2xl font-extrabold leading-tight">
                    End-to-end bookings
                  </h3>

                  <div className="mt-auto rounded-2xl bg-card border border-border p-4 text-foreground shadow-sm">
                    <p className="text-sm font-semibold mb-3">
                      New booking
                    </p>
                    <div className="space-y-2 text-sm">
                      {[
                        { l: "Guests", v: "4" },
                        { l: "Dates", v: "Feb 12 – 17" },
                        { l: "Payout", v: "€1,840" },
                      ].map((r) => (
                        <div
                          key={r.l}
                          className="flex items-center justify-between"
                        >
                          <span className="text-muted-foreground">{r.l}</span>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums">
                            {r.v}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-full bg-primary text-primary-foreground text-sm font-semibold py-2"
                    >
                      Confirm booking
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Calendars, payments and guest comms handled — you focus on the slopes.
                </p>
              </div>

              {/* Card 3 — Live conditions */}
              <div className="flex flex-col">
                <div className="rounded-3xl bg-accent/40 p-7 min-h-[360px] flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-primary/80 mb-3">
                    <Snowflake className="h-4 w-4" />
                    Insights
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground leading-tight">
                    Live conditions &amp; insights
                  </h3>

                  <div className="mt-auto rounded-2xl bg-card border border-border p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-foreground">
                        Snow report
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Today
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        { l: "Base", v: "182 cm" },
                        { l: "Temp", v: "-4°C" },
                        { l: "Lifts", v: "18/20" },
                      ].map((c) => (
                        <span
                          key={c.l}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                          <span className="text-muted-foreground mr-1">
                            {c.l}
                          </span>
                          <span className="tabular-nums font-semibold">
                            {c.v}
                          </span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-end gap-1.5 h-10">
                      {[35, 55, 40, 70, 90, 60, 80].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Real-time snow, weather and lift data piped straight into your listing.
                </p>
              </div>
            </div>
          </section>

          <div className="h-px bg-border" />

          {/* Resort testimonials */}
          <ResortTestimonials />
        </main>
      </div>
    </div>
  );
}

type ResortMark = (props: { className?: string }) => React.ReactElement;

const TriangleMark: ResortMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 4 L21 20 L3 20 Z" />
    <path d="M9 14 L12 9 L15 14" />
  </svg>
);
const PeaksMark: ResortMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M2 20 L8 8 L12 14 L16 6 L22 20 Z" />
  </svg>
);
const SunMark: ResortMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    <g strokeLinecap="round">
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2" />
    </g>
  </svg>
);
const DiamondMark: ResortMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 3 L21 12 L12 21 L3 12 Z" />
    <path d="M12 7 L16 12 L12 17 L8 12 Z" fill="currentColor" stroke="none" />
  </svg>
);

const resorts = [
  {
    name: "Chamonix",
    Mark: TriangleMark,
    wordmarkClass: "font-serif text-2xl tracking-tight",
  },
  {
    name: "Whistler Blackcomb",
    Mark: PeaksMark,
    wordmarkClass: "uppercase tracking-[0.22em] text-sm font-bold",
  },
  {
    name: "niseko united",
    Mark: SunMark,
    wordmarkClass: "lowercase font-semibold tracking-wide text-xl",
  },
  {
    name: "Zermatt",
    Mark: DiamondMark,
    wordmarkClass: "italic font-semibold tracking-[0.18em] text-lg uppercase",
  },
];

const testimonials = [
  {
    resortIndex: 0,
    avatar: avatarElise,
    quote:
      "SkiTrack brought us bookings from skiers we'd never have reached on our own, and the live conditions feed has become a real reason guests come back. The team feels like an extension of ours.",
    name: "Élise Laurent",
    role: "Head of Guest Experience, Chamonix Mont-Blanc",
  },
  {
    resortIndex: 1,
    avatar: avatarMarcus,
    quote:
      "Onboarding took an afternoon — calendar, inventory and payouts all wired up before the first chair. Within a season SkiTrack became one of our top three booking channels.",
    name: "Marcus Reid",
    role: "Director of Digital, Whistler Blackcomb",
  },
  {
    resortIndex: 2,
    avatar: avatarYuki,
    quote:
      "Our lessons, rentals and lift packages finally live in one place. No-shows dropped, and our front desk spends time on hospitality instead of reconciliation.",
    name: "Yuki Tanaka",
    role: "Operations Lead, Niseko United",
  },
  {
    resortIndex: 3,
    avatar: avatarLukas,
    quote:
      "Guests find us, book lessons and check snow without ever leaving SkiTrack. It's quietly become the channel we recommend to every hotelier in the valley.",
    name: "Lukas Brunner",
    role: "Director of Partnerships, Zermatt Bergbahnen",
  },
];

function ResortTestimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, [active]);

  const t = testimonials[active];

  return (
    <section className="pt-8 pb-4">
      <div key={active} className="flex flex-col items-center text-center max-w-3xl mx-auto pb-12 md:pb-16 animate-in fade-in duration-500">
        <div className="flex items-center gap-1.5 mb-8 text-amber-400">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-6 w-6 fill-current" />
          ))}
        </div>
        <img
          src={t.avatar}
          alt={t.name}
          className="h-24 w-24 rounded-full object-cover mb-12"
        />
        <p
          style={{
            fontSize: "1.625rem",
            fontWeight: 300,
            lineHeight: 1.12,
            letterSpacing: "-0.01rem",
            color: "#64748d",
            maxWidth: "54ch",
            paddingInline: "16px",
            textWrap: "pretty",
          }}
        >
          “{t.quote}”
        </p>
        <p className="mt-12 text-lg text-muted-foreground">
          <span className="font-semibold text-foreground">{t.name},</span> {t.role}
        </p>
        <a
          href="#"
          className="mt-8 inline-flex items-center gap-1.5 text-lg font-medium text-primary hover:underline"
        >
          Read the story <span aria-hidden className="text-xl leading-none">›</span>
        </a>

      </div>

      <div className="relative">
        <div className="h-px bg-border" />
        <div
          key={`bar-${active}`}
          className="absolute top-0 left-0 h-px bg-primary"
          style={{
            width: `${100 / testimonials.length}%`,
            transform: `translateX(${active * 100}%)`,
            animation: "testimonialProgress 6s linear",
          }}
        />
        <style>{`@keyframes testimonialProgress { from { opacity: 1 } to { opacity: 1 } }`}</style>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-14 md:py-16">
        {resorts.map((r, i) => {
          const isActive = i < testimonials.length && i === t.resortIndex;
          const clickable = i < testimonials.length;
          const Mark = r.Mark;
          return (
            <button
              key={r.name}
              type="button"
              onClick={() => clickable && setActive(i)}
              className={cn(
                "flex items-center justify-center gap-3.5 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground",
                !clickable && "cursor-default"
              )}
            >
              <Mark className="h-7 w-7 shrink-0" />
              <span className={r.wordmarkClass}>{r.name}</span>
            </button>
          );
        })}
      </div>

    </section>
  );
}
