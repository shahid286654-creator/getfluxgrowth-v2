This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Coolify

This repo includes a multi-stage `Dockerfile` (Next.js `output: "standalone"`) that Coolify will auto-detect. Two things are required for it to work:

1. **Set these environment variables in the Coolify app's Environment tab:**

   | Variable | Required at |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Build **and** runtime |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build **and** runtime |
   | `NEXT_PUBLIC_SITE_URL` | Build **and** runtime |
   | `SUPABASE_SERVICE_ROLE_KEY` | Runtime only |

2. **Mark the three `NEXT_PUBLIC_*` variables as "Build Variable" / "Available at Buildtime"** in Coolify. Next.js inlines `NEXT_PUBLIC_*` values into the compiled output during `next build` — if they're only injected at container start, the build bakes in `undefined` and every page 500s (via `middleware.ts`, which runs on every request) no matter what you set afterward at runtime. A full rebuild is required any time one of these values changes.

If these aren't set, every page now fails with a clear `Missing NEXT_PUBLIC_SUPABASE_URL...` error in the server logs (see `lib/supabase/env.ts`) instead of a cryptic Supabase client crash. `GET /api/health` is a plain liveness check (bypasses Supabase and middleware entirely) — point Coolify's health check at it to verify the container itself is up, independent of Supabase config.
