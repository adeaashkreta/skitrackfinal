import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ResortCard } from "@/components/ResortCard";
import { ResortsSearchBar, type ResortsSearchValue } from "@/components/ResortsSearchBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { resortsApi, type Resort } from "@/lib/api";
import { demoResorts } from "@/lib/demoData";

type ResortsSearch = {
  q?: string;
};

export const Route = createFileRoute("/resorts/")({
  validateSearch: (raw: Record<string, unknown>): ResortsSearch => {
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    return { q: str(raw.q) };
  },
  head: () => ({
    meta: [
      { title: "Resorts — SkiTrack" },
      { name: "description", content: "Browse and filter ski resorts by amenities, guest score, activities, price and difficulty." },
    ],
  }),
  component: ResortsPage,
});

type Amenity = NonNullable<Resort["amenities"]>[number];
type Activity = NonNullable<Resort["activities"]>[number];
type ReviewTier = "none" | "wonderful" | "very-good" | "good";

const AMENITIES: { value: Amenity; label: string }[] = [
  { value: "wifi", label: "Free WiFi" },
  { value: "spa", label: "Spa" },
  { value: "bathtub", label: "Bathtub" },
  { value: "hot-tub", label: "Hot tub" },
  { value: "sauna", label: "Sauna" },
];

const ACTIVITIES: { value: Activity; label: string }[] = [
  { value: "skiing", label: "Skiing" },
  { value: "snowboarding", label: "Snowboarding" },
  { value: "hiking", label: "Hiking" },
  { value: "cycling", label: "Cycling" },
];

const REVIEW_TIERS: { value: Exclude<ReviewTier, "none">; label: string; min: number }[] = [
  { value: "wonderful", label: "Wonderful: 9+", min: 4.5 },
  { value: "very-good", label: "Very Good: 8+", min: 4.0 },
  { value: "good", label: "Good: 7+", min: 3.5 },
];

function ResortsPage() {
  const { q: urlQ } = Route.useSearch();
  const [resorts, setResorts] = useState<Resort[]>(demoResorts);
  const [q, setQ] = useState(urlQ ?? "");

  useEffect(() => {
    setQ(urlQ ?? "");
  }, [urlQ]);
  const [difficulty, setDifficulty] = useState("all");
  const [maxPrice, setMaxPrice] = useState(400);
  const [reviewTier, setReviewTier] = useState<ReviewTier>("none");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState<ResortsSearchValue>({
    range: undefined,
    adults: 2,
    children: 0,
    rooms: 1,
    flexibility: "exact",
    pets: false,
  });


  useEffect(() => {
    resortsApi.list().then((data) => Array.isArray(data) && data.length && setResorts(data)).catch(() => {});
  }, []);

  const minRating = reviewTier === "none" ? 0 : REVIEW_TIERS.find((t) => t.value === reviewTier)!.min;

  const totalGuests = search.adults + search.children;
  const searchRange = search.range;

  const matches = (
    r: Resort,
    opts: { skipAmenity?: Amenity; skipActivity?: Activity; skipReview?: boolean } = {},
  ) => {
    if (q && !`${r.name} ${r.location}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (difficulty !== "all" && r.difficulty !== difficulty) return false;
    if (r.pricePerDay > maxPrice) return false;
    if (!opts.skipReview && r.rating < minRating) return false;
    for (const a of amenities) {
      if (opts.skipAmenity === a) continue;
      if (!r.amenities?.includes(a)) return false;
    }
    for (const a of activities) {
      if (opts.skipActivity === a) continue;
      if (!r.activities?.includes(a)) return false;
    }
    // Availability: only applies when a full range is selected
    if (searchRange?.from && searchRange?.to) {
      if (r.maxGuests !== undefined && totalGuests > r.maxGuests) return false;
      const from = searchRange.from.getTime();
      const to = searchRange.to.getTime();
      const overlaps = r.unavailableRanges?.some((u) => {
        const uFrom = new Date(u.from).getTime();
        const uTo = new Date(u.to).getTime();
        return uFrom <= to && uTo >= from;
      });
      if (overlaps) return false;
    }
    return true;
  };

  const filtered = useMemo(
    () => resorts.filter((r) => matches(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resorts, q, difficulty, maxPrice, reviewTier, amenities, activities, search],
  );

  const amenityCount = (a: Amenity) =>
    resorts.filter((r) => matches(r, { skipAmenity: a }) && r.amenities?.includes(a)).length;
  const activityCount = (a: Activity) =>
    resorts.filter((r) => matches(r, { skipActivity: a }) && r.activities?.includes(a)).length;
  const reviewCount = (min: number) =>
    resorts.filter((r) => matches(r, { skipReview: true }) && r.rating >= min).length;

  const toggleAmenity = (a: Amenity) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleActivity = (a: Activity) =>
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const hasActiveFilters =
    q !== "" ||
    difficulty !== "all" ||
    maxPrice < 400 ||
    reviewTier !== "none" ||
    amenities.length > 0 ||
    activities.length > 0;

  const clearAll = () => {
    setQ("");
    setDifficulty("all");
    setMaxPrice(400);
    setReviewTier("none");
    setAmenities([]);
    setActivities([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">All Resorts</h1>
            <p className="text-muted-foreground mt-1">
              {filtered.length} resort{filtered.length === 1 ? "" : "s"} available
            </p>
          </div>
          <div className="lg:flex-1 lg:max-w-xl w-full">
            <ResortsSearchBar
              value={search}
              onChange={setSearch}
              onSearch={() => {
                // Scroll to results to show the filtered resorts
                document.getElementById("resorts-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </div>


        <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="rounded-2xl border border-border bg-card p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Filter by</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input
                  id="q"
                  placeholder="Location or name…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max price / day: ${maxPrice}</Label>
                <Slider
                  value={[maxPrice]}
                  min={50}
                  max={400}
                  step={5}
                  onValueChange={(v) => setMaxPrice(v[0])}
                  className="mt-3"
                />
              </div>
            </div>

            <FilterGroup title="Guest review score">
              {REVIEW_TIERS.map((tier) => {
                const count = reviewCount(tier.min);
                const checked = reviewTier === tier.value;
                const disabled = count === 0 && !checked;
                return (
                  <FilterRow
                    key={tier.value}
                    id={`review-${tier.value}`}
                    label={tier.label}
                    sublabel="Based on guest reviews"
                    count={count}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(c) =>
                      setReviewTier(c ? tier.value : "none")
                    }
                  />
                );
              })}
            </FilterGroup>

            <FilterGroup title="Amenities">
              {AMENITIES.map((a) => {
                const count = amenityCount(a.value);
                const checked = amenities.includes(a.value);
                return (
                  <FilterRow
                    key={a.value}
                    id={`amenity-${a.value}`}
                    label={a.label}
                    count={count}
                    checked={checked}
                    disabled={count === 0 && !checked}
                    onCheckedChange={() => toggleAmenity(a.value)}
                  />
                );
              })}
            </FilterGroup>

            <FilterGroup title="Fun things to do">
              {ACTIVITIES.map((a) => {
                const count = activityCount(a.value);
                const checked = activities.includes(a.value);
                return (
                  <FilterRow
                    key={a.value}
                    id={`activity-${a.value}`}
                    label={a.label}
                    count={count}
                    checked={checked}
                    disabled={count === 0 && !checked}
                    onCheckedChange={() => toggleActivity(a.value)}
                  />
                );
              })}
            </FilterGroup>
          </aside>

          <div id="resorts-grid" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <ResortCard
                key={r._id}
                resort={r}
                defaultRange={search.range}
                defaultGuests={totalGuests}
                defaultAdults={search.adults}
                defaultChildren={search.children}
                defaultRooms={search.rooms}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-20">
                No resorts match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 pt-5 border-t border-border">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FilterRow({
  id,
  label,
  sublabel,
  count,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  sublabel?: string;
  count: number;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className={disabled ? "opacity-40" : ""}>
      <div className="flex items-center gap-2.5">
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(c) => onCheckedChange(c === true)}
        />
        <label
          htmlFor={id}
          className="flex-1 flex items-center justify-between text-sm cursor-pointer"
        >
          <span>{label}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
        </label>
      </div>
      {sublabel && (
        <p className="text-xs text-muted-foreground ml-6 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
