// ── PHOTO DOMAIN LOGIC ────────────────────────────────────────────────────────
// Ported 1:1 from the original single-file app. Pure functions only — no DOM —
// so they're reusable across the React components and easy to reason about.

export const ANIMAL_COLORS = {
  'White-tailed Deer': '#C4883A',
  'Mule Deer': '#C4883A',
  'Black Bear': '#4A3728',
  Coyote: '#8B7355',
  'Red Fox': '#C1572A',
  'Gray Fox': '#7A7A7A',
  'Wild Turkey': '#6B8E5E',
  Raccoon: '#8B6F47',
  Bobcat: '#A07850',
  'Mountain Lion': '#9B6B4A',
  Unknown: '#9E9E9E',
}

// Live-tile fallback thumbnail when a camera has no photos yet.
export const CAM_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#20261F"/><text x="200" y="158" font-family="sans-serif" font-size="15" fill="#b5b0a8" text-anchor="middle">No photos yet</text></svg>',
  )

export const TIMES = ['Dawn', 'Morning', 'Afternoon', 'Dusk', 'Night']
export const ANIMALS = Object.keys(ANIMAL_COLORS)

// A motion burst shoots every ~2s; photos from the SAME camera within this gap
// collapse into one "event" card. 3 min bridges the chunks of one visit without
// merging separate visits.
export const BURST_GAP_MS = 3 * 60 * 1000

// Turn a raw id/species ("Darius_cam", "red_fox") into a friendly display name.
export function prettify(s) {
  return String(s || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export function prettyCamName(id) {
  const p = prettify(id)
  return /\bcam\b/i.test(p) ? p : p + ' Cam'
}

export function fmtDate(d) {
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  )
}

export function fmtAgo(ms) {
  if (!ms) return 'never'
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 90) return s + 's ago'
  if (s < 5400) return Math.floor(s / 60) + 'm ago'
  if (s < 129600) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export function timeOfDay(d) {
  const h = d.getHours()
  if (h < 6) return 'Night'
  if (h < 8) return 'Dawn'
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  if (h < 20) return 'Dusk'
  return 'Night'
}

// Pick a dot color for a species: exact match, then a keyword guess, else gray.
export function colorFor(animal) {
  if (ANIMAL_COLORS[animal]) return ANIMAL_COLORS[animal]
  const a = (animal || '').toLowerCase()
  if (a.includes('deer')) return ANIMAL_COLORS['White-tailed Deer']
  if (a.includes('bear')) return ANIMAL_COLORS['Black Bear']
  if (a.includes('fox')) return ANIMAL_COLORS['Red Fox']
  if (a.includes('coyote') || a.includes('wolf')) return ANIMAL_COLORS['Coyote']
  if (a.includes('turkey') || a.includes('bird')) return ANIMAL_COLORS['Wild Turkey']
  if (a.includes('raccoon')) return ANIMAL_COLORS['Raccoon']
  if (a.includes('cat') || a.includes('lion') || a.includes('bobcat')) return ANIMAL_COLORS['Bobcat']
  return ANIMAL_COLORS['Unknown']
}

// Map a backend CaptureCard (/api/captures) into the UI's photo object.
export function mapCaptureToPhoto(card, i) {
  const species =
    card.species && card.species !== 'unknown' ? prettify(card.species) : 'Unknown'
  const dt = new Date(card.timestamp || Date.now())
  return {
    id: card.id ?? i,
    src: card.imageUrl,
    thumb: card.imageUrl, // the API returns one signed URL; reuse it for the thumb
    type: card.type === 'video' ? 'video' : 'image',
    animal: species,
    color: colorFor(species),
    cameraId: card.cameraId || 'unknown',
    camera: prettyCamName(card.cameraId), // "Darius_cam" -> "Darius Cam"
    detections: Array.isArray(card.detections) ? card.detections : [],
    location: '',
    date: dt,
    dateStr: fmtDate(dt),
    timeOfDay: timeOfDay(dt),
    notes:
      typeof card.confidence === 'number' && card.confidence > 0
        ? `AI confidence ${Math.round(card.confidence * 100)}%`
        : '',
    rotation: [90, 180, 270].includes(card.rotation) ? card.rotation : 0,
    hidden: card.hidden === true,
  }
}

// A detection = the AI spotted something (bbox) OR it named the animal.
export function isDetection(p) {
  return (p.detections && p.detections.length > 0) || p.animal !== 'Unknown'
}

// ── ROTATION ──────────────────────────────────────────────────────────────────
// The rotation every viewer sees comes from the server (p.rotation). Anonymous
// viewers can still rotate for themselves; that override lives in localStorage
// and wins on this device.
export function effRot(p) {
  const local = localStorage.getItem('wildwatch.rot.' + p.id)
  return local !== null ? ((Number(local) % 360) + 360) % 360 : p.rotation || 0
}

// Rotate an <img> and its detection-overlay canvas together. Quarter turns get
// scaled down so the turned photo still fits the same box.
export function applyRotation(img, canvas, deg) {
  let t = ''
  if (deg) {
    const cw = img.clientWidth,
      ch = img.clientHeight
    const fit = deg % 180 !== 0 && cw && ch ? Math.min(cw, ch) / Math.max(cw, ch) : 1
    t = `rotate(${deg}deg)` + (fit !== 1 ? ` scale(${fit})` : '')
  }
  img.style.transform = t
  if (canvas) canvas.style.transform = t
}

// Draw the AI's boxes over a photo. bbox is in original-image pixels; the img
// uses object-fit:contain, so account for the letterboxed draw area.
export function drawDetBoxes(img, canvas, dets) {
  if (!img || !canvas) return
  const cw = img.clientWidth,
    ch = img.clientHeight
  if (!cw || !img.naturalWidth) return
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, cw, ch)
  if (!dets || !dets.length) return
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
  const offX = (cw - img.naturalWidth * scale) / 2
  const offY = (ch - img.naturalHeight * scale) / 2
  for (const d of dets) {
    const b = d.bbox
    if (!b || !(b.w > 0 && b.h > 0)) continue
    const label = prettify(d.label || '')
    const color = colorFor(label || 'Unknown')
    const x = offX + b.x * scale,
      y = offY + b.y * scale,
      w = b.w * scale,
      h = b.h * scale
    ctx.lineWidth = 2
    ctx.strokeStyle = color
    ctx.strokeRect(x, y, w, h)
    if (label) {
      ctx.font = '600 10px Inter, sans-serif'
      const tw = ctx.measureText(label).width
      ctx.fillStyle = color
      ctx.fillRect(x, Math.max(0, y - 15), tw + 10, 15)
      ctx.fillStyle = '#fff'
      ctx.fillText(label, x + 5, Math.max(11, y - 4))
    }
  }
}

// ── BURST GROUPING ────────────────────────────────────────────────────────────
// Photos from the SAME camera within BURST_GAP_MS of their neighbor collapse
// into one "event" card. The photo list stays flat — a burst is just a
// contiguous run of the sorted list — so lightbox arrows flip through it frame
// by frame with no extra machinery.
export function computeGroups(photos) {
  const groups = []
  for (let i = 0; i < photos.length; i++) {
    const prev = i > 0 ? photos[i - 1] : null
    const g = groups[groups.length - 1]
    if (
      g &&
      prev &&
      photos[i].cameraId === prev.cameraId &&
      Math.abs(prev.date - photos[i].date) <= BURST_GAP_MS
    ) {
      g.len++
    } else {
      groups.push({ start: i, len: 1 })
    }
  }
  return groups
}

// The card face of a group: the burst's chronologically FIRST frame.
export function groupFaceIndex(photos, g) {
  const a = g.start,
    b = g.start + g.len - 1
  return photos[a].date <= photos[b].date ? a : b
}

export function groupOf(groups, idx) {
  return groups.find((g) => idx >= g.start && idx < g.start + g.len) || null
}

// Chronological neighbor inside a group: +1 = next frame, -1 = previous.
export function chronoStep(photos, g, idx, dir) {
  const asc = photos[g.start].date <= photos[g.start + g.len - 1].date
  const ni = idx + (asc ? dir : -dir)
  return ni >= g.start && ni < g.start + g.len ? ni : null
}
