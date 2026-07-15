// ── DETECTION NOTIFICATIONS ───────────────────────────────────────────────────
// Per-browser (localStorage). The captures refresh loop calls notifyDetections()
// when NEW photos arrive; a browser notification fires if it matches the chosen
// species (or any detection when none are chosen). Ported from the original app.
import { isDetection } from './photos'

const ENABLED_KEY = 'wildwatch.notif.enabled'
const ANIMALS_KEY = 'wildwatch.notif.animals'
const CUSTOM_KEY = 'wildwatch.notif.customAnimals'

// The always-offered starter list (project pick), in this order.
export const NOTIF_DEFAULT_ANIMALS = [
  'Squirrel', 'Rat', 'Mouse', 'Dog', 'Domestic Dog', 'Coyote', 'Deer', 'Raccoon', 'Person',
]

const readArr = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]')
  } catch {
    return []
  }
}

export const isEnabledPref = () => localStorage.getItem(ENABLED_KEY) === 'true'
export const notifEnabled = () =>
  isEnabledPref() && 'Notification' in window && Notification.permission === 'granted'
export const getWanted = () => readArr(ANIMALS_KEY)
export const getCustom = () => readArr(CUSTOM_KEY)
const setEnabledPref = (b) => localStorage.setItem(ENABLED_KEY, b ? 'true' : 'false')

export function disable() {
  setEnabledPref(false)
}

// Turn on: ask for browser permission first. Returns the outcome.
export async function requestEnable() {
  if (!('Notification' in window)) return { status: 'unsupported' }
  const perm = await Notification.requestPermission()
  if (perm === 'granted') {
    setEnabledPref(true)
    return { status: 'granted' }
  }
  return { status: 'denied' }
}

export function toggleWanted(name) {
  const list = getWanted()
  const i = list.findIndex((a) => a.toLowerCase() === name.toLowerCase())
  if (i >= 0) list.splice(i, 1)
  else list.push(name)
  localStorage.setItem(ANIMALS_KEY, JSON.stringify(list))
}

export function addCustom(name) {
  const custom = getCustom()
  if (
    !custom.some((a) => a.toLowerCase() === name.toLowerCase()) &&
    !NOTIF_DEFAULT_ANIMALS.some((a) => a.toLowerCase() === name.toLowerCase())
  ) {
    custom.push(name)
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom))
  }
  // Adding a species means "I want to hear about it" — select it right away.
  const list = getWanted()
  if (!list.some((a) => a.toLowerCase() === name.toLowerCase())) {
    list.push(name)
    localStorage.setItem(ANIMALS_KEY, JSON.stringify(list))
  }
}

export function removeCustom(name) {
  localStorage.setItem(
    CUSTOM_KEY,
    JSON.stringify(getCustom().filter((a) => a.toLowerCase() !== name.toLowerCase())),
  )
  localStorage.setItem(
    ANIMALS_KEY,
    JSON.stringify(getWanted().filter((a) => a.toLowerCase() !== name.toLowerCase())),
  )
}

// Chip list = starter list (fixed order) + species the AI has seen here +
// user-added species. Deduped case-insensitively, starters first.
export function buildChips(seenAnimals) {
  const custom = getCustom()
  const customSet = new Set(custom.map((a) => a.toLowerCase()))
  const wanted = getWanted().map((a) => a.toLowerCase())
  const out = []
  const have = new Set()
  for (const a of [...NOTIF_DEFAULT_ANIMALS, ...seenAnimals, ...custom]) {
    const key = a.toLowerCase()
    if (have.has(key)) continue
    have.add(key)
    out.push({ name: a, active: wanted.includes(key), custom: customSet.has(key) })
  }
  return out
}

// Whole-word match in either direction: "Deer" covers "Mule Deer", "Dog" covers
// "Domestic Dog" — but "Rat" does NOT match "Muskrat".
export function animalMatches(chip, animal) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    new RegExp(`\\b${esc(chip)}\\b`, 'i').test(animal) ||
    new RegExp(`\\b${esc(animal)}\\b`, 'i').test(chip)
  )
}

// Fire notifications for genuinely-new detections. onOpen(id) runs on click.
export function notifyDetections(freshPhotos, onOpen) {
  if (!notifEnabled()) return
  const wanted = getWanted()
  for (const p of freshPhotos) {
    if (!isDetection(p)) continue
    if (wanted.length && !wanted.some((w) => animalMatches(w, p.animal))) continue
    try {
      const title =
        p.animal !== 'Unknown' ? `${p.animal} spotted at ${p.camera}!` : `Something spotted at ${p.camera}!`
      const n = new Notification(title, {
        body: `${p.dateStr} — click to see the photo`,
        icon: p.thumb || undefined,
        tag: 'wildwatch-' + p.id,
      })
      n.onclick = () => {
        window.focus()
        onOpen?.(String(p.id))
        n.close()
      }
    } catch {
      /* some mobile browsers need a service worker — fail quietly */
    }
  }
}

// Autocomplete against iNaturalist's public species database (free, no key).
// Throws on network failure so the caller can still offer the typed text.
export async function searchSpecies(q) {
  const titleCase = (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1))
  const res = await fetch(
    `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(q)}&per_page=8&is_active=true`,
  )
  const data = await res.json()
  return (data.results || [])
    .filter((t) => !['Plantae', 'Fungi', 'Chromista', 'Protozoa'].includes(t.iconic_taxon_name))
    .filter((t) => t.preferred_common_name || t.name)
    .slice(0, 6)
    .map((t) => ({
      label: titleCase(t.preferred_common_name || t.name),
      sci: t.name && t.preferred_common_name ? t.name : '',
    }))
}
