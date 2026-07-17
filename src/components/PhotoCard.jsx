import { useEffect, useRef } from 'react'
import { drawDetBoxes, applyRotation, effRot } from '../lib/photos'
import { Icon } from './AppShell'

// Bento photo card (Stitch "Naturalist" style): green glass pill badge, an
// always-on gradient meta bar, and the AI detection canvas pinned over the image
// (toggled by `showBoxes`). One card = the face of a burst group.
//
// Selection (Google-Photos style): when `selectable`, a checkbox reveals on
// hover (always visible in `selectionMode`); toggling it calls `onToggleSelect`.
// While in selection mode, clicking the card body toggles selection instead of
// opening the lightbox.
export default function PhotoCard({
  photo,
  groupLen,
  signedIn,
  showBoxes,
  rotVersion,
  onOpen,
  selectable = false,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}) {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  const isVideo = photo.type === 'video'
  const isHidden = signedIn && photo.hidden

  useEffect(() => {
    if (isVideo) return
    const img = imgRef.current
    const cv = canvasRef.current
    if (!img || !cv) return
    const go = () => {
      drawDetBoxes(img, cv, showBoxes ? photo.detections : [])
      applyRotation(img, cv, effRot(photo))
    }
    if (img.complete && img.naturalWidth) go()
    else {
      img.addEventListener('load', go, { once: true })
      return () => img.removeEventListener('load', go)
    }
  }, [photo, isVideo, showBoxes, rotVersion])

  const toggle = (e) => {
    e.stopPropagation()
    onToggleSelect?.(e.shiftKey)
  }

  return (
    <div
      onClick={selectable && selectionMode ? toggle : onOpen}
      className={
        'group relative bg-surface rounded-xl overflow-hidden shadow-md border border-border/40 transition-all duration-300 cursor-pointer ' +
        (selected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'hover:-translate-y-1 hover:shadow-xl') +
        (isHidden ? ' opacity-55' : '')
      }
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-dark-asset flex items-center justify-center">
        {isVideo ? (
          photo.thumb ? (
            <>
              <img ref={imgRef} className="w-full h-full object-contain" src={photo.thumb} alt={photo.animal} loading="lazy" />
              <span className="absolute w-12 h-12 rounded-full glass-dark border border-white/60 text-white flex items-center justify-center pl-0.5">
                ▶
              </span>
            </>
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl">▶</div>
          )
        ) : (
          <>
            <img ref={imgRef} className="w-full h-full object-contain" src={photo.thumb} alt={photo.animal} loading="lazy" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          </>
        )}

        {/* Selection tint */}
        {selected && <div className="absolute inset-0 bg-primary/25 pointer-events-none z-10" />}

        {/* Selection checkbox (top-left) */}
        {selectable && (
          <button
            onClick={toggle}
            title={selected ? 'Deselect' : 'Select'}
            className={
              'absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all ' +
              (selected
                ? 'bg-primary text-white opacity-100 scale-100'
                : 'bg-black/30 backdrop-blur-sm border-2 border-white/90 text-transparent hover:bg-black/50 ' +
                  (selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'))
            }
          >
            <Icon name="check" size="16px" />
          </button>
        )}

        {/* Animal pill (top-left; slides right to make room for the checkbox) */}
        <div
          className={
            'absolute top-3 left-3 z-10 bg-primary/80 backdrop-blur-md text-white text-micro-tag font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-transform ' +
            (selectable ? (selectionMode ? 'translate-x-8' : 'group-hover:translate-x-8') : '')
          }
        >
          {photo.animal}
        </div>

        {/* Burst count (top-right) */}
        {groupLen > 1 && (
          <div className="absolute top-3 right-3 z-10 glass-dark text-white text-micro-tag font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            ▸ {groupLen} shots
          </div>
        )}
        {isHidden && (
          <div
            className="absolute right-3 z-10 text-white text-micro-tag font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ top: groupLen > 1 ? 44 : 12, background: 'rgba(155,40,40,0.75)' }}
          >
            Hidden
          </div>
        )}

        {/* Meta bar (always on) */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
          <p className="text-[10px] font-micro-tag text-white/80 uppercase mb-0.5 truncate">{photo.camera}</p>
          <div className="flex items-center gap-2 text-white text-xs font-medium">
            <span className="flex items-center gap-1">
              <Icon name="schedule" size="14px" />
              {photo.dateStr}
            </span>
            <span className="opacity-50">•</span>
            <span>{photo.timeOfDay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
