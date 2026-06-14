// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    router: {
      routesDirectory: "../lib/routes",
    },
  },
  vite: {
    resolve: {
      alias: {
        "@/components/app-shell": path.resolve(__dirname, "./src/components/ui/app-shell"),
        "@/components/require-auth": path.resolve(__dirname, "./src/components/ui/require-auth"),
        "@/components/risk-gauge": path.resolve(__dirname, "./src/components/ui/risk-gauge"),
        "@/lib/store": path.resolve(__dirname, "./lib/api/store-supabase"),
      },
    },
  },
});
