# WashDesk

An admin dashboard for a car wash. The owner manages service pricing, schedules appointments, and sees daily and monthly revenue in one place.

**Live demo:** _added after deployment_

## Features

- **Service pricing:** the owner adds services, edits prices and durations, and deactivates services without deleting history.
- **Appointment scheduling:** create bookings and move each one through Pending, Confirmed and Completed (or Cancelled). Completed and cancelled bookings are locked.
- **Revenue reports:** daily and monthly revenue from completed bookings. Owner only.
- **Roles:** `OWNER` can do everything. `STAFF` can manage appointments but cannot change prices or see revenue.
- **Ethiopia time:** times are stored in UTC and shown in `Africa/Addis_Ababa`, so days and months line up with the real business day.

## Tech stack

Next.js 16 (App Router, Cache Components), TypeScript, Prisma 6 with PostgreSQL (Neon), Auth.js (`next-auth` v5 beta) with credentials login, Tailwind CSS with shadcn/ui, Zod, Recharts, Vitest, pnpm.

## Design decisions

- Each appointment stores its own price when it is booked, so changing a service price later does not rewrite past revenue.
- Prices always come from the database, never from the browser.
- The proxy protects `/dashboard`, and every page and server action checks the session again with `requireUser()` or `requireOwner()`.
- Business rules (allowed status changes, input validation) live in plain functions so they can be unit tested.

## Getting started

You need Node 20.9 or newer, pnpm, and a PostgreSQL database. A free Neon project works well.

1. Install dependencies:

   ```bash
   pnpm install
   ```

   If pnpm reports ignored build scripts, run `pnpm approve-builds` and approve them.

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Fill in every value. Generate `AUTH_SECRET` with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Create the database tables:

   ```bash
   pnpm prisma migrate dev
   ```

4. Create the owner account and three starter services:

   ```bash
   pnpm tsx --env-file=.env prisma/seed.ts
   ```

5. Start the app and sign in at <http://localhost:3000> with the owner email and password from your `.env`:

   ```bash
   pnpm dev
   ```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run the unit tests |
| `pnpm exec tsc --noEmit` | Type-check the project |

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled connection string used by the app |
| `DIRECT_URL` | Direct connection string used by migrations |
| `AUTH_SECRET` | Secret used to sign login sessions |
| `SEED_OWNER_EMAIL` | Email of the owner account created by the seed script |
| `SEED_OWNER_PASSWORD` | Password of the owner account created by the seed script |

On a free Neon database the first request after a quiet period can be slow while the database wakes up. Adding `connect_timeout=30` to `DATABASE_URL` avoids connection errors in that case.

## Testing

`pnpm test` runs unit tests for the status-change rules, the input validation, and the Ethiopia-time formatting. There are no browser or database integration tests yet.

## Known limitations

- Only the seed script creates users. There is no screen for adding staff accounts yet.
- Login attempts are not rate limited yet.
- Revenue is counted on the day a booking was scheduled, because completion time is not recorded.
- Bookings are created by staff inside the dashboard. There is no public booking page for customers.