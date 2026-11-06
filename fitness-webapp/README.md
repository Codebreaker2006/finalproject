# Fitness Log

A small webapp built from your `fitness.cpp` / `fitness.h`: sign up, log in,
fill out a one-time survey covering every field on the C++ `User` class
(sex, activity level, meal type, exercise category, units, weight, height),
then view it back with dedicated **BMI** and **Ideal weight** sections that
calculate instantly from your saved data.

Stack: Next.js (App Router) + TypeScript + Prisma/Postgres + Tailwind.
See `native/README.md` for how this relates to the original C++ files.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Get a free Postgres database — the fastest option is
   [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres).
   Copy `.env.example` to `.env` and fill in `DATABASE_URL` and a
   `SESSION_SECRET` (generate one with `openssl rand -base64 32`).
3. Push the schema to your database:
   ```bash
   npm run db:push
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" and import the repo.
3. Add two environment variables in the Vercel project settings:
   - `DATABASE_URL` — your Postgres connection string (Vercel Postgres,
     Neon, Supabase, etc. all work — just use a real Postgres, not SQLite,
     since Vercel's serverless functions don't have durable local disk)
   - `SESSION_SECRET` — a long random string
4. Deploy. Vercel runs `npm run build`, which runs `prisma generate` and
   `next build`.
5. After the first deploy, run `npx prisma db push` once (locally, pointed
   at the production `DATABASE_URL`) to create the tables.

## How it's organized

- `src/lib/fitness.ts` — the calculation logic, ported from `fitness.cpp`
- `src/app/survey` — the onboarding questionnaire (one write to the DB)
- `src/app/dashboard` — Profile / BMI / Ideal weight tabs
- `src/app/api/*` — register, login, logout, and profile save/load routes
- `prisma/schema.prisma` — `User` (login) and `Profile` (fitness data) tables
- `native/` — your original C++ files, minimally extended with
  `serialize()`/`deserialize()`

## Notes on auth

Authentication here is intentionally simple and self-contained: email +
password, hashed with bcrypt, a signed JWT in an httpOnly cookie. No
third-party auth provider required, but it also means there's no password
reset flow or email verification — add those if this goes beyond a
personal project.
