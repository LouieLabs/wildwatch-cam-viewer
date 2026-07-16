import { useCallback, useEffect, useRef, useState } from 'react'
import {
  drawDetBoxes,
  applyRotation,
  effRot,
  groupOf,
  chronoStep,
  groupFaceIndex,
  getCamRotLock,
  setCamRotLock,
  clearCamRotLock,
} from '../lib/photos'
import { patchRotation, patchCapture } from '../lib/api'
import { useToast } from '../context/ToastContext'

// Full-screen photo viewer. Arrows flip through THIS burst only; "Play burst"
// auto-advances chronologically. Rotate saves to the server when signed in,
// else to this browser. Operates over the currently displayed (filtered) list.
export default function Lightbox({
  photos,
  groups,
  index,
  onIndex,
  onClose,
  signedIn,
  onPhotoPatched,
  onBumpRot,
}) {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const playTimer = useRef(null)
  const [redraw, setRedraw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const toast = useToast()

  const p = photos[index]
  const g = p ? groupOf(groups, index) : null
  const inBurst = !!(g && g.len > 1)

  // Where this frame sits inside its burst (chronological), for the arrows/label.
  let pos = 0
  if (inBurst) {
    for (let i = g.start; i < g.start + g.len; i++) {
      if (photos[i].date <= p.date) pos++
    }
  }

  const stopPlay = useCallback(() => {
    if (playTimer.current) {
      clearInterval(playTimer.current)
      playTimer.current = null
    }
    setPlaying(false)
  }, [])

  const nav = useCallback(
    (dir) => {
      stopPlay()
      if (!g || g.len < 2) return
      const ni = chronoStep(photos, g, index, dir)
      if (ni === null) return
      onIndex(ni)
    },
    [g, photos, index, onIndex, stopPlay],
  )

  // Draw the big image's detection boxes + rotation once it has a size.
  useEffect(() => {
    if (!p || p.type === 'video') return
    const img = imgRef.current
    const cv = canvasRef.current
    if (!img || !cv) return
    cv.width = 0
    cv.height = 0
    const draw = () => {
      cv.style.left = img.offsetLeft + 'px'
      cv.style.top = img.offsetTop + 'px'
      drawDetBoxes(img, cv, p.detections)
      applyRotation(img, cv, effRot(p))
    }
    if (img.complete && img.naturalWidth) draw()
    else {
      img.addEventListener('load', draw, { once: true })
      return () => img.removeEventListener('load', draw)
    }
  }, [p, index, redraw])

  // Keyboard: arrows flip the burst, Escape closes.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') nav(-1)
      else if (e.key === 'ArrowRight') nav(1)
      else if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [nav, onClose])

  // Lock body scroll while open; stop playback on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      stopPlay()
    }
  }, [stopPlay])

  const play = () => {
    if (playTimer.current) {
      stopPlay()
      return
    }
    if (!g || g.len < 2) return
    let cur = groupFaceIndex(photos, g) // start at frame 1
    onIndex(cur)
    setPlaying(true)
    playTimer.current = setInterval(() => {
      const gg = groupOf(groups, cur)
      const ni = gg ? chronoStep(photos, gg, cur, 1) : null
      if (ni === null) {
        stopPlay()
        return
      }
      cur = ni
      onIndex(cur)
    }, 450)
  }

  const rotate = async () => {
    if (!p) return
    const next = (effRot(p) + 90) % 360
    if (signedIn) {
      try {
        await patchRotation(p.id, next)
        localStorage.removeItem('wildwatch.rot.' + p.id) // server value rules now
        onPhotoPatched(p.id, { rotation: next })
        toast(next ? `Rotated ${next}° — saved for everyone` : 'Back to upright — saved for everyone')
      } catch {
        localStorage.setItem('wildwatch.rot.' + p.id, String(next))
        toast('Rotated on this device (could not save to the server)')
      }
    } else {
      localStorage.setItem('wildwatch.rot.' + p.id, String(next))
      toast('Rotated on this device — sign in to save it for everyone')
    }
    setRedraw((n) => n + 1)
    onBumpRot?.() // let the grid card behind the lightbox re-apply rotation too
  }

  const toggleHide = async () => {
    if (!p) return
    try {
      await patchCapture(p.id, { hidden: !p.hidden })
      onPhotoPatched(p.id, { hidden: !p.hidden })
      toast(p.hidden ? 'Shown to the public again' : 'Hidden from public')
    } catch {
      toast('Could not update — try again')
    }
  }

  const download = async () => {
    if (!p) return
    try {
      const r = await fetch(p.src)
      const b = await r.blob()
      const u = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = u
      a.download = `${p.animal.replace(/\s+/g, '-').toLowerCase()}-${p.id}.jpg`
      a.click()
      URL.revokeObjectURL(u)
    } catch {
      window.open(p.src, '_blank')
    }
  }

  const share = () => {
    if (!p) return
    const link =
      location.origin + location.pathname + '#photo=' + encodeURIComponent(p.id)
    navigator.clipboard?.writeText(link).then(
      () => toast('Link copied — opens straight to this photo'),
      () => toast(link),
    )
  }

  // Make this photo's rotation the default for every later shot from this camera
  // (this device). Uses the photo's timestamp so only following images inherit it.
  const lockRotation = () => {
    if (!p) return
    const deg = effRot(p)
    setCamRotLock(p.cameraId, deg, p.date.getTime())
    toast(deg ? `Following ${p.camera} photos will auto-rotate ${deg}°` : `Following ${p.camera} photos set upright`)
    setRedraw((n) => n + 1)
    onBumpRot?.()
  }
  const unlockRotation = () => {
    if (!p) return
    clearCamRotLock(p.cameraId)
    toast(`Rotation lock removed for ${p.camera}`)
    setRedraw((n) => n + 1)
    onBumpRot?.()
  }

  if (!p) return null
  const camLock = getCamRotLock(p.cameraId)

  return (
    <div
      className="lightbox open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lightbox-inner">
        <div className="lightbox-img-wrap">
          {inBurst && pos > 1 && (
            <button className="lb-nav lb-prev" onClick={() => nav(-1)}>
              &#8592;
            </button>
          )}
          {p.type === 'video' ? (
            <video ref={videoRef} src={p.src} controls playsInline preload="metadata" />
          ) : (
            <>
              <img ref={imgRef} id="lbImg" src={p.src} alt={p.animal} />
              <canvas ref={canvasRef} style={{ position: 'absolute', pointerEvents: 'none' }} />
            </>
          )}
          {inBurst && pos < g.len && (
            <button className="lb-nav lb-next" onClick={() => nav(1)}>
              &#8594;
            </button>
          )}
        </div>

        <div className="lightbox-meta">
          <button className="lb-close" onClick={onClose}>
            ✕
          </button>
          <div className="lb-animal">
            <span className="dot" style={{ background: p.color }} />
            <span>{p.animal}</span>
          </div>
          <hr className="lb-divider" />
          <div className="lb-field">
            <label>Date &amp; Time</label>
            <span>{p.dateStr}</span>
          </div>
          {inBurst && (
            <div className="lb-field">
              <label>Burst</label>
              <span>{`frame ${pos} of ${g.len} — use the arrows to flip through`}</span>
            </div>
          )}
          <div className="lb-field">
            <label>Camera</label>
            <span>{p.camera}</span>
          </div>
          <div className="lb-field">
            <label>Location</label>
            <span>{p.location || '—'}</span>
          </div>
          <div className="lb-field">
            <label>Time of Day</label>
            <span>{p.timeOfDay}</span>
          </div>
          <div className="lb-field">
            <label>Notes</label>
            <span>{p.notes || '—'}</span>
          </div>
          <hr className="lb-divider" />

          {inBurst && (
            <button className="btn-save" style={{ width: '100%' }} onClick={play}>
              {playing ? '❚❚ Pause' : '▶ Play burst'}
            </button>
          )}
          <button className="btn-secondary" style={{ width: '100%' }} onClick={rotate}>
            ⟳ Rotate 90°
          </button>
          {/* Rotation lock is a curation tool — signed-in Louie Labs users only. */}
          {signedIn && (
            <>
              <button
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={lockRotation}
                title="Use this photo's rotation as the default for every later photo from this camera (this device)."
              >
                🔒 Lock rotation for following images
              </button>
              {camLock && (
                <div style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.4, marginTop: -4 }}>
                  {p.camera} photos from{' '}
                  {new Date(camLock.since).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} on auto-rotate {camLock.deg}°.{' '}
                  <button
                    onClick={unlockRotation}
                    style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
                  >
                    Unlock
                  </button>
                </div>
              )}
            </>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={download}>
              ⬇ Download
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={share}>
              🔗 Share
            </button>
          </div>
          {signedIn && (
            <button className="btn-secondary" style={{ width: '100%' }} onClick={toggleHide}>
              {p.hidden ? '👁 Unhide (show to the public again)' : '🙈 Hide from public'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
