# CODFlow — Orders. Deliveries. Profit.

Mobile-first SaaS for Sri Lankan COD/social-media sellers. Next.js 14 (App Router) + TypeScript + Tailwind + Supabase.

## What's actually in this Phase 1 build

- Email/password auth (Supabase Auth), session handled via middleware
- 5-step onboarding → creates a `business`, `business_members` (owner), and a `FREE` subscription row
- Responsive dashboard shell: left sidebar on desktop, bottom nav + floating Add button on mobile
- Dashboard home: today's sales/profit/pending orders/return rate, recent orders, low-stock warning — all real queries, no fake numbers
- Orders: list, fast "Add Order" form with live profit preview and collapsible advanced costs, order detail page with a delivery timeline and a status updater (auto-decrements stock on DELIVERED)
- Customers: auto-created from orders by phone number match, with per-customer return rate
- Products: list + add form with low-stock flagging
- Reports: basic 30-day sales/profit/delivered/returned summary
- Full Postgres schema with Row Level Security enforcing tenant isolation via `business_members`

## What is NOT built yet (see roadmap below)

Returns section, expenses tracking, WhatsApp templates, PDF invoices, courier management CRUD, subscription limits/upgrade flow, admin panel, charts, custom date-range reports. These are Phases 3–6 in the original spec — building them now, before Phase 1 is tested against your real Supabase project, would just be more untested code stacked on top of untested code.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to Sri Lanka (Singapore)
3. Once it's ready: Project Settings → API → copy `Project URL` and `anon public` key

## 2. Run the database migrations

Open the Supabase SQL Editor and run, in order:

1. `supabase/migrations/0001_init.sql` — full schema, enums, triggers, RLS policies
2. `supabase/migrations/0002_decrement_stock.sql` — stock decrement function used when an order is marked Delivered

(Alternatively, if you have the Supabase CLI: `supabase link` then `supabase db push`.)

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Paste in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → you'll land on `/login` → sign up → onboarding → dashboard.

## 5. Regenerate real TypeScript types (recommended before building further)

`lib/supabase/types.ts` currently ships as a loose placeholder. Once your migrations are applied:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > lib/supabase/types.ts
```

This gives every Supabase query full autocomplete and type-checking against your actual tables instead of `any`.

## Data isolation — how it actually works

Every business-scoped table (`customers`, `orders`, `products`, `expenses`, etc.) has RLS enabled with a policy that checks `is_business_member(business_id)` — a `security definer` function that checks the `business_members` join table against `auth.uid()`. A user literally cannot query another business's rows, not because the app hides them, but because Postgres refuses the query. Test this yourself before trusting it: create two accounts, two businesses, and confirm account A can't see account B's orders even via direct API calls.

## Roadmap (unbuilt phases)

- **Phase 3**: Expenses, Returns section, custom-range Reports, charts (Recharts)
- **Phase 4**: Courier CRUD + waybill tracking, WhatsApp message templates, PDF invoice generation
- **Phase 5**: Subscription plan enforcement (order/customer caps), upgrade flow, billing
- **Phase 6**: Admin dashboard, product analytics, security/load testing

Build and test each phase against your running app before moving to the next — don't let this become a pile of unverified code.
