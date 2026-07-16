import { useEffect, useMemo, useRef, useState } from 'react'
import { computeGroups, groupFaceIndex, isDetection, colorFor } from '../lib/photos'
import { useToast } from '../context/ToastContext'
import { Icon } from './AppShell'
import PhotoCard from './PhotoCard'
import Lightbox from './Lightbox'

// Home (mode="home", detections only) and Library (mode="library", everything),
// laid out to match the Stitch "Detections" mockup.
export default function LibraryPage({ mode, captures, signedIn, onNavigate, onAddCamera }) {
  const { photos, hasMore, loadingMore, loadMore, newCount, dismissNew, error, patchPhoto } =
    captures
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [animalSel, setAnimalSel] = useState('')
  const [cameraSel, setCameraSel] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortMode, setSortMode] = useState('newest')
  const [showBoxes, setShowBoxes] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [rotVersion, setRotVersion] = useState(0)
  const deepLinkDone = useRef(false)

  const animalOptions = useMemo(() => [...new Set(photos.map((p) => p.animal))].sort(), [photos])
  const cameraOptions = useMemo(() => [...new Set(photos.map((p) => p.camera))].sort(), [photos])

  // Top named species for the "Common Species Found" avatar cluster.
  const topSpecies = useMemo(() => {
    const counts = new Map()
    for (const p of photos) if (p.animal !== 'Unknown') counts.set(p.animal, (counts.get(p.animal) || 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name)
  }, [photos])

  const displayed = useMemo(() => {
    const base = mode === 'home' ? photos.filter(isDetection) : photos
    const sorted = [...base]
    if (sortMode === 'newest') sorted.sort((a, b) => b.date - a.date)
    else if (sortMode === 'oldest') sorted.sort((a, b) => a.date - b.date)
    else if (sortMode === 'animal') sorted.sort((a, b) => a.animal.localeCompare(b.animal))
    else if (sortMode === 'camera') sorted.sort((a, b) => a.camera.localeCompare(b.camera))

    const q = searchQuery.toLowerCase()
    const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : null
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null
    return sorted.filter((p) => {
      if (q) {
        const hit =
          p.animal.toLowerCase().includes(q) ||
          p.camera.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (animalSel && p.animal !== animalSel) return false
      if (cameraSel && p.camera !== cameraSel) return false
      if (from && p.date < from) return false
      if (to && p.date > to) return false
      return true
    })
  }, [photos, mode, sortMode, searchQuery, animalSel, cameraSel, dateFrom, dateTo])

  const groups = useMemo(() => computeGroups(displayed), [displayed])

  const title = mode === 'home' ? 'Detections' : 'Photo Library'
  const countText =
    groups.length === displayed.length
      ? `${displayed.length} photo${displayed.length !== 1 ? 's' : ''}`
      : `${groups.length} event${groups.length !== 1 ? 's' : ''} · ${displayed.length} photos`

  const anyFilter = !!(searchQuery || animalSel || cameraSel || dateFrom || dateTo)
  const clearFilters = () => {
    setSearchQuery('')
    setAnimalSel('')
    setCameraSel('')
    setDateFrom('')
    setDateTo('')
  }

  // Lightbox index derived from open photo id (survives filter/refresh reorders).
  const lbIndex = openId == null ? -1 : displayed.findIndex((p) => String(p.id) === String(openId))
  useEffect(() => {
    if (openId != null && lbIndex < 0) setOpenId(null)
  }, [openId, lbIndex])
  useEffect(() => {
    if (openId != null && lbIndex >= 0) {
      history.replaceState(null, '', '#photo=' + encodeURIComponent(openId))
    } else if (deepLinkDone.current) {
      history.replaceState(null, '', location.pathname + location.search)
    }
  }, [openId, lbIndex])
  useEffect(() => {
    if (deepLinkDone.current || !displayed.length) return
    const m = location.hash.match(/photo=([^&]+)/)
    if (m) {
      const id = decodeURIComponent(m[1])
      if (displayed.some((p) => String(p.id) === id)) setOpenId(id)
    }
    deepLinkDone.current = true
  }, [displayed])

  // Open the photo when the hash changes (e.g. a clicked notification).
  useEffect(() => {
    const onHash = () => {
      const m = location.hash.match(/photo=([^&]+)/)
      if (!m) return
      const id = decodeURIComponent(m[1])
      if (displayed.some((p) => String(p.id) === id)) setOpenId(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [displayed])

  const selectCls =
    'bg-surface-container-low border-none rounded-lg text-body-md py-2 px-4 focus:ring-1 focus:ring-primary cursor-pointer text-on-surface'
  const fieldLabel = 'text-micro-tag font-micro-tag text-text-secondary block mb-1 uppercase'

  return (
    <>
      {/* Notification pill */}
      {newCount > 0 && (
        <div className="flex justify-center mb-8">
          <button
            onClick={dismissNew}
            className="pulse-notification flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-full hover:bg-tertiary transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-button-text font-button-text">
              {newCount} new photo{newCount !== 1 ? 's' : ''} — tap to see
            </span>
          </button>
        </div>
      )}

      {/* Hero header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-1">{title}</h2>
          <p className="text-text-secondary font-body-md">
            {error ? 'could not load photos — retrying…' : `${countText} · AI-named as detections come in`}
          </p>
        </div>
        {topSpecies.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {topSpecies.map((s) => (
                <div
                  key={s}
                  title={s}
                  className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center text-xs font-bold"
                  style={{ color: colorFor(s) }}
                >
                  {s.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-micro-tag font-micro-tag text-text-secondary uppercase">Common Species Found</span>
          </div>
        )}
      </div>

      {/* Filter card */}
      <section className="bg-surface p-4 rounded-xl shadow-sm border border-border/40 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4 flex-1">
            <div className="flex-1 min-w-[180px]">
              <label className={fieldLabel}>Search</label>
              <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
                <Icon name="search" className="text-text-secondary" size="18px" />
                <input
                  className="bg-transparent border-none outline-none text-body-md w-full text-on-surface"
                  placeholder="Animals, cameras, notes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Animal</label>
              <select className={selectCls} value={animalSel} onChange={(e) => setAnimalSel(e.target.value)}>
                <option value="">All Animals</option>
                {animalOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={fieldLabel}>Camera</label>
              <select className={selectCls} value={cameraSel} onChange={(e) => setCameraSel(e.target.value)}>
                <option value="">All Cameras</option>
                {cameraOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={fieldLabel}>Start Date</label>
              <input type="date" className={selectCls} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className={fieldLabel}>End Date</label>
              <input type="date" className={selectCls} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <label className={fieldLabel}>Sort</label>
              <select className={selectCls} value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="animal">Animal type</option>
                <option value="camera">Camera</option>
              </select>
            </div>
            {anyFilter && (
              <button onClick={clearFilters} className="text-button-text text-text-secondary underline pb-2">
                Clear
              </button>
            )}
          </div>

          {/* Show bounding boxes toggle */}
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg self-start lg:self-end">
            <span className="text-body-md text-text-secondary whitespace-nowrap">Show bounding boxes</span>
            <button
              onClick={() => setShowBoxes((s) => !s)}
              className={'w-10 h-5 rounded-full relative transition-colors ' + (showBoxes ? 'bg-primary' : 'bg-gray-fox')}
              aria-pressed={showBoxes}
            >
              <span
                className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ' + (showBoxes ? 'left-[22px]' : 'left-0.5')}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Grid / empty */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
          <Icon name="search_off" size="40px" className="mb-2" />
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
            {mode === 'home' ? 'No detections yet' : 'No photos found'}
          </h3>
          <p className="font-body-md">
            {mode === 'home'
              ? 'When the AI spots an animal in a photo, it shows up here.'
              : 'Try adjusting your filters or search terms.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter-grid">
          {groups.map((g) => {
            const faceIdx = groupFaceIndex(displayed, g)
            const p = displayed[faceIdx]
            return (
              <PhotoCard
                key={p.id}
                photo={p}
                groupLen={g.len}
                signedIn={signedIn}
                showBoxes={showBoxes}
                rotVersion={rotVersion}
                onOpen={() => setOpenId(p.id)}
              />
            )
          })}
        </div>
      )}

      {/* Home → jump to the full Library; Library → page in older photos. */}
      <div className="flex justify-center mt-12 mb-4">
        {mode === 'home'
          ? displayed.length > 0 && (
              <button
                className="px-8 py-3 border border-outline rounded-lg text-primary font-button-text text-button-text hover:bg-surface-container transition-all flex items-center gap-2 group"
                onClick={() => onNavigate('library')}
              >
                View all photos in Library
                <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </button>
            )
          : hasMore &&
            displayed.length > 0 && (
              <button
                className="px-8 py-3 border border-outline rounded-lg text-primary font-button-text text-button-text hover:bg-surface-container transition-all flex items-center gap-2 group disabled:opacity-50"
                disabled={loadingMore}
                onClick={() => loadMore().catch(() => toast('Could not load older photos — try again'))}
              >
                {loadingMore ? 'Loading…' : 'Load more photos'}
                {!loadingMore && <Icon name="expand_more" className="group-hover:translate-y-0.5 transition-transform" />}
              </button>
            )}
      </div>

      {/* Floating action button */}
      <button
        onClick={onAddCamera}
        title="Add a new camera"
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Icon name="add" size="28px" className="group-hover:rotate-90 transition-transform" />
      </button>

      {lbIndex >= 0 && (
        <Lightbox
          photos={displayed}
          groups={groups}
          index={lbIndex}
          onIndex={(ni) => setOpenId(displayed[ni].id)}
          onClose={() => setOpenId(null)}
          signedIn={signedIn}
          onPhotoPatched={patchPhoto}
          onBumpRot={() => setRotVersion((v) => v + 1)}
        />
      )}
    </>
  )
}
