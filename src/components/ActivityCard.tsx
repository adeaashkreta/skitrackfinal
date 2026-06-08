import { type LucideIcon } from "lucide-react";

interface ActivityCardProps {
  image: string;
  title: string;
  Icon?: LucideIcon;
  tint: string; // tailwind gradient overlay classes
}

export function ActivityCard({ image, title, Icon, tint }: ActivityCardProps) {
  return (
    <a
      href="#"
      className="group relative w-[260px] md:w-[300px] lg:w-[320px] aspect-[4/5] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-black/5"
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        width={1024}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
      />
      {/* color tint */}
      <div className={`absolute inset-0 ${tint} mix-blend-multiply opacity-80`} aria-hidden />
      {/* readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" aria-hidden />

      {/* top-left icon chip */}
      {Icon && (
        <div className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur ring-1 ring-white/25">
          <Icon className="h-4.5 w-4.5 text-white" size={18} strokeWidth={2} />
        </div>
      )}

      {/* title */}
      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="text-white text-2xl font-bold tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:-translate-y-0.5">
          {title}
        </h3>
      </div>
    </a>
  );
}
