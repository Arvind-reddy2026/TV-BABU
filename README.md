# TV Babu — Public Service Website

Production website source for the TV Babu public website, admin panel, citizen portal, and privacy page.

## Included

- `public/` — website pages, styles, scripts, and public brand assets
- `server.js` — Node.js HTTP server and public API routes
- `package.json` — start command and runtime requirement
- `.env.example` — names of optional server-side environment variables (no real credentials)
- `SECURITY-AUDIT.md` — scope, hardening changes, and deployment checks

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and set any required server-side values.
3. Run `npm start`.
4. Open `http://localhost:3000`.

The Supabase project URL and publishable key are used by the browser app. A Supabase publishable/anon key is designed to be visible in client-side code; it is **not** an admin secret. Protect private rows with correctly configured Row Level Security (RLS), grants, and storage policies. Never place a Supabase `service_role`/secret key in this repository or browser code.

## Deploy

Deploy the project using the hosting configuration already used for this site. Configure optional credentials as encrypted environment variables in the hosting provider, not in source files. Use HTTPS in production.

See `SECURITY-AUDIT.md` before deploying. A source-code review cannot verify the live Supabase policies, account settings, backups, provider encryption, or production deployment configuration.

## SEO files

- `public/robots.txt` gives crawlers the sitemap location and excludes admin/citizen interface paths from crawling.
- `public/sitemap.xml` lists the public homepage and privacy notice.
- Homepage includes a canonical URL, descriptive title and description, social sharing metadata, and WebSite/Person structured data.
- Admin, feature-admin, and citizen pages are marked `noindex`. These are discoverability hints, not access controls.

After deployment, verify `https://tv-babu.vercel.app/robots.txt` and `https://tv-babu.vercel.app/sitemap.xml`, then add the domain as a property in Google Search Console and submit the sitemap. Google decides whether and when to index the site; ranking for “TV Babu” is not guaranteed.
