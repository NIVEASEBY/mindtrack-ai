import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { z } from "zod";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Search = { mode?: "login" | "register" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "register" ? "register" : "login",
  }),
  head: () => ({ meta: [{ title: "Sign in — MindTrack AI" }] }),
  component: AuthPage,
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  studentId: z.string().trim().min(1, "Student ID is required").max(50),
  institution: z.string().trim().min(1, "Institution is required").max(150),
  password: z.string().min(8, "Min 8 characters").max(128),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    setLoading(true);
    try {
      if (isRegister) {
        const parsed = registerSchema.safeParse(data);
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
          setErrors(errs);
          return;
        }
        await store.register({
          id: crypto.randomUUID(),
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          studentId: parsed.data.studentId,
          institution: parsed.data.institution,
          password: parsed.data.password,
        });
        toast.success("Welcome to MindTrack AI! A welcome email is on its way.");
        navigate({ to: "/dashboard" });
      } else {
        const parsed = loginSchema.safeParse(data);
        if (!parsed.success) {
          const errs: Record<string, string> = {};
          parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
          setErrors(errs);
          return;
        }
        await store.login(parsed.data.email, parsed.data.password);
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <section className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? "Two minutes and you're in." : "Sign in to continue your wellness journey."}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {isRegister && (
              <>
                <Field id="fullName" label="Full name" error={errors.fullName} autoComplete="name" />
                <Field id="studentId" label="Student ID" error={errors.studentId} />
                <Field id="institution" label="Institution" error={errors.institution} />
              </>
            )}
            <Field id="email" label="Email" type="email" error={errors.email} autoComplete="email" />
            <Field id="password" label="Password" type="password" error={errors.password} autoComplete={isRegister ? "new-password" : "current-password"} />
            {isRegister && (
              <Field id="confirm" label="Confirm password" type="password" error={errors.confirm} autoComplete="new-password" />
            )}
            {!isRegister && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" name="remember" className="h-4 w-4 rounded border-border text-primary focus-visible:ring-ring" />
                  Remember me
                </label>
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => toast.info("Password reset link sent if the email exists.")}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full min-h-12 text-base">
              {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={() => navigate({ to: "/auth", search: { mode: isRegister ? "login" : "register" } })}
              className="font-semibold text-primary hover:underline"
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  id, label, type = "text", error, autoComplete,
}: { id: string; label: string; type?: string; error?: string; autoComplete?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="min-h-11" />
      {error && <p id={`${id}-err`} className="text-xs text-destructive">{error}</p>}
    </div>
  );
}