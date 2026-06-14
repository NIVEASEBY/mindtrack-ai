import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useUser } from "@/lib/store";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}