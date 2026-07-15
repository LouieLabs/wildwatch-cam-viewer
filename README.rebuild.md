# WildWatch — React (Vite + Tailwind)

An idiomatic React conversion of the original single-file `index.html` WildWatch
app, rebuilt to match the **Google Stitch "Naturalist"** mockups (sidebar shell,
hero headers, filter card, bento grids) while keeping all the working logic.

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173  (see note below)
npm run build    # production build → dist/
```

> **Important — use port 5173.** The live backend's CORS allowlist only accepts
> `http://localhost:5173`. The dev script is fine, but if 5173 is already taken
> Vite will silently move to 5174 and the photo API will fail with
> "could not load photos." Free the port first:
> `lsof -ti:5173 | xargs kill -9`, or run `npm run dev -- --port 5173 --strictPort`.

## Design system

Tailwind is configured with the exact tokens exported from Stitch
(`tailwind.config.js`) — the same color names (`primary`, `green-faint`,
`fox-orange`, `deer-amber`, …), typography (`font-headline-lg`, `text-micro-tag`,
…), and spacing. Material Symbols + DM Serif Display + Inter are loaded in
`index.html`. `src/styles.css` retains the original CSS only for the pieces that
weren't restructured (the lightbox and the live camera control panel).

## Status

**Complete — all five pages** (Home, Library, Live, Activity, Settings) match
their Stitch mockups with the original logic wired in:

- **AppShell** — sidebar (brand, nav, Add New Camera, Settings, sign-in), mobile
  top bar + bottom nav.
- **Home** (`Detections`) & **Library** (all photos) — hero header with capture
  count + "Common Species Found" avatars, the filter card (search + Animal /
  Camera selects + date range + sort + **Show bounding boxes** toggle), the bento
  photo grid, "View Complete History", and the floating **+** button.
- **Live** — the Stitch camera grid (hero tile + online/sleeping surface cards,
  battery/updated meta) and stats bar, plus the fully functional single-camera
  **detail view**: newest-photo/MJPEG stream, wheel-zoom + drag-pan, Request
  fresh photo, pause/resume, stream-address override, presets, and the complete
  image-control panel.
- **Data / auth / lightbox** — Firebase Google sign-in, `/api/captures` with
  anonymous vs signed-in privacy, 60s refresh, pagination, burst grouping, and
  the lightbox (detection overlay, burst nav + play, rotate, download, share,
  hide) — all carried over.
- **Activity** — the Stitch analytics dashboard wired to real data: stat cards,
  photos-per-day chart (detected vs unlabeled), busiest-hours heatmap +
  recommendation, animals-seen ranked list, photos-per-camera table, and a
  working **Export CSV**.
- **Settings** — Account, Detection Notifications (browser-permission toggle,
  watchlist chips, iNaturalist species autocomplete, and live firing when new
  detections arrive), Camera fleet admin (take photo / rename / Wi-Fi / capture
  settings / delete), Wi-Fi network management, and the "hide all before now"
  public-gallery sweep.

The whole app is ported. Camera/Wi-Fi admin and the gallery sweep require a
signed-in `@louielabs.com` account and a backend that allows this origin; signed
out, those sections show sign-in prompts (as designed).

## Structure

```
src/
  main.jsx                 entry + Tailwind + ToastProvider
  App.jsx                  auth + page routing (AppShell)
  tailwind.css             @tailwind + custom utilities (bento-grid, glass-dark…)
  styles.css               legacy CSS for lightbox + live control panel only
  lib/      firebase.js  api.js  photos.js  notifications.js
  hooks/    useAuth.js   useCaptures.js
  context/  ToastContext.jsx
  components/
    AppShell.jsx  LibraryPage.jsx  PhotoCard.jsx  Lightbox.jsx
    LivePage.jsx  LiveDetail.jsx   ActivityPage.jsx   SettingsPage.jsx
```

## Notes

- Filters apply **live** (the original required an "Apply" click); the date range
  and "Show bounding boxes" toggle are now wired.
- The public feed currently returns captures as `species: "unknown"`, so
  **Home/Detections** is legitimately empty until the AI labels photos — the
  **Library** tab shows everything. This matches the original app.
