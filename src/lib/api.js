// ── API LAYER ─────────────────────────────────────────────────────────────────
// Photos come from the live WildWatch backend (the same cloud the cameras
// upload to). Anonymous visitors get only AI-cleared public photos; a signed-in
// @louielabs.com account sees everything — the SERVER decides from the token.
import { auth } from './firebase'

export const API_BASE = 'https://wildlife-dashboard-ee47ntxftq-uw.a.run.app'
export const PAGE_SIZE = 100

// fetch() that carries the signed-in user's token (anonymous when signed out).
export async function authedFetch(url, opts = {}) {
  const headers = { ...(opts.headers || {}) }
  const user = auth.currentUser
  if (user) headers.Authorization = 'Bearer ' + (await user.getIdToken())
  return fetch(url, { ...opts, headers })
}

function captureUrl(signedIn, extra = '') {
  const base = signedIn
    ? `${API_BASE}/api/captures?limit=${PAGE_SIZE}`
    : `${API_BASE}/api/captures?publicOnly=true&limit=${PAGE_SIZE}`
  return base + extra
}

// Fetch a page of capture cards. `before` (epoch ms, exclusive) pages backward
// into history; omit it for the newest page.
export async function fetchCaptures({ signedIn, before } = {}) {
  const url = captureUrl(signedIn, before ? `&before=${before}` : '')
  const res = await authedFetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

// PATCH a capture card (signed-in only). Throws on failure so callers can fall
// back (e.g. a local-only rotation).
export async function patchCapture(id, body) {
  const res = await authedFetch(`${API_BASE}/api/captures/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json().catch(() => ({}))
}

// Persist a photo rotation (signed-in only).
export function patchRotation(id, rotation) {
  return patchCapture(id, { rotation })
}

async function errMsg(res) {
  try {
    return (await res.json()).error || 'HTTP ' + res.status
  } catch {
    return 'HTTP ' + res.status
  }
}

// ── Camera fleet + Wi-Fi admin (signed-in; the server enforces it too). ──
export async function fetchDevices() {
  const res = await authedFetch(API_BASE + '/api/devices')
  if (!res.ok) throw new Error(await errMsg(res))
  return (await res.json()).devices || []
}
export async function fetchNetworks() {
  const res = await authedFetch(API_BASE + '/api/networks')
  if (!res.ok) throw new Error(await errMsg(res))
  return (await res.json()).networks || []
}
export async function renameDevice(id, newId) {
  const res = await authedFetch(API_BASE + '/api/devices/' + encodeURIComponent(id) + '/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newId }),
  })
  if (!res.ok) throw new Error(await errMsg(res))
}
export async function patchDevice(id, body) {
  const res = await authedFetch(API_BASE + '/api/devices/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await errMsg(res))
}
export async function deleteDevice(id) {
  const res = await authedFetch(API_BASE + '/api/devices/' + encodeURIComponent(id), { method: 'DELETE' })
  if (!res.ok) throw new Error(await errMsg(res))
}
export async function revealNetwork(slug) {
  const res = await authedFetch(API_BASE + '/api/networks/' + encodeURIComponent(slug))
  if (!res.ok) throw new Error(await errMsg(res))
  return (await res.json()).network
}
export async function deleteNetwork(slug) {
  const res = await authedFetch(API_BASE + '/api/networks/' + encodeURIComponent(slug), { method: 'DELETE' })
  if (!res.ok) throw new Error(await errMsg(res))
}
export async function addNetwork(ssid, password) {
  const res = await authedFetch(API_BASE + '/api/networks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssid, password }),
  })
  if (!res.ok) throw new Error(await errMsg(res))
}
// Curation: hide every public photo taken before the cutoff (epoch ms).
export async function hideBefore(before) {
  const res = await authedFetch(API_BASE + '/api/captures/hide-before', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ before }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status)
  return data
}

// Ask a camera for a fresh photo (signed-in only). It takes it on its next wake.
export async function takePhoto(deviceId) {
  const res = await authedFetch(API_BASE + '/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, action: 'take_picture' }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'HTTP ' + res.status)
  return true
}

// Nudge the in-cloud AI while anyone has the site open (fire-and-forget; the
// server self-throttles and 404s harmlessly until the route deploys).
export function kickAnalysis() {
  try {
    fetch(`${API_BASE}/api/analyze-cron`, { method: 'POST' }).catch(() => {})
  } catch {
    /* older browsers: never let this break the gallery */
  }
}
