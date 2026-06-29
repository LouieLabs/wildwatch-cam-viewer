// fetchCaptures — the only data call your gallery needs.
//
// Returns an array of CaptureCard objects matching the shape in
// docs/wildwatch-student-guide.md §04.
//
// Mode switch:
//   VITE_USE_MOCKS=true   → returns filtered mock captures, no network
//   VITE_USE_MOCKS=false  → calls the live /api/captures endpoint with the
//                           current Firebase ID token
//
// Filtering is identical in both modes, so swapping mocks for live data is
// a single env-var flip — no component changes needed.

import { mockCaptures } from "./mockData.js";
import { getAuth } from "firebase/auth";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchCaptures({
  species,
  cameraId,
  after,
  before,
  publicOnly = false,
  limit = 50,
} = {}) {
  const opts = { species, cameraId, after, before, publicOnly, limit };
  return USE_MOCKS ? filterMocks(opts) : fetchFromApi(opts);
}

function filterMocks({ species, cameraId, after, before, publicOnly, limit }) {
  let out = mockCaptures;
  if (publicOnly) out = out.filter((c) => c.public);
  if (species) out = out.filter((c) => c.species === species);
  if (cameraId) out = out.filter((c) => c.cameraId === cameraId);
  if (after) out = out.filter((c) => c.timestamp >= after);
  if (before) out = out.filter((c) => c.timestamp <= before);
  out = [...out].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return Promise.resolve(out.slice(0, limit));
}

async function fetchFromApi(opts) {
  const user = getAuth().currentUser;
  const token = user ? await user.getIdToken() : null;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(opts)) {
    if (v === undefined || v === null || v === false || v === "") continue;
    params.set(k, String(v));
  }
  const res = await fetch(`${API_BASE}/api/captures?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetchCaptures failed: ${res.status}`);
  return res.json();
}
