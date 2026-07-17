// ── DELETION (prototype: per-device localStorage) ─────────────────────────────
// Marks captures as "Recently Deleted" with a timestamp. Items stay recoverable
// for 30 days, then are treated as purged — the frontend stops showing them.
//
// This is a per-device prototype: a real implementation needs a backend field +
// endpoint (so a deletion applies for every viewer, like `hidden` does) and a
// scheduled job that permanently removes rows 30 days after `deletedAt`. All of
// that is isolated here, so swapping localStorage for API calls is a one-file
// change.

const DELETED_KEY = 'wildwatch.deleted' // { [photoId]: deletedAtMs }
const MODE_KEY = 'wildwatch.deletionMode' // 'true' | 'false'

export const DELETION_WINDOW_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000
const WINDOW_MS = DELETION_WINDOW_DAYS * DAY_MS

function readMap() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '{}')
  } catch {
    return {}
  }
}
function writeMap(m) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(m))
}

// Drop entries past the 30-day window (a real backend would hard-delete these
// rows from the database; here we just forget them so they stop showing).
export function pruneExpired() {
  const m = readMap()
  const now = Date.now()
  let changed = false
  for (const id in m) {
    if (now - m[id] > WINDOW_MS) {
      delete m[id]
      changed = true
    }
  }
  if (changed) writeMap(m)
}

export function deletedAt(id) {
  const t = readMap()[String(id)]
  return typeof t === 'number' ? t : null
}

// Deleted AND still inside the 30-day recovery window.
export function isRecentlyDeleted(id) {
  const t = deletedAt(id)
  return t != null && Date.now() - t <= WINDOW_MS
}

export function daysSinceDeleted(id) {
  const t = deletedAt(id)
  if (t == null) return null
  return Math.floor((Date.now() - t) / DAY_MS)
}

// Days left before the 30-day permanent purge.
export function daysUntilPurge(id) {
  const t = deletedAt(id)
  if (t == null) return null
  return Math.max(0, Math.ceil((t + WINDOW_MS - Date.now()) / DAY_MS))
}

export function markDeleted(ids) {
  const m = readMap()
  const now = Date.now()
  for (const id of ids) if (m[String(id)] == null) m[String(id)] = now
  writeMap(m)
}

export function restore(ids) {
  const m = readMap()
  for (const id of ids) delete m[String(id)]
  writeMap(m)
}

// ── Deletion mode (gates gallery selection + trash; signed-in only) ──
export function getDeletionMode() {
  return localStorage.getItem(MODE_KEY) === 'true'
}
export function setDeletionMode(on) {
  localStorage.setItem(MODE_KEY, on ? 'true' : 'false')
}
