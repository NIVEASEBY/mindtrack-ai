import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Brain, Menu, X, Shield } from "lucide-react";
import { useState, type ReactNode } from "react";
import { store, useTheme, useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/assessment", label: "Assessment" },
  { to: "/recovery", label: "Recovery" },
  { to: "/planner", label: "Study Plan" },
  { to: "/history", label: "History" },
  { to: "/checkin", label: "Check-in" },
] as const;

export function AppHeader() {
  const { user } = useUser();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Brain className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base sm:text-lg">MindTrack AI</span>
        </Link>
        {user && (
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === l.to ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="min-h-11 min-w-11"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Hi, {user.fullName.split(" ")[0]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  store.logout();
                  navigate({ to: "/" });
                }}
                className="hidden sm:inline-flex"
              >
                Sign out
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden min-h-11 min-w-11"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/60"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
      {user && open && (
        <nav className="border-t border-border/60 bg-background md:hidden" aria-label="Mobile">
          <div className="flex flex-col p-2">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-medium ${pathname === l.to ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-secondary/60"}`}
              >
                {l.label}
              </Link>
            ))}

            <button
              onClick={() => {
                store.logout();
                setOpen(false);
                navigate({ to: "/" });
              }}
              className="mt-1 rounded-lg px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Sign out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        MindTrack AI · Calmer studies, clearer minds.
      </footer>
    </div>
  );
}