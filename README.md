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

## Auth & account-type architecture

Login is **per account type** — each role gets its own login route and dashboard.

Status:
- [x] **Property Owner** → `/log-in` → `/dashboard` (built)
- [ ] **Property Seeker** → own login route + dashboard (pending Figma)
- [ ] **Real Estate Agent** → own login route + dashboard (pending Figma)
- [ ] **Real Estate Agency or Developer** → own login route + dashboard (pending Figma)

How role is persisted:
- `src/lib/role.ts` — `getRole / setRole / clearRole`, key `rbs-dashboard-role` in `localStorage`.
- Each login page calls `setRole("<Role>")` on submit, then routes into that role's dashboard.
- `src/app/dashboard/layout.tsx` reads the role; missing → redirects to `/log-in`.
- `DashboardSidebar` takes a `role` prop and renders the badge label + (later) role-specific nav.
- Logout in the sidebar calls `clearRole()` and routes back to `/log-in`.

To add a new role: create its login page, write `setRole("<Role>")`, add its nav group(s) in `DashboardSidebar`, branch on `role` to render them.

### Login credentials (prototype)

No backend yet — only the hardcoded credentials in `src/lib/auth.ts` are accepted. Any other email/password combo shows "Invalid email or password."

**URL:** http://localhost:3001/log-in

| Role | Email | Password |
| --- | --- | --- |
| Property Owner | `owner@rbs.com` | `owner123` |
| Property Seeker | `seeker@rbs.com` | `seeker123` |

Add new demo accounts (e.g. for Property Seeker once that dashboard is built) by editing the `CREDENTIALS` array in `src/lib/auth.ts`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
