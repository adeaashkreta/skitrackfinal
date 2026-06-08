import { ArrowRight } from "lucide-react";
import skierImg from "@/assets/promo-skier.jpg";
import snowboarderImg from "@/assets/promo-snowboarder.jpg";

const cards = [
  {
    label: "SkiTrack Concierge.",
    body: "Talk to a real ski expert who plans your trip end-to-end — resort, lessons, transfers and gear.",
    cta: "Talk to a concierge",
    image: skierImg,
    alt: "Skier carving down an alpine slope",
  },
  {
    label: "Season Pass Vault.",
    body: "Unlock multi-resort passes, early-bird pricing and member-only powder days across 120+ resorts.",
    cta: "Explore season passes",
    image: snowboarderImg,
    alt: "Snowboarder mid-turn on a snowy mountain at sunset",
  },
];

export function OfferPromoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="group rounded-2xl border border-border bg-card overflow-hidden flex items-stretch min-h-[200px] shadow-sm hover:shadow-md transition"
        >
          <div className="flex-1 p-8 flex flex-col justify-between gap-6">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{c.label}</span>{" "}
              {c.body}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 w-fit"
            >
              {c.cta}{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          <div className="relative w-2/5 shrink-0 overflow-hidden">
            <img
              src={c.image}
              alt={c.alt}
              loading="lazy"
              width={768}
              height={768}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
