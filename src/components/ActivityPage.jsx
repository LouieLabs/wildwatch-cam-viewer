import { useMemo } from 'react'
import { fmtAgo, colorFor, CAM_PLACEHOLDER } from '../lib/photos'
import { Icon } from './AppShell'
import { buildCameras } from './LivePage'

// Field Activity Analysis — the Stitch analytics mockup, wired to the real
// loaded captures (ported from the original renderActivity()).
export default function ActivityPage({ captures }) {
  const photos = captures.photos

  const data = useMemo(() => {
    const now = new Date()

    // Photos per day, last 14 days (today on the right). Split each day into
    // AI-detected (named) vs unlabeled ("unknown").
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      days.push({ key: d.toDateString(), label: `${d.getMonth() + 1}/${d.getDate()}`, valid: 0, flagged: 0 })
    }
    const byDay = Object.fromEntries(days.map((d) => [d.key, d]))
    let last14 = 0
    for (const p of photos) {
      const rec = byDay[p.date.toDateString()]
      if (rec) {
        if (p.animal !== 'Unknown') rec.valid++
        else rec.flagged++
        last14++
      }
    }
    const dMax = Math.max(1, ...days.map((d) => d.valid + d.flagged))

    // Busiest hours → six 4-hour buckets.
    const hours = Array.from({ length: 24 }, () => 0)
    for (const p of photos) hours[p.date.getHours()]++
    const buckets = []
    for (let h = 0; h < 24; h += 4) {
      const n = hours[h] + hours[h + 1] + hours[h + 2] + hours[h + 3]
      buckets.push({ label: String(h).padStart(2, '0') + ':00', start: h, n })
    }
    const bMax = Math.max(1, ...buckets.map((b) => b.n))
    const peak = buckets.reduce((m, b) => (b.n > m.n ? b : m), buckets[0])
    const peakLabel = `${String(peak.start).padStart(2, '0')}:00 – ${String((peak.start + 4) % 24).padStart(2, '0')}:00`

    // Animals seen (skip Unknown) with a sample thumbnail per species.
    const animalCounts = new Map()
    const animalThumb = new Map()
    for (const p of photos) {
      if (p.animal === 'Unknown') continue
      animalCounts.set(p.animal, (animalCounts.get(p.animal) || 0) + 1)
      if (!animalThumb.has(p.animal)) animalThumb.set(p.animal, p.thumb)
    }
    const animals = [...animalCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, n]) => ({ name, n, thumb: animalThumb.get(name) }))
    const aMax = animals.length ? animals[0].n : 1

    // Photos per camera.
    const cameras = buildCameras(photos)
      .slice()
      .sort((a, b) => b.photos - a.photos)
      .slice(0, 8)

    const onlineCount = buildCameras(photos).filter((c) => c.status === 'online').length
    const totalCams = new Set(photos.map((p) => p.cameraId)).size
    const uniqueSpecies = animalCounts.size
    const avgPerHour = last14 ? (last14 / (14 * 24)).toFixed(1) : '0.0'

    return { days, dMax, buckets, bMax, peak, peakLabel, animals, aMax, cameras, last14, onlineCount, totalCams, uniqueSpecies, avgPerHour }
  }, [photos])

  const exportCsv = () => {
    const header = ['id', 'timestamp', 'animal', 'camera', 'timeOfDay', 'notes']
    const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
    const lines = [header.join(',')]
    for (const p of photos) {
      lines.push([p.id, p.date.toISOString(), p.animal, p.camera, p.timeOfDay, p.notes].map(esc).join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u
    a.download = 'wildwatch-activity.csv'
    a.click()
    URL.revokeObjectURL(u)
  }

  const card = 'bg-surface p-6 rounded-xl shadow-sm border border-border/50'

  return (
    <>
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <span>Field Analytics</span>
            <Icon name="chevron_right" size="14px" />
            <span className="text-primary font-medium">Activity Report</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-primary">Field Activity Analysis</h1>
          <p className="text-text-secondary max-w-xl mt-1">
            Cross-camera triggers and species frequency across every loaded capture.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface border border-border px-4 py-2 rounded-lg text-button-text font-button-text text-primary flex items-center gap-2">
            <Icon name="calendar_today" size="16px" />
            Loaded captures
          </button>
          <button
            onClick={exportCsv}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-button-text font-button-text flex items-center gap-2 hover:bg-tertiary transition-colors shadow-sm"
          >
            <Icon name="download" size="16px" />
            Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-grid">
        {/* Summary stats */}
        <div className="md:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-gutter-grid mb-4">
          <StatCard label="Total Captures" icon="photo_library" value={photos.length.toLocaleString()} sub={`${data.last14} in the last 14 days`} />
          <StatCard label="Unique Species" icon="pets" iconClass="text-secondary" value={data.uniqueSpecies} sub="AI-named so far" />
          <StatCard
            label="Active Cameras"
            icon="videocam"
            value={`${data.onlineCount} / ${data.totalCams}`}
            sub={data.totalCams - data.onlineCount > 0 ? `${data.totalCams - data.onlineCount} sleeping` : 'all online'}
            subClass={data.totalCams - data.onlineCount > 0 ? 'text-error' : 'text-turkey-sage'}
          />
          <StatCard label="Avg. Triggers/Hr" icon="bolt" iconClass="text-deer-amber" value={data.avgPerHour} sub={`Peak: ${data.peakLabel}`} />
        </div>

        {/* Photos per day */}
        <div className={'md:col-span-8 ' + card}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-primary">Photos per day</h3>
              <p className="text-xs text-text-secondary">Capture frequency over the last 14 days</p>
            </div>
            <div className="flex gap-4">
              <Legend color="bg-primary" label="Detected" />
              <Legend color="bg-deer-amber" label="Unlabeled" />
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-border mb-2">
            <div className="w-full flex items-end gap-2 h-full">
              {data.days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full" title={`${d.label}: ${d.valid + d.flagged} photos`}>
                  <div className="bg-deer-amber/60 rounded-t-sm w-full" style={{ height: `${(d.flagged / data.dMax) * 100}%` }} />
                  <div className="bg-primary rounded-t-sm w-full" style={{ height: `${(d.valid / data.dMax) * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-text-secondary px-2 font-medium uppercase tracking-tighter">
            {data.days.filter((_, i) => i % 2 === 0).map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Busiest hours */}
        <div className={'md:col-span-4 flex flex-col ' + card}>
          <h3 className="font-bold text-primary mb-1">Busiest hours</h3>
          <p className="text-xs text-text-secondary mb-6">Activity heat map by time of day</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full bg-amber-faint/40 rounded-lg flex flex-col gap-3 p-4 justify-between">
              {data.buckets.map((b) => (
                <div key={b.start} className="flex items-center gap-3">
                  <span className="text-[10px] w-8 font-semibold text-text-secondary">{b.label}</span>
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={'h-full rounded-full ' + (b === data.peak ? 'bg-deer-amber' : 'bg-primary')}
                      style={{ width: `${Math.max(4, (b.n / data.bMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 p-3 bg-surface-container rounded-lg">
            <p className="text-xs italic text-text-secondary">
              {data.last14
                ? `Activity peaks around ${data.peakLabel}. Schedule battery checks outside that window.`
                : 'Not enough data yet — activity patterns appear as captures accumulate.'}
            </p>
          </div>
        </div>

        {/* Animals seen */}
        <div className={'md:col-span-6 ' + card}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-primary">Animals seen</h3>
            <span className="text-xs text-turkey-sage font-semibold">Most frequent first</span>
          </div>
          {data.animals.length === 0 ? (
            <p className="text-sm text-text-secondary">No animals identified yet — they show up here as the AI names them.</p>
          ) : (
            <div className="space-y-4">
              {data.animals.map((a) => (
                <div key={a.name} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover" src={a.thumb || CAM_PLACEHOLDER} alt={a.name} loading="lazy" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">{a.name}</span>
                      <span className="text-xs font-bold text-primary">{a.n.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1.5">
                      <div className="h-full rounded-full" style={{ width: `${(a.n / data.aMax) * 100}%`, background: colorFor(a.name) }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos per camera */}
        <div className={'md:col-span-6 ' + card}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-primary">Photos per camera</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-text-secondary border-b border-border">
                  <th className="pb-3 font-semibold">Camera Unit</th>
                  <th className="pb-3 font-semibold text-center">Trigger Count</th>
                  <th className="pb-3 font-semibold text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.cameras.map((c) => (
                  <tr key={c.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={'w-2 h-2 rounded-full ' + (c.status === 'online' ? 'bg-turkey-sage' : 'bg-error')} />
                        <span className="font-medium text-primary">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold text-primary">{c.photos.toLocaleString()}</td>
                    <td className="py-4 text-right text-xs text-text-secondary">
                      {c.latest ? fmtAgo(c.latest.date.getTime()) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spatial heat map (illustrative placeholder — matches the mockup) */}
        <div className="md:col-span-12 relative h-[360px] bg-surface-container rounded-xl overflow-hidden border border-border/50">
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: 'radial-gradient(#6B8E5E 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}
          />
          <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-deer-amber/20 blur-2xl rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-surface/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 max-w-md">
              <Icon name="map" fill size="36px" className="text-primary mb-2" />
              <h4 className="font-headline-md text-headline-md text-primary mb-2">Observation Sector</h4>
              <p className="text-sm text-text-secondary">
                Spatial heat map placeholder. Wiring real camera GPS coordinates is a future enhancement.
              </p>
              <div className="mt-6 flex justify-center gap-3 flex-wrap">
                <MapLegend color="bg-primary" label="High Density" />
                <MapLegend color="bg-deer-amber" label="Medium" />
                <MapLegend color="bg-surface-container-highest" label="Low" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ label, icon, iconClass = 'text-primary', value, sub, subClass = 'text-text-secondary' }) {
  return (
    <div className="bg-surface p-5 rounded-xl shadow-sm border border-border/50">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
        <Icon name={icon} className={iconClass} />
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className={'text-xs mt-1 ' + subClass}>{sub}</div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={'w-3 h-3 rounded-sm ' + color} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

function MapLegend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={'w-3 h-3 rounded-full ' + color} /> {label}
    </div>
  )
}
