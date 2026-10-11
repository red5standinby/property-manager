import type { NextConfig } from "next";

// ─── Build mode depends on the backend ────────────────────────────────
//
// local  → static export (current public beta on GitHub Pages). No server
//          routes, basePath /property-manager.
// remote → a real server build (Vercel / node) so /api/* route handlers and
//          auth middleware can run. Dropping `output: "export"` also removes
//          the static-export bug class the plan calls out.
//
// Server-only files use the `.server.ts(x)` suffix and are ONLY included as
// pages in remote mode (via pageExtensions). That keeps the static beta build
// free of API routes/middleware that cannot exist in an export.
//
// Flip by setting NEXT_PUBLIC_VESTAOS_BACKEND=remote at build time.

const backend = process.env.NEXT_PUBLIC_VESTAOS_BACKEND ?? "local";
const isRemote = backend === "remote";

const nextConfig: NextConfig = isRemote
  ? {
      // Server build: API routes + middleware + auth.
      images: { unoptimized: true },
      pageExtensions: ["tsx", "ts", "server.ts", "server.tsx"],
    }
  : {
      // Static beta: unchanged from before Phase 2.
      output: "export",
      images: { unoptimized: true },
      basePath: "/property-manager",
      assetPrefix: "/property-manager/",
      // Exclude `.server.*` files entirely in the static build.
      pageExtensions: ["tsx", "ts"],
    };

export default nextConfig;
