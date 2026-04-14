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

## Mobile version with Expo

There is now a mobile recreation of the project inside [`mobile/`](./mobile).

Core stack:

- Expo SDK 54
- React Native
- NativeWind (Tailwind for React Native)
- AsyncStorage for local persistence

To run it:

```bash
cd mobile
nvm use
npm install
npm run start
```

If you switch the mobile workspace to SDK 54 after editing dependencies, do a clean reinstall first:

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npm run start
```

If you use `nvm`/`fnm`, the mobile app includes [`mobile/.nvmrc`](/Users/franco/Desktop/proyects/Xp/finance-tracker/mobile/.nvmrc) and [`mobile/.node-version`](/Users/franco/Desktop/proyects/Xp/finance-tracker/mobile/.node-version) so you can switch to the project-specific Node version without changing your global one.

Current mobile screens:

- Dashboard
- Transactions
- Accounts
- Budgets
- Categories

## Security checklist

- Keep `SUPABASE_SERVICE_ROLE_KEY` only on the Next.js server in `.env.local` or your hosting provider secrets.
- Apply the RLS script in [`supabase/rls.sql`](./supabase/rls.sql) before using the app in production.
- Apply the hardening script in [`supabase/hardening.sql`](./supabase/hardening.sql) after RLS.
- Apply the shared backend functions in [`supabase/funcions.sql`](./supabase/funcions.sql) after `hardening.sql`.
- Keep `Confirm email` enabled in Supabase Auth.
- Register only your real production callback URL in Supabase `Redirect URLs`.
- Set:

```env
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://your-web-url.com/auth/callback
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://your-web-url.com/auth/callback
```

- The email availability endpoint is rate-limited, but it should still be monitored in production logs.
- Accounts, categories, budgets, saving goals, transactions and transfers now rely on Supabase RPC functions so web and mobile share the same backend rules.
- New users are automatically seeded with `Cuenta principal`, `General` and `Sueldo`.
- Backend operations now write audit rows into `public.audit_events`.
- You can run [`supabase/smoke-tests.sql`](./supabase/smoke-tests.sql) manually after SQL changes to sanity-check backend behavior inside a transaction.
- For production, move the in-memory rate limiter to Redis/Upstash or another shared store before scaling to multiple instances.
- Keep SQL changes versioned in `supabase/` and avoid making schema/security changes only from the dashboard.
- Enable automated backups in Supabase and define a restore procedure before going live.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
