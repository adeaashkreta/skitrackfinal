import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Bell, Shield, User as UserIcon, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { profileStore, type Climate, type Diet, type ProfileData, type RoomPref } from "@/lib/profileStore";

const CLIMATES: Climate[] = ["Tropical", "Mountain", "City", "Desert"];
const ROOMS: RoomPref[] = ["Standard", "Suite", "Villa"];
const DIETS: Diet[] = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free"];
const LANGUAGES = ["English", "French", "German", "Italian", "Spanish", "Japanese"];
const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY"];

const personalSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  dob: z.string().max(10).optional(),
  street: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
});

export function ProfileTab() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [data, setData] = useState<ProfileData>(profileStore.get());

  useEffect(() => profileStore.subscribe(() => setData(profileStore.get())), []);

  const update = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleArray = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const savePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = personalSchema.safeParse({
      name, email, phone: data.phone, dob: data.dob,
      street: data.street, city: data.city, country: data.country,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    profileStore.save(data);
    toast.success("Personal details saved");
  };

  const savePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    profileStore.save(data);
    toast.success("Travel preferences saved");
  };

  const saveNotifs = () => {
    profileStore.save(data);
    toast.success("Notification settings saved");
  };

  return (
    <div className="space-y-6">
      {/* Personal */}
      <Section icon={UserIcon} title="Personal details" desc="Used for bookings and check-in.">
        <form onSubmit={savePersonal} className="grid sm:grid-cols-2 gap-4">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></Field>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></Field>
          <Field label="Phone"><Input value={data.phone} onChange={(e) => update("phone", e.target.value)} maxLength={30} placeholder="+1 555 123 4567" /></Field>
          <Field label="Date of birth"><Input type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)} /></Field>
          <Field label="Street address" className="sm:col-span-2"><Input value={data.street} onChange={(e) => update("street", e.target.value)} maxLength={120} /></Field>
          <Field label="City"><Input value={data.city} onChange={(e) => update("city", e.target.value)} maxLength={80} /></Field>
          <Field label="Country"><Input value={data.country} onChange={(e) => update("country", e.target.value)} maxLength={80} /></Field>
          <Field label="Preferred language">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={data.language} onChange={(e) => update("language", e.target.value)}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Preferred currency">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={data.currency} onChange={(e) => update("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit">Save personal details</Button>
          </div>
        </form>
      </Section>

      {/* Travel preferences */}
      <Section icon={Plane} title="Travel preferences" desc="Helps us tailor your recommendations.">
        <form onSubmit={savePrefs} className="space-y-5">
          <div>
            <Label className="mb-2 block">Favorite climates</Label>
            <div className="flex flex-wrap gap-2">
              {CLIMATES.map((c) => {
                const active = data.climates.includes(c);
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => update("climates", toggleArray(data.climates, c))}
                    className={`rounded-full px-3 py-1.5 text-sm border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Preferred room type</Label>
            <RadioGroup value={data.roomPref} onValueChange={(v) => update("roomPref", v as RoomPref)} className="flex flex-wrap gap-4">
              {ROOMS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value={r} id={`room-${r}`} />
                  {r}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-2 block">Dietary needs</Label>
            <div className="grid sm:grid-cols-2 gap-2">
              {DIETS.map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={data.diets.includes(d)} onCheckedChange={() => update("diets", toggleArray(data.diets, d))} />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <Field label="Accessibility needs">
            <Textarea value={data.accessibility} onChange={(e) => update("accessibility", e.target.value.slice(0, 300))} placeholder="Wheelchair access, ground floor room, etc." rows={3} />
            <div className="text-xs text-muted-foreground mt-1 text-right">{data.accessibility.length}/300</div>
          </Field>

          <Button type="submit">Save preferences</Button>
        </form>
      </Section>

      {/* Notifications & privacy */}
      <Section icon={Bell} title="Notifications & privacy" desc="Control what we send you and how we secure your account.">
        <div className="space-y-3">
          {[
            { key: "emailUpdates", label: "Booking & trip emails", desc: "Confirmations, reminders, check-in info." },
            { key: "smsAlerts", label: "SMS alerts", desc: "Last-minute changes to your trip." },
            { key: "marketing", label: "Marketing emails", desc: "Deals, new resorts, seasonal offers." },
            { key: "twoFactor", label: "Two-factor authentication", desc: "Extra security at sign-in." },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
              <div>
                <div className="font-medium text-sm">{row.label}</div>
                <div className="text-xs text-muted-foreground">{row.desc}</div>
              </div>
              <Switch
                checked={data[row.key as keyof ProfileData] as boolean}
                onCheckedChange={(v) => {
                  const next = { ...data, [row.key]: v };
                  setData(next);
                  profileStore.save(next);
                }}
              />
            </div>
          ))}
          <Button variant="outline" onClick={saveNotifs} className="mt-2">
            <Shield className="h-4 w-4 mr-1" />Save settings
          </Button>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Delete account</h3>
            <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all reservations. This cannot be undone.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This is a demo — your account won't actually be deleted, but you'll be signed out.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { logout(); toast.success("Signed out (demo)"); }}>
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }: { icon: typeof UserIcon; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
