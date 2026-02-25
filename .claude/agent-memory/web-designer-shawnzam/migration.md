# Migration Plan: shawnzam.github.io -> zamechek.com

## Decision Context (Feb 2025)
- Static site (Tailwind CSS + Node.js blog build)
- Domain at IONOS, Google Workspace on zamechek.com
- Goal: move hosting to a proper static host, preserve all Google Workspace DNS

## Recommended Host: Cloudflare Pages
Reasons: free tier, global CDN, Git-connected deploys, handles SSL automatically,
and if DNS is also moved to Cloudflare (free), it becomes the single source of
truth for both hosting and DNS — simpler long-term.

## Two DNS Strategies

### Option A: Keep DNS at IONOS (simpler short-term)
- Add an A record or CNAME at IONOS pointing zamechek.com to the new host
- Google Workspace records stay untouched at IONOS
- Risk: IONOS DNS performance is slower; managing DNS in two places

### Option B: Move DNS to Cloudflare (recommended long-term)
- Export/screenshot all IONOS DNS records FIRST
- Add site to Cloudflare (free plan), import records, verify
- Change nameservers at IONOS registrar to Cloudflare nameservers
- Google Workspace records live in Cloudflare DNS — full control, faster

## Build Command for New Host
- Build command: `npm run build`
- Output directory: `/` (repo root — all HTML files are at root or in subdirs)
- Node version: default or 18+
- Note: `node_modules/` must NOT be deployed; host installs deps from package.json

## Key Files That Must Deploy
- index.html (root)
- assets/styles.css
- blog/ (all contents)
- robots.txt, sitemap.xml
- googled82b3837b39c586e.html (Google Search Console)
- me.JPG

## CNAME File for GitHub Pages Custom Domain
If keeping GitHub Pages as origin with custom domain overlay:
- Add file `CNAME` at repo root containing: zamechek.com
- Set custom domain in GitHub Pages settings
- But this approach has limitations — recommend moving off GitHub Pages entirely
