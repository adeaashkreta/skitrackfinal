import { Link } from "@tanstack/react-router";
import { Mountain, MapPin, Mail, Phone } from "lucide-react";

const footerLinks = {
  Discover: [
    { label: "Resorts", to: "/resorts" },
    { label: "Weather", to: "/weather" },
    { label: "Activities", to: "/resorts" },
    { label: "Season Passes", to: "/resorts" },
  ],
  Company: [
    { label: "About us", to: "/about" },
    { label: "Careers", to: "/about" },
    { label: "Press", to: "/about" },
    { label: "Partners", to: "/about" },
  ],
  Support: [
    { label: "Help Center", to: "/about" },
    { label: "Contact us", to: "/about" },
    { label: "Cancellation policy", to: "/about" },
    { label: "Travel insurance", to: "/about" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 pt-16 pb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-12">
          {/* Brand column */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 font-extrabold text-foreground text-lg">
              <Mountain className="h-8 w-8 text-primary" />
              <span>SkiTrack</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              The easiest way to discover, compare and book the world's best ski resorts — from the Alps to the Rockies and beyond.
            </p>
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground/70" />
                <span>Lausanne, Switzerland</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground/70" />
                <span>hello@skitrack.app</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-muted-foreground/70" />
                <span>+41 21 000 00 00</span>
              </div>
            </div>
          </div>

          {/* Link columns — anchored to right edge on md+ */}
          <div className="grid grid-cols-3 gap-10 md:gap-16">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>


        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SkiTrack. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
