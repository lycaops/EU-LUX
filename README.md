# EU Luxury Tours & Travels

Next.js 14 App Router site with Supabase authentication for the administrator area.

## Deployment guide

This project uses Next.js 14 and Supabase Auth for administrator access. The steps below use Vercel; another Next.js host can be used if it supports the same environment variables and middleware.

### 1. Prepare Supabase

1. Create a Supabase project and wait for it to finish provisioning.
2. In **Project Settings → API**, copy the Project URL and the public `anon` key (or publishable key, if shown). These are browser-safe keys intended for use with RLS; do not use or expose the `service_role` key.
3. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates the profile, catalogue, booking tables, RLS policies, auth profile trigger, and initial vehicle. Policy and trigger setup is safe to rerun.
4. In **Authentication → Users**, create the administrator account. Once it exists, promote its profile in the SQL Editor:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (
     select id from auth.users
     where email = 'admin@example.com'
   )
   returning id;
   ```

   Replace the example email with the exact account email. Confirm that the query returns one row. New profiles default to `customer`; the site has no public admin sign-up.
5. In **Authentication → URL Configuration**, set the Site URL to the production origin (for example, `https://your-domain.example`). Add your local development origin (for example, `http://localhost:3000`) to the redirect URL allow list.

### 2. Configure and test locally

1. Use Node.js 20 LTS.
2. Copy `.env.example` to `.env.local` and set the two values from Supabase:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
   ```

   PowerShell: `Copy-Item .env.example .env.local`. Keep `.env.local` private; it is ignored by Git. Never put a service-role key in a `NEXT_PUBLIC_` variable.
3. Install and start the app:

   ```sh
   npm ci
   npm run dev
   ```

4. Visit `http://localhost:3000/admin/login` and sign in with the administrator account. Verify that a normal customer account cannot open `/admin`.
5. Check the production build locally:

   ```sh
   npm run build
   npm run start
   ```

Customer accounts must be created in Supabase Authentication; new users receive the `customer` role through the profile trigger. Customers sign in at `/account/login`. The `/account` route checks the Supabase session and customer role on the server.

### 3. Deploy with Vercel

1. Push the project to a Git provider supported by Vercel, then import that repository into Vercel.
2. Keep the project root as the **Root Directory** and select the Next.js framework preset.
3. In **Project Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production (and Preview/Development if those deployments need Supabase). These `NEXT_PUBLIC_` values are embedded at build time, so add them before deploying.
4. Deploy using `npm ci` for installation and `npm run build` for the build command.
5. Add the custom domain in Vercel, then update Supabase's Site URL and redirect URL allow list to match the final HTTPS origin. Redeploy after changing build-time environment variables.
6. Smoke-test the deployed site:
   - `/admin` while signed out should redirect to `/admin/login`.
   - A signed-in non-admin should still be denied.
   - The promoted admin should be able to sign in at `/admin/login`.
   - Confirm HTTPS and security response headers in the browser's network panel.

The middleware and server-rendered `/admin` page both verify the Supabase user and the `profiles.role` value. Missing configuration, missing profiles, and non-admin accounts are denied access. The SQL RLS policies are a second authorization boundary for database access. Security headers are configured in `next.config.mjs`; HSTS is sent in production.

## Important production limitation

The booking form, customer account, admin booking list, and booking configuration are still a browser-only demo stored in `localStorage` (`lib/bookings.js` and `lib/bookingConfig.js`). Customer sign-in gates the account route, but these demo bookings are not connected to Supabase or isolated by customer identity. Browser-local data is not shared with the business or other users. The SQL intentionally does not allow anonymous guests to insert bookings. Do not accept real bookings or customer personal data with this demo; a validated, rate-limited server booking flow and database-backed dashboards are required first.

## Project

- `app/` — homepage, booking wizard, account page, and protected admin routes.
- `components/Cinematic.jsx` — six-scene homepage and booking panel.
- `lib/i18n.js` — EN / IT / FR / ES / DE / AR language support.
- `supabase/schema.sql` — profiles, vehicles, tariffs, routes, extras, bookings, and row-level security.
- `public/` — licensed project imagery and logo assets.

Run locally with `npm ci` and `npm run dev`. The site footer still contains a placeholder VAT number; replace it in `components/Footer.jsx` before launch.
