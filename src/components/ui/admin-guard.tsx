import { useUser } from "@/lib/store";
import { Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mx-auto">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="mt-2 text-muted-foreground">You need to be logged in to access the admin panel.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/60"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive mx-auto">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You don't have permission to access the admin panel.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/60"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
