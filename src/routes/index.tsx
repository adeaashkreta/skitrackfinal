import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Search, ArrowRight, Star, GraduationCap, Trophy, Users, Music, Sparkles, Waves, ChevronLeft, ChevronRight } from "lucide-react";
import { MountainPeak, Gondola, Snowflake, Medal } from "@/components/icons/SkiIcons";
import { Navbar } from "@/components/Navbar";
import { FeaturedResortRow } from "@/components/FeaturedResortRow";
import { ActivityCard } from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoResorts } from "@/lib/demoData";
import heroBg from "@/assets/hero-ski.avif";
import { HeroSkier } from "@/components/HeroSkier";
import { OfferPromoCards } from "@/components/OfferPromoCards";
import lessonsImg from "@/assets/activities/lessons.jpg";
import eventsImg from "@/assets/activities/events.jpg";
import familyImg from "@/assets/activities/family.jpg";
import apresImg from "@/assets/activities/apres.jpg";
import parkImg from "@/assets/activities/park.jpg";
import spaImg from "@/assets/activities/spa.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkiTrack — Book the world's best ski resorts" },
      { name: "description", content: "Discover, compare and book ski resorts across the Alps, Rockies and Japan." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [query, setQuery] = useState("");
  const featured = demoResorts.slice(0, 3);
  const stripRef = useRef<HTMLDivElement>(null);
  const resortsStripRef = useRef<HTMLDivElement>(null);

  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-activity-card]");
    const step = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const scrollResorts = (dir: 1 | -1) => {
    const el = resortsStripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-transparent" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" aria-hidden />

        <HeroSkier />

        <Navbar variant="hero" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Snowflake className="h-3.5 w-3.5" /> Season 2025 / 2026 open for booking
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
              Find your next <span className="text-sky-200">winter escape</span>.
            </h1>
            <p className="mt-4 text-lg text-sky-100 max-w-2xl">
              Browse top alpine resorts, compare prices and difficulty, and book your stay in minutes — all on SkiTrack.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/resorts">Browse Resorts <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); window.location.href = `/resorts?q=${encodeURIComponent(query)}`; }}
              className="mt-10 flex items-center gap-2 rounded-xl bg-white p-2 shadow-2xl max-w-xl"
            >
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resorts, locations…"
                className="border-0 shadow-none focus-visible:ring-0 text-foreground"
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>
        {/* Smooth transition gradient into proof section */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" aria-hidden />
      </section>

      <div className="relative">
        {/* Stripe-style page guide lines — start at hero fade, end at page bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 z-[5] flex justify-center px-6 lg:px-12"
          style={{
            top: 0,
            bottom: 0,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 80px)",
            maskImage: "linear-gradient(to bottom, transparent 0, black 80px)",
          }}
          aria-hidden
        >
          <div className="w-full max-w-7xl h-full border-l border-r border-border/60" />
        </div>

      {/* Social Proof — Stripe-style */}
      <section className="relative -mt-px">
        {/* Logo strip */}
        <div className="mx-auto max-w-7xl px-6 lg:px-12 pt-14 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-6 items-center justify-items-center opacity-70">
            {["Aspen", "Val Thorens", "Zermatt", "Niseko", "Whistler", "Chamonix"].map((name) => (
              <span
                key={name}
                className="text-lg md:text-xl font-semibold tracking-tight text-foreground/70 hover:text-foreground transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Stats band — flat, Stripe-style */}
        <div className="mx-auto max-w-7xl px-6 lg:px-12 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y divide-x divide-border/60 md:divide-y-0 border-y border-border/60">
            {[
              { Icon: MountainPeak, value: "120+", label: "Resorts worldwide" },
              { Icon: Gondola, value: "85k", label: "Skiers booked this season" },
              { Icon: Snowflake, value: "98%", label: "Rebook the next winter" },
              { Icon: Medal, value: "4.9 / 5", label: "Average resort rating" },
            ].map(({ Icon, value, label }, i) => (
              <div
                key={label}
                className={`flex flex-col items-start gap-4 py-10 ${i === 0 ? "md:pl-0 md:pr-8" : "md:px-8"} px-6 first:border-l-0 [&:nth-child(2)]:border-l-0 md:[&:nth-child(2)]:border-l`}
              >
                <Icon size={32} className="text-foreground/80" />
                <div>
                  <div className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">{value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Rating + quote — flat hairline row */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">4.9</span> from 12,400+ verified reviews
              </span>
            </div>
            <p className="text-sm italic text-muted-foreground md:text-right max-w-xl">
              "Booked Zermatt in three clicks — best ski trip we've ever taken." — <span className="not-italic font-medium text-foreground">Léa M.</span>
            </p>
          </div>
        </div>
      </section>

      {/* On-Mountain Activities — Stripe-style filmstrip */}
      <section className="pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10">
            <div className="max-w-xl">
              <h2 className="text-3xl tracking-tight">
                Everything the mountain
                <br />
                has to offer
              </h2>
              <Button
                asChild
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 font-semibold"
              >
                <Link to="/resorts">
                  Explore activities <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col items-start md:items-end gap-5 max-w-md">
              <p className="text-muted-foreground md:text-right">
                From first turns and family days to floodlit races and thermal baths. Every SkiTrack resort packs a full season of things to do.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollStrip(-1)}
                  className="h-10 w-10 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                  aria-label="Previous activities"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollStrip(1)}
                  className="h-10 w-10 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                  aria-label="Next activities"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filmstrip — clipped within page guides */}
          <div
            ref={stripRef}
            className="flex gap-5 overflow-x-auto snap-x snap-proximity scroll-pl-0 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
          {[
            {
              image: lessonsImg,
              title: "Ski & Snowboard Lessons",
              caption: "Private and group sessions for every level, from first turns to off-piste.",
              Icon: GraduationCap,
              tint: "bg-gradient-to-br from-indigo-900/40 via-transparent to-sky-900/30",
            },
            {
              image: eventsImg,
              title: "Events & Races",
              caption: "Slalom nights, freestyle comps and torchlight descents all season long.",
              Icon: Trophy,
              tint: "bg-gradient-to-br from-red-900/40 via-transparent to-rose-900/30",
            },
            {
              image: familyImg,
              title: "Family Fun",
              caption: "Magic carpets, kids' clubs and gentle blue runs the whole family will love.",
              Icon: Users,
              tint: "bg-gradient-to-br from-amber-800/40 via-transparent to-orange-900/30",
            },
            {
              image: apresImg,
              title: "Après-Ski",
              caption: "Mountain-top DJ decks, fondue huts and slope-side cocktail bars.",
              Icon: Music,
              tint: "bg-gradient-to-br from-fuchsia-900/40 via-transparent to-purple-900/30",
            },
            {
              image: parkImg,
              title: "Snow Parks",
              caption: "Kickers, rails and halfpipes shaped daily for every progression level.",
              Icon: Sparkles,
              tint: "bg-gradient-to-br from-sky-700/40 via-transparent to-cyan-900/30",
            },
            {
              image: spaImg,
              title: "Spa & Wellness",
              caption: "Thermal baths, saunas and massages to recover between powder days.",
              Icon: Waves,
              tint: "bg-gradient-to-br from-teal-800/40 via-transparent to-slate-900/30",
            },
          ].map((a) => (
            <div key={a.title} data-activity-card className="flex flex-col gap-4 shrink-0 snap-start">
              <ActivityCard image={a.image} title={a.title} Icon={a.Icon} tint={a.tint} />
              <div className="w-[260px] md:w-[300px] lg:w-[320px]">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {a.caption}
                </p>
                <a
                  href="#"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>




      {/* Featured Resorts */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 pb-20">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div className="max-w-xl">
            <h2 className="text-3xl tracking-tight">Featured Resorts</h2>
            <p className="text-muted-foreground mt-2">
              Three flagship destinations hand-picked for unforgettable winters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollResorts(-1)}
                className="h-10 w-10 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                aria-label="Previous resort"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollResorts(1)}
                className="h-10 w-10 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                aria-label="Next resort"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Button variant="outline" asChild><Link to="/resorts">View all resorts</Link></Button>
          </div>
        </div>
        <div
          ref={resortsStripRef}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featured.map((r, i) => (
            <div key={r._id} className="w-full shrink-0 snap-start">
              <FeaturedResortRow resort={r} index={i} reversed={i % 2 === 1} />
            </div>
          ))}
        </div>
      </section>




      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 pb-24">
        <div className="flex items-center justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl tracking-tight">What our users say</h2>
            <p className="text-muted-foreground mt-2">
              Real stories from skiers who booked their winter with SkiTrack.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <a href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer">
              See all reviews <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              quote: "Booked Zermatt in three clicks — best ski trip we've ever taken.",
              name: "Léa M.",
              detail: "Skied Zermatt",
            },
            {
              quote: "The family package at St. Moritz was perfect. Kids loved the ski school.",
              name: "Tom R.",
              detail: "Skied St. Moritz",
            },
            {
              quote: "Val d'Isère's off-piste guides were incredible. Already rebooking for next year.",
              name: "Nina K.",
              detail: "Skied Val d'Isère",
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:shadow-md"
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-base md:text-lg leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-4 border-t border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.detail}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-6">
          <OfferPromoCards />
        </div>
      </section>



      </div>
    </div>
  );
}
