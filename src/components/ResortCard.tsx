import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Bath, Flame, Heart, MapPin, Star, Users, Waves, Wifi } from "lucide-react";
import type { Resort } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { favoritesStore } from "@/lib/favoritesStore";
import { cn } from "@/lib/utils";

const AMENITY_META: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "WiFi" },
  spa: { icon: Waves, label: "Spa" },
  "hot-tub": { icon: Waves, label: "Hot tub" },
  sauna: { icon: Flame, label: "Sauna" },
  bathtub: { icon: Bath, label: "Bathtub" },
};

export function ResortCard({
  resort,
  defaultRange,
  defaultGuests,
  defaultAdults,
  defaultChildren,
  defaultRooms,
}: {
  resort: Resort;
  defaultRange?: DateRange;
  defaultGuests?: number;
  defaultAdults?: number;
  defaultChildren?: number;
  defaultRooms?: number;
}) {
  const amenities = (resort.amenities ?? []).slice(0, 3);

  const search: Record<string, string | number | undefined> = {
    from: defaultRange?.from ? defaultRange.from.toISOString().slice(0, 10) : undefined,
    to: defaultRange?.to ? defaultRange.to.toISOString().slice(0, 10) : undefined,
    adults: defaultAdults,
    children: defaultChildren,
    rooms: defaultRooms,
  };
  // Strip undefined so they don't pollute the URL
  Object.keys(search).forEach((k) => search[k] === undefined && delete search[k]);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={resort.image}
          alt={`${resort.name} in ${resort.location}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 right-4 bottom-4 text-white">
          <h3 className="text-xl font-semibold leading-tight drop-shadow">{resort.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
            <MapPin className="h-3.5 w-3.5" />
            {resort.location}
          </p>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <FavoriteButton resortId={resort._id} />
          <div className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {resort.rating.toFixed(1)}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary">{resort.difficulty}</Badge>
          <div className="text-right shrink-0">
            <span className="text-lg font-bold text-foreground">${resort.pricePerDay}</span>
            <span className="text-xs text-muted-foreground"> / night</span>
          </div>
        </div>

        {resort.maxGuests !== undefined && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Sleeps {resort.maxGuests}
          </span>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2">{resort.description}</p>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {amenities.map((a) => {
              const meta = AMENITY_META[a];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span key={a} className="flex items-center gap-1">
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          <Button variant="outline" asChild className="flex-1">
            <Link to="/resorts/$id" params={{ id: resort._id }} search={search}>
              View Details
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/resorts/$id" params={{ id: resort._id }} search={search}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FavoriteButton({ resortId }: { resortId: string }) {
  const [fav, setFav] = useState(false);
  useEffect(() => {
    setFav(favoritesStore.has(resortId));
    return favoritesStore.subscribe(() => setFav(favoritesStore.has(resortId)));
  }, [resortId]);
  return (
    <button
      type="button"
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        favoritesStore.toggle(resortId);
      }}
      className="grid h-8 w-8 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:scale-110"
    >
      <Heart className={cn("h-4 w-4", fav ? "fill-red-500 text-red-500" : "text-foreground")} />
    </button>
  );
}
