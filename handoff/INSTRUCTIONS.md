# Pinpoint AI — Claude Code Handoff

## Your job

**Deploy this site. Do not redesign it.**

`index.html` is the production-ready marketing site for Pinpoint AI. Every design, layout, copy, and interaction decision in this file has been reviewed and approved. Your role is to get it online — not to rewrite, restructure, "improve," or reinterpret anything.

If you find yourself considering changes to the visual design, typography, color palette, copy, section order, or component layout: stop. That is out of scope. Ask the user before changing any of those.

## What's in this folder

| File / Folder | Purpose |
|---|---|
| `index.html` | The complete marketing site. Self-contained — all CSS and JS are inline. ~2,870 lines. |
| `icons/` | 11 third-party integration logos referenced by `index.html` via `<img src="icons/...">`. |
| `PinPoint Logo.html` | **Reference file** for the wordmark logo. Contains the light + dark SVG lockups and the dot-alignment algorithm. Do not ship this file — it's a spec. |

## Setup / hosting

You can deploy this as a fully static site on any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3+CloudFront, plain nginx). There is no build step, no framework, no bundler, no package.json. Just serve the directory.

The site depends on these external resources at runtime:
- Google Fonts (`Plus Jakarta Sans`, `Inter`, `DM Mono`) — already loaded via `<link>` tags in `<head>`.
- Nothing else. No analytics, no third-party scripts, no APIs.

### Deployment checklist
1. Copy `index.html` and the `icons/` folder to your host's public directory, preserving the `icons/` subfolder structure.
2. Ensure the server serves `index.html` at `/`.
3. Ensure static files in `icons/` are served with correct `Content-Type` headers (your host should do this automatically based on file extension — `.png`, `.jpeg`, `.webp`).
4. Open the site and verify:
   - The **Pinpoint AI** wordmark in the nav and footer renders with a gold dot perfectly centered above the `ı`.
   - The "Works with" logo strip below the hero scrolls horizontally and shows all 11 integration logos.
   - The problem-diagram section (further down the page) shows integration badges scattered around a central ChatGPT circle.

That's it. Done.

## About the logo — critical context

The wordmark is inline SVG inside `index.html`. It uses two techniques you should understand before touching anything:

### 1. The dotless `ı` (U+0131)
The first letter of "Pınpoint" is **not** a regular lowercase `i`. It's a dotless `ı` (U+0131, LATIN SMALL LETTER DOTLESS I). This is intentional — it removes the font's built-in tittle (the little black dot on a regular `i`) so the custom gold dot is the only dot visible above the stem.

**Do not "fix" this to a regular `i`.** It will look broken if you do.

### 2. Runtime gold-dot alignment
The `<circle class="goldDot">` element above the `ı` has its `cx` attribute recalculated at runtime by JavaScript near the bottom of the `<script>` block. The function is called `alignDotInSvg` (and `alignLogoDots` wraps it for all logos on the page).

**How it works:** `SVGGraphicsElement.getBBox()` on a glyph includes side bearings (the whitespace baked into the glyph box), which means the bbox center is *not* the visual ink center. If you just set `cx` to the bbox center, the dot lands a few pixels off. The correct approach — which this code implements — is to rasterize just the `ı` glyph onto an offscreen canvas at 4× scale, scan pixel columns to find the leftmost and rightmost dark pixels (the true ink extent of the stem), then set `cx` to that measured center. See `PinPoint Logo.html` for the clean standalone version of this algorithm.

**Why this matters for you:** if you change the wordmark font, font weight, font size, letter spacing, or the glyph used for the `ı`, the dot will drift. The alignment script should auto-correct on the next render, but test it. If you switch from Inter to another font, the `getBBox` fallback may look worse than the canvas measurement.

**If you need to edit the logo:** use `PinPoint Logo.html` — it has light and dark lockups side-by-side with Download .svg and Copy SVG buttons. Those exported SVGs have the dot position baked in as a static coordinate (no JS needed) and are what you'd use if you ever need the logo as a standalone asset (e.g. for a favicon, email signature, or social OG image).

## Responsive behavior

The nav collapses to a hamburger menu at **≤1024px** viewport width (not the conventional 768px — this was intentional, because at narrower tablet widths the nav links wrap onto two lines and break the header).

The mobile drawer, backdrop, and hamburger toggle are already wired up. Do not touch them.

## Things to leave alone

Do not, without the user's explicit ask:
- Change fonts (Plus Jakarta Sans for body, Inter for the wordmark, DM Mono for accents).
- Change the color palette (inspect CSS custom properties at the top of the `<style>` block).
- Restructure sections, reorder sections, or rewrite copy.
- Swap the theme from light to dark (or vice versa).
- Replace inline SVG illustrations with icon fonts or image files.
- "Refactor" the inline CSS/JS into external files. (It's intentional — one-file deployability was a design goal.)
- Add a build step, bundler, framework, or package manager.
- Add analytics, cookie banners, chat widgets, or any third-party scripts.

## Things you *can* do without asking

- Fix genuine bugs (broken links, z-index issues, a11y violations).
- Add server-side redirects, `robots.txt`, `sitemap.xml`, favicons, OG images.
- Set up CI/CD and deployment automation.
- Configure CSP / security headers on the host.
- Compress the icon images further if they're unreasonably large (keep visual quality equivalent).

## Icon file manifest

| Filename | Brand | Used in |
|---|---|---|
| `icons/slack-logo.png` | Slack | Logo strip, problem diagram |
| `icons/hubspot.png` | HubSpot | Logo strip, problem diagram |
| `icons/sheets.png` | Google Sheets | Logo strip, problem diagram |
| `icons/salesforce-logo.png` | Salesforce | Logo strip |
| `icons/zapier.png` | Zapier | Logo strip |
| `icons/make.jpeg` | Make | Logo strip |
| `icons/airtable.png` | Airtable | Logo strip |
| `icons/chatgpt.webp` | ChatGPT | Logo strip, problem diagram (center) |
| `icons/gmail.png` | Gmail | Logo strip, problem diagram |
| `icons/clickup.png` | ClickUp | Logo strip |
| `icons/teams.png` | Microsoft Teams | Problem diagram |

All referenced via relative paths like `icons/slack-logo.png` in `index.html`. Keep the folder structure.

## If something looks wrong

Before "fixing" anything, compare to what the user sees. Screenshot the live site, show them, ask. The user has iterated on this design and knows what the intended state is. Your assumption that something is "off" is probably wrong.

---

**Recap of the goal in one sentence:** Deploy `index.html` + `icons/` as a static site, verify the logo and icons render, don't touch the design.
