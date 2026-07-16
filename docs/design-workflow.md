# Design workflow — Stitch → React → live

How to make **visual changes** to the WildWatch viewer using
[Google Stitch](https://stitch.withgoogle.com) (design, no code) and get them
onto the live site. The app is built to Stitch's "Naturalist" design system, so
Stitch is the natural place to design; this doc covers the bridge from a Stitch
design to the deployed React app.

> **TL;DR** — Design in Stitch → export the screen → hand the export to Claude to
> translate into the React components → the normal branch → PR → preview →
> merge → auto-deploy pipeline ships it. Only the *authoring* step changes; the
> *ship* steps are identical to a code change.

---

## The one thing to understand

Stitch exports **static HTML** (a `code.html` of Tailwind markup, a `DESIGN.md`,
and a `screen.png`). The live app is **React with real data and interactivity**.
So a Stitch export is **not dropped in directly** — it's **re-expressed as
React**: its layout and styling are mapped onto the working components while all
the existing logic (live API data, filters, lightbox, auth, etc.) stays wired.

This translation is a re-implementation, not a copy-paste. Stitch fills screens
with placeholder data ("1,402 captures", stock photos); the real components fill
those slots with live data. We graft Stitch's *look* onto the real components —
we don't overwrite a working component with Stitch's static HTML.

---

## Steps

### 1. Design in Stitch
Edit or regenerate the screen(s) you want to change. Keep the existing
"Naturalist" design system so the export stays on-brand and token-compatible.

### 2. Export from Stitch
You get a per-screen folder containing:

```
stitch_file_based_layout_generator (N)/
  code.html     # Tailwind markup + a tailwind.config with the design tokens
  DESIGN.md     # the design-system spec (colors, type, spacing, components)
  screen.png    # a render of the screen
```

Drop it somewhere in the project (e.g. a `Website Pages/` folder) or share it
directly.

### 3. Hand it off for translation
Say **which screen** it is and **what changed** (or "match this exactly"). The
export gets ported into the right component(s):

| Screen | Component |
|---|---|
| Home / Detections, Library | `src/components/LibraryPage.jsx`, `PhotoCard.jsx` |
| Live | `src/components/LivePage.jsx`, `LiveDetail.jsx` |
| Activity | `src/components/ActivityPage.jsx` |
| Settings | `src/components/SettingsPage.jsx` |
| Sidebar / nav / shell | `src/components/AppShell.jsx` |
| Lightbox | `src/components/Lightbox.jsx` |

If the change is to **colors / fonts / spacing**, the updated tokens from
Stitch's exported `tailwind.config` are synced into this repo's
[`tailwind.config.js`](../tailwind.config.js) — it was lifted from Stitch, so
they stay compatible.

**Partial tweaks are fine.** Stitch regenerates a whole screen, but a change is
diffed against the current component and only the changed parts are applied, so
logic and earlier tweaks aren't clobbered.

### 4. Ship it (same as any code change)
```bash
cd wildwatch-cam-viewer
git checkout main && git pull
git checkout -b my-visual-change
# …translation happens here…
npm run build                       # sanity check
git add -A && git commit -m "…"
git push -u origin my-visual-change
gh pr create --fill
```
Opening the PR triggers a **preview deploy** — a temporary live URL posted as a
PR comment. Review the redesign there, then **merge** → the live-deploy Action
publishes to `wildwatch-cam-viewer.web.app` in ~2 minutes.

---

## When to use Stitch vs. just describe it

- **Use Stitch** for bigger layout changes, new screens, or a restyle you want
  to *see* before committing to it.
- **Just describe it** for small tweaks ("make the buttons bigger", "change the
  green") — usually faster to say in words than to round-trip through Stitch.

Either way, the ship pipeline (branch → PR → preview → merge → deploy) is the
same. See the repo [`README.rebuild.md`](../README.rebuild.md) for the app
structure and the general change loop.
