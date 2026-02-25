# Web Designer Agent Memory — shawnzam.github.io

## Project Overview
- Repo: shawnzam.github.io
- Current host: GitHub Pages at https://shawnzam.github.io/
- Domain registrar: IONOS (zamechek.com registered there)
- Migration target: zamechek.com with a better static host (Cloudflare Pages recommended)
- Google Workspace is tied to zamechek.com — MX/TXT/SPF/DKIM records MUST be preserved

## File Structure
- `index.html` — main site entry point
- `assets/styles.css` — compiled Tailwind CSS (minified output)
- `assets/styles.input.css` — Tailwind source input
- `blog/index.html` — blog listing page
- `blog/rss.xml` — RSS feed
- `blog/<slug>/` — individual blog post directories
- `scripts/build-blog.mjs` — Node.js blog build script
- `tailwind.config.cjs` — Tailwind v3 config
- `package.json` — build scripts: `build:blog` + `build:css`
- `robots.txt`, `sitemap.xml` — SEO files
- `googled82b3837b39c586e.html` — Google Search Console verification file
- `me.JPG` — profile image
- `history.json` — likely blog post history/manifest

## Build System
- Tailwind CSS v3 via npm
- Custom Node.js script for blog generation (`build-blog.mjs`)
- Build command: `npm run build` (runs blog build then CSS minification)
- No framework, no SSR — pure static output

## CSS / Design
- Tailwind CSS v3 utility-first
- Custom input in `assets/styles.input.css`
- Compiled/minified output to `assets/styles.css`

## Deployment Context
- Site is 100% static — no backend, no server-side rendering
- Ideal candidates: Cloudflare Pages, Netlify, Vercel (all support static + build commands)
- Recommended: Cloudflare Pages (free, fast global CDN, handles DNS natively if desired)

## Google Workspace DNS (CRITICAL — do NOT break)
- MX records for Gmail delivery
- TXT records: SPF, DKIM, domain verification
- CNAME records: possibly mail.zamechek.com, autodiscover
- These must be copied verbatim to any new DNS provider BEFORE switching nameservers

## Migration Decision (Feb 2025)
- Recommended strategy: Keep DNS at IONOS, add A/CNAME record pointing to new host
- Alternative: Move DNS to Cloudflare (better performance, free), manually copy all Google Workspace records first
- See `migration.md` for full step-by-step plan details

## Known Files to Deploy
All static files from repo root + subdirs. No server-side processing needed.
The `node_modules/` directory should NOT be deployed.
