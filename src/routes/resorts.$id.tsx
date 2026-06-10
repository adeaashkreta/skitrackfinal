import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Star, ArrowLeft, ChevronRight, Minus, Plus, Users as UsersIcon, Ruler, Mountain, Bath, Tv, Calendar as CalendarIcon, Pencil, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { resortsApi, type Booking, type Resort } from "@/lib/api";
import { PaymentCheckoutDialog } from "@/components/PaymentCheckoutDialog";
import { bookingsStore } from "@/lib/bookingsStore";
import { demoResorts } from "@/lib/demoData";
import { FACILITY_META } from "@/lib/facilities";
import { useAuth } from "@/context/AuthContext";
import { ContactResortDialog } from "@/components/ContactResortDialog";

type DetailsSearch = {
  from?: string;
  to?: string;
  adults?: number;
  children?: number;
  rooms?: number;
};

type PendingBooking = {
  resort: Resort;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: Booking["status"];
};

export const Route = createFileRoute("/resorts/$id")({
  validateSearch: (raw: Record<string, unknown>): DetailsSearch => {
    const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
    const num = (v: unknown) => {
      const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    };
    return {
      from: str(raw.from),
      to: str(raw.to),
      adults: num(raw.adults),
      children: num(raw.children),
      rooms: num(raw.rooms),
    };
  },
  component: ResortDetailsPage,
});

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function ResortDetailsPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resort, setResort] = useState<Resort | null>(
    demoResorts.find((r) => r._id === id) ?? null
  );
  const startDate = search.from ?? "";
  const endDate = search.to ?? "";
  const guests = (search.adults ?? 2) + (search.children ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [contactOpen, setContactOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);

  useEffect(() => {
    resortsApi.get(id).then((data) => data && setResort(data)).catch(() => {});
  }, [id]);


  const gallery = useMemo(() => {
    if (!resort) return [];
    return resort.gallery && resort.gallery.length > 0
      ? resort.gallery
      : [resort.image];
  }, [resort]);

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(diff));
  }, [startDate, endDate]);

  const selectedRoomsTotal = useMemo(() => {
    if (!resort?.roomTypes) return 0;
    return resort.roomTypes.reduce((sum, rt) => sum + (roomCounts[rt.id] ?? 0) * rt.pricePerNight, 0);
  }, [resort, roomCounts]);

  const totalRooms = Object.values(roomCounts).reduce((a, b) => a + b, 0);
  const fallbackTotal = resort ? nights * resort.pricePerDay * guests : 0;
  const totalPrice = selectedRoomsTotal > 0 && nights > 0 ? selectedRoomsTotal * nights : fallbackTotal;

  if (!resort) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Resort not found</h1>
          <Button className="mt-4" onClick={() => navigate({ to: "/resorts" })}>Back to resorts</Button>
        </div>
      </div>
    );
  }

const handleBook = (e: React.FormEvent) => {
  e.preventDefault();

  if (!user) {
    navigate({ to: "/login" });
    return;
  }

  if (nights <= 0) {
    toast.error("Pick a valid date range");
    return;
  }

  if (resort.roomTypes && resort.roomTypes.length > 0 && totalRooms === 0) {
    toast.error("Select at least one room");
    return;
  }

  setPendingBooking({
    resort,
    startDate,
    endDate,
    guests,
    totalPrice,
    status: "confirmed",
  });

  setPaymentOpen(true);
};

const handlePaymentSuccess = async () => {
  if (!pendingBooking) {
    toast.error("No booking selected");
    return;
  }

  setSubmitting(true);

  try {
    bookingsStore.add({
      user: user?._id ?? "u1",
      resort: pendingBooking.resort,
      startDate: pendingBooking.startDate,
      endDate: pendingBooking.endDate,
      guests: pendingBooking.guests,
      totalPrice: pendingBooking.totalPrice,
      status: "confirmed",
    });

    toast.success("Payment successful! Booking confirmed.");
    setPaymentOpen(false);
    setPendingBooking(null);

    navigate({
      to: "/dashboard",
      search: { tab: "bookings" },
    });
  } finally {
    setSubmitting(false);
  }
};

  const scrollToAvailability = () => {
    document.getElementById("availability")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroImg = gallery[0];
  const side1 = gallery[1] ?? gallery[0];
  const side2 = gallery[2] ?? gallery[0];
  const thumbs = gallery.slice(3, 7);
  const extraCount = Math.max(0, gallery.length - 7);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/resorts" })} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to resorts
        </Button>

        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-primary">
              {Array.from({ length: Math.round(resort.rating) }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
              <Badge variant="secondary" className="ml-1">{resort.difficulty}</Badge>
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{resort.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {resort.address ?? resort.location}
            </p>
          </div>
          <Button size="lg" onClick={scrollToAvailability}>Reserve</Button>
        </div>

        {/* Gallery + review card */}
        <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <div className="grid grid-cols-3 gap-2 h-[420px]">
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="col-span-2 row-span-2 overflow-hidden rounded-2xl border border-border bg-muted"
              >
                <img src={heroImg} alt={resort.name} className="h-full w-full object-cover transition hover:scale-105" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(1)}
                className="overflow-hidden rounded-2xl border border-border bg-muted"
              >
                <img src={side1} alt="" className="h-full w-full object-cover transition hover:scale-105" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(2)}
                className="overflow-hidden rounded-2xl border border-border bg-muted"
              >
                <img src={side2} alt="" className="h-full w-full object-cover transition hover:scale-105" />
              </button>
            </div>
            {thumbs.length > 0 && (
              <div className="mt-2 grid grid-cols-5 gap-2 h-24">
                {thumbs.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(3 + i)}
                    className="relative overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === thumbs.length - 1 && extraCount > 0 && (
                      <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center font-semibold">
                        +{extraCount} photos
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Review card */}
          <aside className="rounded-2xl border border-border bg-card p-5 h-fit lg:sticky lg:top-20">
            {resort.reviewScore !== undefined && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold">{resort.reviewLabel ?? "Excellent"}</div>
                    <div className="text-sm text-muted-foreground">{resort.reviewCount ?? 0} reviews</div>
                  </div>
                  <div className="rounded-lg bg-primary text-primary-foreground text-lg font-bold px-3 py-1.5">
                    {resort.reviewScore.toFixed(1)}
                  </div>
                </div>
                {resort.reviewQuote && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-medium text-foreground mb-2">Guests who stayed here loved</p>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{resort.reviewQuote.text}"</p>
                    <p className="mt-2 text-xs text-foreground/80">— {resort.reviewQuote.author}{resort.reviewQuote.country ? `, ${resort.reviewQuote.country}` : ""}</p>
                  </div>
                )}
              </>
            )}
            <Button className="w-full mt-4" onClick={scrollToAvailability}>
              Check availability <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={() => setContactOpen(true)}>
              <MessageCircle className="h-4 w-4 mr-1" /> Contact resort
            </Button>
          </aside>
        </div>

        {resort && (
          <ContactResortDialog resort={resort} open={contactOpen} onOpenChange={setContactOpen} />
        )}

        {pendingBooking && (
          <PaymentCheckoutDialog
            open={paymentOpen}
            onOpenChange={setPaymentOpen}
            totalPrice={pendingBooking.totalPrice}
            resortName={pendingBooking.resort.name}
            onPaySuccess={handlePaymentSuccess}
          />
        )}


        {/* About */}
        <section className="mt-10 max-w-3xl">
          <h2 className="text-2xl font-semibold">About this resort</h2>
          <p className="mt-3 text-foreground/80 leading-relaxed">{resort.description}</p>
          {resort.whyFeatured && (
            <p className="mt-3 text-muted-foreground leading-relaxed">{resort.whyFeatured}</p>
          )}
        </section>

        {/* Popular facilities */}
        {resort.popularFacilities && resort.popularFacilities.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Most popular facilities</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
              {resort.popularFacilities.map((key) => {
                const meta = FACILITY_META[key];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-2 text-foreground">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Availability */}
        <section id="availability" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-semibold">Availability</h2>
          <p className="text-sm text-muted-foreground">Prices in USD per night</p>

          <form onSubmit={handleBook}>
            <div className="mt-4 rounded-2xl border-2 border-primary bg-card p-4 flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-primary" />
                {startDate && endDate ? (
                  <>
                    <span className="font-semibold">{formatDate(startDate)}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{formatDate(endDate)}</span>
                    <span className="text-muted-foreground">· {nights} night{nights === 1 ? "" : "s"}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No dates selected</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UsersIcon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{guests} guest{guests === 1 ? "" : "s"}</span>
                {search.rooms ? (
                  <span className="text-muted-foreground">· {search.rooms} room{search.rooms === 1 ? "" : "s"}</span>
                ) : null}
              </div>
              <Button asChild variant="ghost" size="sm" className="ml-auto text-primary hover:text-primary">
                <Link to="/resorts">
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Change dates
                </Link>
              </Button>
            </div>


            {resort.roomTypes && resort.roomTypes.length > 0 ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                <div className="hidden md:grid grid-cols-[2fr_1fr_1.2fr_1.6fr_140px] gap-4 bg-secondary text-secondary-foreground px-4 py-3 text-sm font-semibold">
                  <div>Room type</div>
                  <div>Guests</div>
                  <div>Price / night</div>
                  <div>Your choices</div>
                  <div className="text-right">Select rooms</div>
                </div>

                {resort.roomTypes.map((rt) => (
                  <div key={rt.id} className="grid md:grid-cols-[2fr_1fr_1.2fr_1.6fr_140px] gap-4 px-4 py-5 border-t border-border first:border-t-0">
                    {/* Room type */}
                    <div className="flex gap-3">
                      {rt.image && (
                        <img src={rt.image} alt="" className="hidden sm:block h-20 w-24 object-cover rounded-lg border border-border" />
                      )}
                      <div className="min-w-0">
                        <a href="#" className="font-semibold text-primary hover:underline">{rt.name}</a>
                        {rt.left !== undefined && rt.left <= 3 && (
                          <div className="text-xs text-destructive mt-0.5">Only {rt.left} left!</div>
                        )}
                        <div className="mt-1 text-sm text-muted-foreground">{rt.beds}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {rt.sizeM2 && <Badge variant="outline" className="gap-1"><Ruler className="h-3 w-3" />{rt.sizeM2} m²</Badge>}
                          {rt.view && <Badge variant="outline" className="gap-1"><Mountain className="h-3 w-3" />{rt.view}</Badge>}
                          {rt.bathroom && <Badge variant="outline" className="gap-1"><Bath className="h-3 w-3" />{rt.bathroom}</Badge>}
                          {rt.tv && <Badge variant="outline" className="gap-1"><Tv className="h-3 w-3" />Flat-screen TV</Badge>}
                        </div>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="flex items-start gap-0.5 text-foreground">
                      {Array.from({ length: rt.capacity }).map((_, i) => (
                        <UsersIcon key={i} className="h-4 w-4" />
                      ))}
                    </div>

                    {/* Price */}
                    <div>
                      {rt.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">${rt.originalPrice}</div>
                      )}
                      <div className="text-lg font-bold">${rt.pricePerNight}</div>
                      {rt.discountPct && (
                        <Badge className="mt-1 bg-emerald-600 hover:bg-emerald-600 text-white">{rt.discountPct}% off</Badge>
                      )}
                    </div>

                    {/* Perks */}
                    <ul className="text-sm space-y-1 text-foreground/80">
                      {rt.perks?.map((p) => (
                        <li key={p} className="flex gap-1.5"><span className="text-primary">✓</span>{p}</li>
                      ))}
                    </ul>

                    {/* Selector */}
                    <div className="flex md:justify-end items-start">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          onClick={() => setRoomCounts((c) => ({ ...c, [rt.id]: Math.max(0, (c[rt.id] ?? 0) - 1) }))}
                          className="p-2 hover:bg-muted"
                        ><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm font-semibold">{roomCounts[rt.id] ?? 0}</span>
                        <button
                          type="button"
                          onClick={() => setRoomCounts((c) => ({ ...c, [rt.id]: Math.min(rt.left ?? 5, (c[rt.id] ?? 0) + 1) }))}
                          className="p-2 hover:bg-muted"
                        ><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total + reserve */}
                <div className="border-t border-border bg-muted/40 px-4 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {totalRooms} room{totalRooms === 1 ? "" : "s"} × {nights || 0} night{nights === 1 ? "" : "s"}
                    </div>
                    <div className="text-2xl font-bold">${totalPrice.toLocaleString()}</div>
                  </div>
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? "Booking…" : "I'll reserve"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">{nights} night{nights === 1 ? "" : "s"} × {guests} guest{guests === 1 ? "" : "s"}</div>
                  <div className="text-2xl font-bold">${totalPrice.toLocaleString()}</div>
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Booking…" : "Book Now"}
                </Button>
              </div>
            )}
            {!user && <p className="text-xs text-muted-foreground mt-2">You'll be asked to log in first.</p>}
          </form>
        </section>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="max-w-5xl p-2">
          <Carousel opts={{ startIndex: lightboxIndex ?? 0 }}>
            <CarouselContent>
              {gallery.map((src, i) => (
                <CarouselItem key={i}>
                  <img src={src} alt="" className="w-full h-[70vh] object-contain bg-black rounded-lg" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}
