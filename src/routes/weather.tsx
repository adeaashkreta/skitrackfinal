import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Thermometer,
  Wind,
  Snowflake,
  CloudSnow,
  Sun,
  Eye,
  Mountain as MountainIcon,
  Sunrise,
  Sunset,
  Gauge,
  Sparkles,
  Search,
  MapPin,
  CloudRain,
  Cloud,
  CloudOff,
  TriangleAlert,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ActivityCard } from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { demoResorts } from "@/lib/demoData";
import { getResortConditions, type ResortConditions } from "@/lib/weather.functions";
import heroBg from "@/assets/weather-hero.jpg";
import freshSnowImg from "@/assets/skiscore/fresh-snow.jpg";
import bluebirdImg from "@/assets/skiscore/bluebird.jpg";
import groomedImg from "@/assets/skiscore/groomed.jpg";
import rainImg from "@/assets/skiscore/rain.jpg";
import snowDroughtImg from "@/assets/skiscore/snow-drought.jpg";
import heavyCloudsImg from "@/assets/skiscore/heavy-clouds.jpg";
import avalancheImg from "@/assets/skiscore/avalanche-risk.jpg";


export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Trip Conditions — SkiTrack" },
      { name: "description", content: "Check slopes, lifts, snow and weather for any resort on any date." },
      { property: "og:title", content: "Trip Conditions — SkiTrack" },
      { property: "og:description", content: "Plan your ski trip with live conditions, open slopes, lifts and snowfall." },
    ],
  }),
  component: WeatherPage,
});

const TODAY = new Date();
const MAX_DATE = addDays(TODAY, 14);

function WeatherPage() {
  const [resortId, setResortId] = useState<string>("");
  const [resortQuery, setResortQuery] = useState<string>("");
  const [resortOpen, setResortOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(TODAY);
  const [submitted, setSubmitted] = useState<{ id: string; date: string } | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const resort = demoResorts.find((r) => r._id === submitted?.id);

  const filtered = useMemo(() => {
    const q = resortQuery.trim().toLowerCase();
    if (!q) return demoResorts;
    return demoResorts.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        (r.country ?? "").toLowerCase().includes(q)
    );
  }, [resortQuery]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) setResortOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selectResort = (id: string) => {
    const r = demoResorts.find((x) => x._id === id);
    if (!r) return;
    setResortId(id);
    setResortQuery(`${r.name} — ${r.location}`);
    setResortOpen(false);
  };

  const query = useQuery({
    queryKey: ["weather", submitted?.id, submitted?.date],
    queryFn: () => {
      if (!resort?.coordinates || !submitted) throw new Error("Missing input");
      return getResortConditions({
        data: {
          lat: resort.coordinates.lat,
          lon: resort.coordinates.lon,
          date: submitted.date,
          resortId: resort._id,
        },
      });
    },
    enabled: !!submitted && !!resort?.coordinates,
    staleTime: 1000 * 60 * 10,
  });

  const handleSubmit = () => {
    if (!resortId || !date) return;
    setSubmitted({ id: resortId, date: format(date, "yyyy-MM-dd") });
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="hero" />

      {/* Hero search */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background/70" aria-hidden />
        {/* Fade-out into next section */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background pointer-events-none" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 pt-32 md:pt-40 pb-56 md:pb-72">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md text-white px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <Sparkles className="h-3.5 w-3.5" />
            Trip planner
          </span>
          <h1 className="mt-5 text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] max-w-4xl">
            Will it be a good ski day?
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
            Search your resort and pick a date — we'll show open slopes, running lifts,
            snow and weather so you know exactly what to expect on the mountain.
          </p>

          <div className="relative z-30 mt-10 grid gap-0 md:grid-cols-[1fr_1fr_auto] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-2 shadow-2xl shadow-black/40">
            {/* Resort search */}
            <div ref={searchWrapRef} className="relative md:border-r md:border-white/15">

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                <Input
                  value={resortQuery}
                  onChange={(e) => {
                    setResortQuery(e.target.value);
                    setResortId("");
                    setResortOpen(true);
                  }}
                  onFocus={() => setResortOpen(true)}
                  placeholder="Search resorts"
                  className="h-14 pl-12 text-base bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                />
              </div>
              {resortOpen && filtered.length > 0 && (
                <div className="absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-xl border border-border bg-popover shadow-xl animate-fade-in">
                  {filtered.map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => selectResort(r._id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors",
                        resortId === r._id && "bg-accent"
                      )}
                    >
                      <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.location}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {resortOpen && filtered.length === 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover shadow-xl p-4 text-sm text-muted-foreground">
                  No resorts match "{resortQuery}".
                </div>
              )}
            </div>


            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-14 justify-start text-base font-normal rounded-none bg-transparent text-white hover:bg-white/10 hover:text-white",
                    !date && "text-white/60"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-white/80" />
                  {date ? format(date, "EEE, MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(TODAY.toDateString()) || d > MAX_DATE}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-white text-slate-900 hover:bg-white/90 shadow-lg shadow-black/20 disabled:bg-white/40 disabled:text-slate-900/60"
              onClick={handleSubmit}
              disabled={!resortId || !date}
            >
              <Search className="mr-2 h-5 w-5" />
              Check conditions
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="relative">
        {/* Stripe-style page guide lines — start at hero fade, end at page bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 z-[5] flex justify-center px-6 lg:px-12"
          style={{
            top: 0,
            bottom: 0,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, transparent 240px, black 320px)",
            maskImage: "linear-gradient(to bottom, transparent 0, transparent 240px, black 320px)",
          }}
          aria-hidden
        >
          <div className="w-full max-w-7xl h-full border-l border-r border-border/60" />
        </div>

        <main className="relative mx-auto max-w-7xl px-6 lg:px-12 -mt-32 md:-mt-40 pb-16">
          {!submitted && <EmptyState />}

          {submitted && query.isLoading && <LoadingGrid />}

          {submitted && query.isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="text-destructive font-semibold">
                We couldn't fetch conditions for that day.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {(query.error as Error)?.message ?? "Please try again."}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => query.refetch()}>
                Retry
              </Button>
            </div>
          )}

          {submitted && query.data && resort && (
            <ConditionsDashboard resortName={resort.name} location={resort.location} c={query.data} />
          )}
        </main>
      </div>

    </div>
  );
}

function EmptyState() {
  const stripRef = useRef<HTMLDivElement>(null);

  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-skiscore-card]");
    const step = card ? card.offsetWidth + 20 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const factors = [
    {
      image: bluebirdImg,
      title: "Bluebird Sky",
      caption: "Clear skies and high visibility — the days where every turn looks postcard-perfect.",
      Icon: Sun,
      tint: "bg-gradient-to-br from-amber-700/40 via-transparent to-orange-900/30",
      direction: "up" as const,
      magnitude: 5,
      label: "Boosts score · Exponential",
    },
    {
      image: snowDroughtImg,
      title: "Snow Drought",
      caption: "No fresh snowfall in the past 7 days — surfaces get tired, icy, and thin.",
      Icon: CloudOff,
      tint: "bg-gradient-to-br from-stone-700/40 via-transparent to-slate-900/30",
      direction: "down" as const,
      magnitude: 3,
      label: "Drops score · Strong",
    },
    {
      image: groomedImg,
      title: "Groomed Pistes",
      caption: "How much of the mountain was freshly groomed overnight for fast, predictable carving.",
      Icon: Sparkles,
      tint: "bg-gradient-to-br from-slate-700/40 via-transparent to-cyan-900/30",
      direction: "up" as const,
      magnitude: 2,
      label: "Boosts score · Steady",
    },
    {
      image: heavyCloudsImg,
      title: "Heavy Cloud Cover",
      caption: "Flat light and low visibility that flattens terrain and steals depth perception.",
      Icon: Cloud,
      tint: "bg-gradient-to-br from-slate-700/40 via-transparent to-zinc-900/30",
      direction: "down" as const,
      magnitude: 2,
      label: "Drops score · Steady",
    },
    {
      image: freshSnowImg,
      title: "Fresh Snow",
      caption: "Recent snowfall over the last 24–72h, with deeper boosts for true powder days.",
      Icon: Snowflake,
      tint: "bg-gradient-to-br from-sky-900/40 via-transparent to-indigo-900/30",
      direction: "up" as const,
      magnitude: 3,
      label: "Boosts score · Strong",
    },
    {
      image: avalancheImg,
      title: "Avalanche Risk",
      caption: "Elevated backcountry hazard ratings — we cut the score hard for safety.",
      Icon: TriangleAlert,
      tint: "bg-gradient-to-br from-red-900/40 via-transparent to-orange-950/30",
      direction: "down" as const,
      magnitude: 5,
      label: "Drops score · Exponential",
    },
    {
      image: rainImg,
      title: "Recent Rain",
      caption: "Rain or thaw events that crust the snow — we dock the score so you're never caught out.",
      Icon: CloudRain,
      tint: "bg-gradient-to-br from-teal-800/40 via-transparent to-slate-900/30",
      direction: "down" as const,
      magnitude: 5,
      label: "Drops score · Exponential",
    },
  ];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {demoResorts.slice(0, 6).map((r) => (
          <div
            key={r._id}
            className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              className="aspect-[16/9] bg-cover bg-center"
              style={{ backgroundImage: `url(${r.image})` }}
            />
            <div className="p-5">
              <h3 className="font-bold text-card-foreground">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ski Score — mirrored variant of home's mountain activities section */}
      <section id="ski-score" className="pt-24 pb-12">
        {/* Header row — paragraph left, headline right */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10">
          <div className="max-w-xl order-2">
            <h2 className="text-3xl tracking-tight">
              How we calculate your
              <br />
              ski score
            </h2>
            <Button
              asChild
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 font-semibold"
            >
              <a href="#ski-score">
                How we score <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="flex flex-col items-start md:items-end gap-5 max-w-md order-1 md:order-2">
            <p className="text-muted-foreground md:text-right">
              Every ski score blends the day's mountain signals into one honest read of how good it'll actually be up there.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                className="h-10 w-10 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                aria-label="Previous factor"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                className="h-10 w-10 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                aria-label="Next factor"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filmstrip */}
        <div
          ref={stripRef}
          className="flex gap-5 overflow-x-auto snap-x snap-proximity scroll-pl-0 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {factors.map((f) => (
            <div key={f.title} data-skiscore-card className="flex flex-col gap-4 shrink-0 snap-start">
              <ActivityCard image={f.image} title={f.title} tint={f.tint} />
              <div className="w-[260px] md:w-[300px] lg:w-[320px]">
                <p className="text-sm text-foreground/80 leading-relaxed">{f.caption}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase ${
                      f.direction === "up" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {f.direction === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {f.label}
                  </div>
                  <div
                    className={`flex items-end gap-0.5 ${
                      f.direction === "down" ? "flex-row-reverse" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {[0, 1, 2, 3, 4].map((i) => {
                      const filled = i < f.magnitude;
                      const heights = ["h-1.5", "h-2", "h-2.5", "h-3", "h-3.5"];
                      const h = heights[i];
                      const base = f.direction === "up" ? "bg-primary" : "bg-destructive";
                      const dim = f.direction === "up" ? "bg-primary/15" : "bg-destructive/15";
                      return (
                        <span
                          key={i}
                          className={`w-1.5 rounded-sm ${h} ${filled ? base : dim}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl" />
      ))}
    </div>
  );
}

function ConditionsDashboard({
  resortName,
  location,
  c,
}: {
  resortName: string;
  location: string;
  c: ResortConditions;
}) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            {format(new Date(c.date), "EEEE, MMMM d, yyyy")}
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            {resortName}
          </h2>
          <p className="text-muted-foreground">{location}</p>
        </div>
        <div className="flex items-center gap-6">
          {c.bluebird && <Badge icon={<Sun className="h-4 w-4" />} label="Bluebird" tone="warning" />}
          {c.powderDay && <Badge icon={<Snowflake className="h-4 w-4" />} label="Powder" tone="info" />}
          <div className="text-right">
            <p className="text-3xl md:text-4xl font-extrabold text-foreground leading-none">
              {c.tempCurrent}°C
            </p>
            <SkiScoreInline c={c} />
          </div>
        </div>

      </div>


      {/* Stat grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <RingTile
          label="Open slopes"
          value={`${c.openSlopesPct}%`}
          pct={c.openSlopesPct}
          icon={<MountainIcon className="h-5 w-5" />}
        />
        <RingTile
          label="Lifts running"
          value={`${c.liftsRunning} / ${c.liftsTotal}`}
          pct={Math.round((c.liftsRunning / c.liftsTotal) * 100)}
          icon={<Gauge className="h-5 w-5" />}
        />
        <StatTile
          label="Fresh snow (24h)"
          value={`${c.snow24h} cm`}
          sub={`Base ~${c.snowSeason} cm`}
          icon={<Snowflake className="h-5 w-5" />}
        />
        <StatTile
          label="Wind"
          value={`${c.windMax} km/h`}
          sub={`Avg ${c.windAvg} km/h`}
          icon={<Wind className="h-5 w-5" />}
        />

        <StatTile
          label="Temperature"
          value={`${c.tempMax}° / ${c.tempMin}°`}
          sub={`Feels like ${c.feelsLike}°`}
          icon={<Thermometer className="h-5 w-5" />}
        />
        <StatTile
          label="Cloud cover"
          value={`${c.cloudCover}%`}
          sub={c.cloudCover < 25 ? "Clear" : c.cloudCover > 75 ? "Overcast" : "Mixed"}
          icon={<CloudSnow className="h-5 w-5" />}
        />
        <StatTile
          label="Visibility"
          value={c.visibilityKm > 0 ? `${c.visibilityKm} km` : "—"}
          sub={c.visibilityKm > 5 ? "Excellent" : c.visibilityKm > 2 ? "Fair" : "Poor"}
          icon={<Eye className="h-5 w-5" />}
        />
        <StatTile
          label="Freezing level"
          value={`${c.freezingLevel} m`}
          sub={`UV index ${c.uvIndex}`}
          icon={<Sun className="h-5 w-5" />}
        />
      </div>

      {/* Hourly strip */}
      {c.hourly.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Through the day
          </h3>
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
            {c.hourly.map((h) => (
              <div
                key={h.time}
                className="rounded-xl bg-secondary/40 p-3 text-center"
              >
                <p className="text-xs text-muted-foreground font-medium">{h.time}</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {Math.round(h.temp)}°
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Snowflake className="h-3 w-3" />
                  {h.snow.toFixed(1)} cm
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <Wind className="h-3 w-3" />
                  {Math.round(h.wind)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sun row */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sunrise className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              First chair light
            </p>
            <p className="text-2xl font-bold text-foreground">{c.sunrise || "—"}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent-foreground">
            <Sunset className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Last run
            </p>
            <p className="text-2xl font-bold text-foreground">{c.sunset || "—"}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Weather data from Open-Meteo. Open slopes, lifts and grooming are
        modelled estimates based on forecast conditions.
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide font-semibold">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function RingTile({
  label,
  value,
  pct,
  icon,
}: {
  label: string;
  value: string;
  pct: number;
  icon: React.ReactNode;
}) {
  const size = 64;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          {label}
        </p>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
      </div>
      <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--primary)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>

    </div>
  );
}

type ScoreReason = { label: string; delta: number; note?: string };

function computeSkiScore(c: ResortConditions) {
  const month = new Date(c.date).getUTCMonth(); // 0-11
  // Northern-hemisphere off-season: May (4) – October (9)
  const offSeason = month >= 4 && month <= 9;
  const monthName = new Date(c.date).toLocaleString("en-US", { month: "long", timeZone: "UTC" });

  const reasons: ScoreReason[] = [];
  let score = 0;

  const base = Math.min(70, c.snowSeason / 2);
  if (base > 0) {
    score += base;
    reasons.push({ label: `Season base ${c.snowSeason} cm`, delta: Math.round(base) });
  }

  const fresh = Math.min(20, c.snow24h * 1.5);
  if (fresh > 0) {
    score += fresh;
    reasons.push({ label: `Fresh snow ${c.snow24h} cm / 24h`, delta: Math.round(fresh) });
  }

  if (c.bluebird) { score += 6; reasons.push({ label: "Bluebird sky", delta: 6 }); }
  if (c.powderDay) { score += 12; reasons.push({ label: "Powder day", delta: 12 }); }
  if (c.groomed) { score += 4; reasons.push({ label: "Freshly groomed", delta: 4 }); }

  const warm = Math.max(0, c.tempMax - 3) * 3;
  if (warm > 0) {
    score -= warm;
    reasons.push({ label: `Warm peak ${c.tempMax}°C`, delta: -Math.round(warm) });
  }

  const overcast = Math.max(0, c.cloudCover - 75) / 5;
  if (overcast > 0) {
    score -= overcast;
    reasons.push({ label: `Heavy cloud cover ${c.cloudCover}%`, delta: -Math.round(overcast) });
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  if (offSeason) {
    const capped = Math.min(score, 12);
    if (capped < score) {
      reasons.push({ label: `Off-season (${monthName})`, delta: capped - score, note: "capped at 12" });
    } else {
      reasons.push({ label: `Off-season (${monthName})`, delta: 0, note: "resort not ski-ready" });
    }
    score = capped;
  }

  return { score, offSeason, reasons };
}

function SkiScoreInline({ c }: { c: ResortConditions }) {
  const { score, offSeason, reasons } = computeSkiScore(c);

  const toneLabel = offSeason
    ? "Not ski-ready"
    : score >= 70
    ? "Excellent"
    : score >= 40
    ? "Mixed"
    : "Poor";

  const dotColor =
    offSeason || score < 40
      ? "bg-rose-500"
      : score < 70
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1.5 text-sm cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
            <span className="text-muted-foreground">Ski score</span>
            <span className="font-bold text-foreground tabular-nums">{score}</span>
            <span className="text-muted-foreground">· {toneLabel}</span>
          </button>
        </TooltipTrigger>

        <TooltipContent side="bottom" align="end" className="w-72 p-0 bg-popover text-popover-foreground border border-border shadow-xl">
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
              How we scored it
            </p>
            <p className="mt-1 text-sm text-foreground">
              {offSeason
                ? "It's off-season — base depth and recent snow aren't enough for skiing right now."
                : "Each signal nudges the score up or down."}
            </p>
            <ul className="mt-3 space-y-1.5">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground/90">
                    {r.label}
                    {r.note && <span className="text-muted-foreground"> · {r.note}</span>}
                  </span>
                  <span
                    className={cn(
                      "font-bold tabular-nums",
                      r.delta > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : r.delta < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {r.delta > 0 ? `+${r.delta}` : r.delta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


function Badge({

  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "default" | "warning" | "info";
}) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {icon}
      {label}
    </span>
  );
}
