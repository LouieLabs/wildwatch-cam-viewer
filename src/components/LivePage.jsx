import { useMemo, useState } from 'react'
import { fmtAgo, CAM_PLACEHOLDER } from '../lib/photos'
import { Icon } from './AppShell'
import LiveDetail from './LiveDetail'

// Derive the camera fleet from the photos (each camera's newest capture +
// count; "online" = checked in within ~3 min). Mirrors the original buildCameras
// minus the signed-in /api/devices enrichment.
export function buildCameras(photos) {
  const byId = {}
  for (const p of photos) {
    if (!byId[p.cameraId]) byId[p.cameraId] = { id: p.cameraId, name: p.camera, photos: 0, latest: null }
    const c = byId[p.cameraId]
    c.photos++
    if (!c.latest || p.date > c.latest.date) c.latest = p
  }
  return Object.values(byId)
    .map((c) => {
      const ref = c.latest ? c.latest.date.getTime() : 0
      const status = ref && Date.now() - ref < 3 * 60 * 1000 ? 'online' : 'offline'
      return {
        ...c,
        status,
        streaming: false,
        host: localStorage.getItem('wildwatch.host.' + c.id) || '',
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

const camThumb = (c) => (c.latest && c.latest.thumb) || CAM_PLACEHOLDER

export default function LivePage({ captures, user, signedIn }) {
  const cameras = useMemo(() => buildCameras(captures.photos), [captures.photos])
  const [openId, setOpenId] = useState(null)
  const [onlyOnline, setOnlyOnline] = useState(false)

  const openCam = cameras.find((c) => c.id === openId)
  if (openCam) {
    return <LiveDetail camera={openCam} captures={captures} user={user} onBack={() => setOpenId(null)} />
  }

  const shown = onlyOnline ? cameras.filter((c) => c.status === 'online') : cameras
  const onlineCount = cameras.filter((c) => c.status === 'online').length
  const newest = cameras.reduce((m, c) => Math.max(m, c.latest ? c.latest.date.getTime() : 0), 0)
  const [hero, ...rest] = shown

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Live Cameras</h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Monitoring {cameras.length} field station{cameras.length !== 1 ? 's' : ''} · {onlineCount} online now.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyOnline((v) => !v)}
            className={
              'border rounded-lg px-4 py-2 flex items-center gap-2 transition-colors ' +
              (onlyOnline ? 'bg-green-faint border-primary text-primary' : 'bg-surface border-border text-on-surface')
            }
          >
            <Icon name="filter_list" className="text-[20px]" />
            <span className="font-button-text text-button-text">{onlyOnline ? 'Online only' : 'All cameras'}</span>
          </button>
        </div>
      </header>

      {cameras.length === 0 ? (
        <p className="text-body-md text-text-secondary">No cameras have posted photos yet.</p>
      ) : (
        <>
          {/* Bento camera grid */}
          <div className="bento-grid">
            {hero && <HeroTile cam={hero} onOpen={() => setOpenId(hero.id)} />}
            {rest.map((c) => (
              <CamCard key={c.id} cam={c} onOpen={() => setOpenId(c.id)} />
            ))}
          </div>

          {/* Stats bar */}
          <div className="mt-12 p-6 bg-surface-container-high rounded-xl flex flex-wrap gap-8 items-center justify-between border border-border">
            <div className="flex gap-10 flex-wrap">
              <Stat label="Cameras Online" value={`${onlineCount} / ${cameras.length}`} />
              <Stat label="Total Captures" value={captures.photos.length.toLocaleString()} />
              <Stat label="Newest Capture" value={newest ? fmtAgo(newest) : '—'} />
            </div>
            <div className="flex items-center gap-2">
              <Icon name="info" className="text-text-secondary" />
              <span className="font-body-md text-body-md text-text-secondary">Gallery refreshes automatically</span>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-micro-tag text-micro-tag text-text-secondary uppercase tracking-widest mb-1">{label}</p>
      <p className="font-headline-md text-headline-md text-primary">{value}</p>
    </div>
  )
}

function batteryIcon(pct) {
  if (pct == null) return 'battery_unknown'
  if (pct >= 90) return 'battery_full'
  if (pct >= 60) return 'battery_6_bar'
  if (pct >= 30) return 'battery_3_bar'
  return 'battery_low'
}

// Large primary tile (spans 2×2).
function HeroTile({ cam, onOpen }) {
  const online = cam.status === 'online'
  return (
    <div
      onClick={onOpen}
      className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-xl bg-dark-asset shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="w-full h-full min-h-[300px] relative">
        <img className="w-full h-full object-cover" src={camThumb(cam)} alt={cam.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <div
            className={
              'text-white px-2 py-1 rounded-md flex items-center gap-1 font-micro-tag text-micro-tag ' +
              (online ? 'bg-turkey-sage' : 'glass-dark')
            }
          >
            <span className={'w-2 h-2 bg-white rounded-full ' + (online ? '' : 'opacity-60')} />
            {online ? 'ONLINE' : 'SLEEPING'}
          </div>
          <div className="glass-dark text-white px-2 py-1 rounded-md font-micro-tag text-micro-tag flex items-center gap-1">
            <Icon name="photo_camera" size="14px" />
            {cam.photos} shots
          </div>
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
          <div>
            <span className="font-micro-tag text-micro-tag tracking-widest text-on-primary-container uppercase">
              {cam.latest ? fmtAgo(cam.latest.date.getTime()) : 'no photos'}
            </span>
            <h3 className="font-headline-md text-headline-md">{cam.name}</h3>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-colors">
            <Icon name="fullscreen" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Small surface card.
function CamCard({ cam, onOpen }) {
  const online = cam.status === 'online'
  return (
    <div
      onClick={onOpen}
      className={
        'relative group overflow-hidden rounded-xl bg-surface shadow-sm border border-border transition-all duration-300 hover:shadow-md cursor-pointer' +
        (online ? '' : ' grayscale-[0.5] hover:grayscale-0')
      }
    >
      <div className="aspect-video w-full relative">
        <img className="w-full h-full object-cover" src={camThumb(cam)} alt={cam.name} loading="lazy" />
        {online ? (
          <div className="absolute top-3 left-3 bg-turkey-sage/90 text-white px-2 py-1 rounded font-micro-tag text-micro-tag flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            ONLINE
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="glass-dark px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
              <Icon name="bedtime" className="text-white" size="18px" />
              <span className="text-white font-micro-tag text-micro-tag">SLEEPING</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className={'font-button-text text-button-text font-bold ' + (online ? 'text-primary' : 'text-text-secondary')}>
            {cam.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 text-text-secondary font-label-sm text-label-sm">
          <Icon name={online ? 'schedule' : 'history'} size="16px" />
          {cam.latest ? `Updated: ${fmtAgo(cam.latest.date.getTime())}` : 'No photos yet'}
          <span className="opacity-50">·</span>
          {cam.photos} photo{cam.photos !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
