import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResortCard } from "@/components/ResortCard";
import { favoritesStore } from "@/lib/favoritesStore";
import { demoResorts } from "@/lib/demoData";
import { resortsApi, type Resort } from "@/lib/api";

export function FavoritesTab() {
  const [resorts, setResorts] = useState<Resort[]>(demoResorts);
  const [ids, setIds] = useState<string[]>(favoritesStore.list());

  useEffect(() => {
    resortsApi.list().then((d) => Array.isArray(d) && d.length && setResorts(d)).catch(() => {});
    return favoritesStore.subscribe(() => setIds(favoritesStore.list()));
  }, []);

  const favs = resorts.filter((r) => ids.includes(r._id));

  if (favs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <Heart className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">No favorites yet. Tap the heart on any resort to save it here.</p>
        <Button asChild><Link to="/resorts">Browse resorts</Link></Button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favs.map((r) => <ResortCard key={r._id} resort={r} />)}
    </div>
  );
}
