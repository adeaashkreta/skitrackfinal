import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, MapPin, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resort } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BookNowDialog } from "@/components/BookNowDialog";

export function FeaturedResortRow({
  resort,
  index,
  reversed = false,
}: {
  resort: Resort;
  index: number;
  reversed?: boolean;
}) {
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <>
      <article
        className={cn(
          "group grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-xl",
          "lg:grid-cols-12",
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative aspect-[4/3] lg:aspect-auto lg:col-span-7 overflow-hidden bg-muted",
            reversed ? "lg:order-2" : "lg:order-1",
          )}
        >
          <img
            src={resort.image}
            alt={`${resort.name}, ${resort.country ?? resort.location}`}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {resort.rating.toFixed(1)} guest rating
          </div>
        </div>

        {/* Text */}
        <div
          className={cn(
            "lg:col-span-5 p-8 md:p-10 lg:p-12 flex flex-col justify-center gap-5",
            reversed ? "lg:order-1" : "lg:order-2",
          )}
        >
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px flex-1 bg-border max-w-12" />
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {resort.country ?? resort.location}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl tracking-tight leading-[1.05]">
              {resort.name}
            </h3>
            {resort.tagline && (
              <p className="text-lg italic text-muted-foreground">{resort.tagline}</p>
            )}
          </div>

          {resort.whyFeatured && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {resort.whyFeatured}
            </p>
          )}

          {resort.features && resort.features.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
              {resort.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-border mt-2">
            <Button onClick={() => setBookOpen(true)} size="lg" className="flex-1 sm:flex-none">
              Book Now
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/resorts/$id" params={{ id: resort._id }}>
                Explore <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </article>

      <BookNowDialog resort={resort} open={bookOpen} onOpenChange={setBookOpen} />
    </>
  );
}
