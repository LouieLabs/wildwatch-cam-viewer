# WildWatch — Camera Gallery (student build)

Starter app for the WildWatch camera viewer section of louielabs.com. Built with
**Vite + React + Tailwind**. Your job is to design and build the gallery; auth
and the data API are wired for you.

> Read the full build guide first: [`docs/wildwatch-student-guide.md`](../Wildlife-cam/docs/wildwatch-student-guide.md)
> (in the `Wildlife-cam` repo).

---

## Quick start

```bash
git clone https://github.com/LouieLabs/wildwatch-cam-viewer
cd wildwatch-cam-viewer
npm install
cp .env.example .env.local
# (no values to fill in for Day 1 — mocks work out of the box)
npm run dev
```

Open <http://localhost:5173>. You should see "50 captures loaded" — that's the
mock data. Now go build the gallery in `src/components/`.

---

## What's pre-built (don't edit)

| Path | Purpose |
|---|---|
| `src/api/fetchCaptures.js` | The only data call your gallery needs. Toggles between mocks and the live API via `VITE_USE_MOCKS`. |
| `src/api/mockData.js` | 50 realistic captures matching the guide's `CaptureCard` shape. |
| `src/auth/firebase.js` | Firebase init + Google sign-in restricted to `@louielabs.com`. |
| `src/auth/AuthProvider.jsx` | React context — use `useAuth()` to get `{ user, loading }`. |
| `src/auth/SignIn.jsx` | Sign-in / sign-out button. |
| `firebase.json`, `.firebaserc` | Firebase Hosting deploy config. |

## What you build

| Path | Purpose |
|---|---|
| `src/components/` | Your gallery: `GalleryGrid.jsx`, `CaptureCard.jsx`, `FilterBar.jsx`, `Lightbox.jsx`. |
| `src/App.jsx` | Replace the stub in `<main>` with your components. Auth + data fetch are already wired around it. |

---

## How sign-in affects what you see

Behind the scenes, `fetchCaptures` passes `publicOnly: !user`. So:

- **Not signed in:** 44 public captures (no deterrent-cam shots, no dogs).
- **Signed in (any `@louielabs.com` account):** all 50 captures, including the 6 private ones.

Use this to test your auth-aware UI: sign out, sign in, watch the count change.

---

## Team workflow

Per the `CLAUDE.md` rule in the `Wildlife-cam` repo:

1. Create a feature branch: `git checkout -b feature/<yourname>-gallery`
2. Push your branch — GitHub Actions deploys it to a **preview channel** with
   its own URL (~`https://wildwatch-cam-viewer--<branch>-abc123.web.app`). The
   URL gets posted into the PR.
3. When the admin merges to `main`, that version replaces the live site.

2–3 students will each work on their own `feature/<name>-gallery` branch in
parallel. The admin reviews previews side-by-side and cherry-picks the best
components into `main` for the merged final version.

For future iterations after the first merge: same workflow — new branch, new
preview URL, new merge.

---

## Stage 2 — switching off mocks (later, by admin)

When the live `/api/captures` endpoint is ready in the `Wildlife-cam` `web/`
service, the admin flips `VITE_USE_MOCKS=false` in the GitHub Actions env, and
everything continues to work — the fetch signature is identical.
