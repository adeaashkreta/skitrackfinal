import { Link, useNavigate } from "@tanstack/react-router";
import { Mountain, LogOut, LayoutDashboard, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavbarProps {
  variant?: "default" | "hero";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const isHero = variant === "hero";

  const linkBase = `tracking-wide uppercase text-[13px] font-semibold transition-colors ${
    isHero
      ? "text-white/85 hover:text-white [&.active]:text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
      : "text-muted-foreground hover:text-foreground [&.active]:text-primary"
  }`;

  return (
    <header
      className={`z-50 w-full ${
        isHero
          ? "absolute top-0 left-0 bg-transparent"
          : "sticky top-0 bg-background/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12 h-[72px]">
        <Link
          to="/"
          className={`flex items-center gap-2.5 font-extrabold text-2xl tracking-tight ${
            isHero
              ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              : "text-foreground"
          }`}
        >
          <Mountain
            className={
              isHero
                ? "h-9 w-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                : "h-9 w-9 text-primary"
            }
          />
          <span>SkiTrack</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          <Link to="/" activeOptions={{ exact: true }} className={linkBase}>
            Home
          </Link>
          <Link to="/resorts" className={linkBase}>
            Resorts
          </Link>
          <Link to="/weather" className={linkBase}>
            Weather
          </Link>
          <Link to="/about" className={linkBase}>
            About
          </Link>
          {user && (
            <Link to="/dashboard" className={linkBase}>
              My Bookings
            </Link>
          )}
          {user?.role === "resort_manager" && (
            <Link to="/manager" className={linkBase}>
              Manager
            </Link>
          )}
          {user?.role === "super_admin" && (
            <Link to="/admin" className={linkBase}>
              Admin
            </Link>
          )}
        </nav>



        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <span
                className={`hidden sm:flex items-center gap-2 text-sm ${
                  isHero ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                <UserIcon className="h-5 w-5" />
                {user.name}
              </span>
              {user.role === "resort_manager" && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={
                    isHero
                      ? "border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white"
                      : ""
                  }
                >
                  <Link to="/manager">
                    <LayoutDashboard className="h-5 w-5 mr-1" />
                    Manager
                  </Link>
                </Button>
              )}
              {user.role === "super_admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={
                    isHero
                      ? "border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white"
                      : ""
                  }
                >
                  <Link to="/admin">
                    <LayoutDashboard className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={
                  isHero
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : ""
                }
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className={
                  isHero
                    ? "text-white hover:bg-white/10 hover:text-white text-sm font-semibold tracking-wide"
                    : ""
                }
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className={
                  isHero
                    ? "bg-white text-slate-900 hover:bg-white/90 font-semibold tracking-wide shadow-lg shadow-black/20 px-5"
                    : ""
                }
              >
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className={`h-8 w-8 ${isHero ? "text-white" : "text-foreground"}`} />
          ) : (
            <Menu className={`h-8 w-8 ${isHero ? "text-white" : "text-foreground"}`} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`md:hidden px-4 pb-4 space-y-3 ${
            isHero ? "bg-black/40 backdrop-blur" : "bg-background border-b border-border"
          }`}
        >
          <Link to="/" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <Link to="/resorts" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
            Resorts
          </Link>
          <Link to="/weather" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
            Weather
          </Link>
          <Link to="/about" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
            About
          </Link>
          {user && (
            <Link to="/dashboard" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
              My Bookings
            </Link>
          )}
          {user?.role === "resort_manager" && (
            <Link to="/manager" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
              Manager
            </Link>
          )}
          {user?.role === "super_admin" && (
            <Link to="/admin" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className={`block text-sm font-medium ${linkBase}`}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" className={`block text-sm font-medium ${linkBase}`} onClick={() => setMobileOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
