import { useEffect, useRef, useState } from 'react'
import { fmtAgo, prettyCamName, CAM_PLACEHOLDER } from '../lib/photos'
import { takePhoto } from '../lib/api'
import { useToast } from '../context/ToastContext'

// Single-camera live view, ported from the original firmware-style panel.
// Two modes, picked automatically: a saved local stream address plays the real
// MJPEG stream; otherwise the camera's newest photo is shown and auto-refreshed
// (field cameras deep-sleep and can't stream continuously).

const SEL_DEFAULTS = {
  framesize: 8, quality: 12, brightness: 0, contrast: 0, saturation: 0,
  special_effect: 0, wb_mode: 0, ae_level: 0, aec_value: 300, agc_gain: 0, gainceiling: 0,
}
const TOG_DEFAULTS = {
  whitebal: 1, awb_gain: 1, exposure_ctrl: 1, aec2: 1, gain_ctrl: 1,
  wpc: 1, raw_gma: 1, lenc: 1, dcw: 1, bpc: 0, hmirror: 0, vflip: 0, colorbar: 0,
}

const PRESETS = {
  underwater: { whitebal: 1, awb_gain: 1, wb_mode: 2, special_effect: 0, saturation: 2, contrast: 1, brightness: 1, ae_level: 1, exposure_ctrl: 1, aec2: 1, gain_ctrl: 1, gainceiling: 3, raw_gma: 1, lenc: 1 },
  daylight: { whitebal: 1, awb_gain: 1, wb_mode: 1, special_effect: 0, saturation: 0, contrast: 0, brightness: 0, ae_level: 0, exposure_ctrl: 1, aec2: 1, gain_ctrl: 1, agc_gain: 0, gainceiling: 0, raw_gma: 1, lenc: 1 },
  night: { whitebal: 1, awb_gain: 1, wb_mode: 0, special_effect: 0, saturation: 0, contrast: 1, brightness: 1, ae_level: 2, exposure_ctrl: 1, aec2: 1, gain_ctrl: 1, gainceiling: 6, raw_gma: 1, lenc: 1 },
}

const FRAMESIZES = [
  [13, 'UXGA (1600x1200)'], [12, 'SXGA (1280x1024)'], [11, 'HD (1280x720)'], [10, 'XGA (1024x768)'],
  [9, 'SVGA (800x600)'], [8, 'VGA (640x480)'], [6, 'HVGA (480x320)'], [5, 'CIF (400x296)'],
  [4, 'QVGA (320x240)'], [3, '240x240'], [1, 'QQVGA (160x120)'], [0, '96x96'],
]
const EFFECTS = [[0, 'None'], [1, 'Negative'], [2, 'Grayscale'], [3, 'Red Tint'], [4, 'Green Tint'], [5, 'Blue Tint'], [6, 'Sepia']]
const WB_MODES = [[0, 'Auto'], [1, 'Sunny'], [2, 'Cloudy'], [3, 'Office'], [4, 'Home']]
const GAIN_CEIL = [[0, '2x'], [1, '4x'], [2, '8x'], [3, '16x'], [4, '32x'], [5, '64x'], [6, '128x']]

export default function LiveDetail({ camera, captures, user, onBack }) {
  const toast = useToast()
  const imgRef = useRef(null)
  const wrapRef = useRef(null)
  const camRef = useRef(camera)
  camRef.current = camera
  const refreshTimer = useRef(null)

  const [zoom, setZoom] = useState(100)
  const pan = useRef({ x: 0, y: 0 })
  const [streaming, setStreaming] = useState(true)
  const streamingRef = useRef(true)
  streamingRef.current = streaming
  const [status, setStatus] = useState('Ready')
  const [note, setNote] = useState('')
  const [sel, setSel] = useState(SEL_DEFAULTS)
  const [tog, setTog] = useState(TOG_DEFAULTS)
  const [hostVersion, setHostVersion] = useState(0)

  const getHost = () => localStorage.getItem('wildwatch.host.' + camera.id) || ''

  const applyTransform = () => {
    const img = imgRef.current
    if (!img) return
    img.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${zoom / 100})`
  }
  useEffect(applyTransform, [zoom])

  const showLatest = () => {
    if (!streamingRef.current) return
    const cam = camRef.current
    const img = imgRef.current
    if (!img) return
    const latest = cam.latest
    img.src = latest ? latest.src : CAM_PLACEHOLDER
    setStatus(latest ? `Newest photo · taken ${fmtAgo(latest.date.getTime())}` : 'No photos from this camera yet')
  }

  // Set up the stream/newest-photo mode when the camera (or saved host) changes.
  useEffect(() => {
    const img = imgRef.current
    const host = getHost()
    setStreaming(true)
    streamingRef.current = true
    clearInterval(refreshTimer.current)
    setNote('')

    const startPhotoMode = (msg) => {
      setNote(msg)
      showLatest()
      refreshTimer.current = setInterval(showLatest, 15000)
    }

    if (host) {
      setStatus('Connecting to local stream…')
      img.onload = () => setStatus('Streaming (local network)')
      img.onerror = () => {
        img.onload = null
        img.onerror = null
        startPhotoMode('Local stream unreachable — showing the newest uploaded photo instead. It refreshes automatically.')
      }
      img.src = host + ':81/stream'
    } else {
      startPhotoMode(
        "This camera sleeps between wake-ups to save battery, so it can't stream continuously — showing its newest photo. New uploads appear automatically. Use \"Request fresh photo\" to ask for a new shot on its next wake (~30 s).",
      )
    }
    return () => {
      clearInterval(refreshTimer.current)
      if (img) {
        img.onload = null
        img.onerror = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.id, hostVersion])

  // Reflect newest captures pushed in by the 60s refresh.
  useEffect(() => {
    if (streamingRef.current && !getHost()) showLatest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.latest])

  // Wheel zoom + drag pan.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const onWheel = (e) => {
      e.preventDefault()
      setZoom((z) => Math.max(100, Math.min(500, z + (e.deltaY < 0 ? 25 : -25))))
    }
    let dragging = false
    let sx = 0, sy = 0, px = 0, py = 0
    const onDown = (e) => {
      if (zoom <= 100) return
      dragging = true
      wrap.classList.add('dragging')
      sx = e.clientX; sy = e.clientY; px = pan.current.x; py = pan.current.y
    }
    const onMove = (e) => {
      if (!dragging) return
      pan.current = { x: px + (e.clientX - sx), y: py + (e.clientY - sy) }
      applyTransform()
    }
    const onUp = () => {
      dragging = false
      wrap.classList.remove('dragging')
    }
    wrap.addEventListener('wheel', onWheel, { passive: false })
    wrap.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      wrap.removeEventListener('wheel', onWheel)
      wrap.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  const resetZoom = () => {
    pan.current = { x: 0, y: 0 }
    setZoom(100)
  }

  const requestFresh = async () => {
    if (!user) {
      toast('Sign in to request a fresh photo.')
      return
    }
    try {
      await takePhoto(camera.id)
      setStatus("Fresh photo requested — arrives after the camera's next wake (~30-60 s)")
      toast(`Asked ${prettyCamName(camera.id)} for a photo.`)
    } catch (e) {
      toast('Take photo failed: ' + e.message)
    }
  }

  const toggleStream = () => {
    const img = imgRef.current
    if (streaming) {
      img.dataset.src = img.src
      img.removeAttribute('src')
      setStreaming(false)
      streamingRef.current = false
      setStatus('Stream paused')
    } else {
      setStreaming(true)
      streamingRef.current = true
      const host = getHost()
      img.src = img.dataset.src || (host ? host + ':81/stream' : CAM_PLACEHOLDER)
      setStatus('Resumed')
    }
  }

  const setHost = () => {
    const cur = getHost()
    const v = prompt(
      'Local stream address for ' + camera.name + ' (a camera running the streaming firmware on your network), e.g. http://192.168.1.42\n\nLeave empty to use newest-photo mode.',
      cur,
    )
    if (v === null) return
    const host = v.trim().replace(/\/$/, '')
    if (host) localStorage.setItem('wildwatch.host.' + camera.id, host)
    else localStorage.removeItem('wildwatch.host.' + camera.id)
    resetZoom()
    setHostVersion((n) => n + 1)
  }

  // ── Camera controls (push to the device's /control endpoint; fails quietly
  // in the prototype but the UI still reflects the change). ──
  const camSet = (k, v) => {
    setStatus(k + ' = ' + v)
    const host = getHost()
    if (host) {
      try {
        fetch(host + '/control?var=' + encodeURIComponent(k) + '&val=' + encodeURIComponent(v)).catch(() => {})
      } catch {
        /* ignore in prototype */
      }
    }
  }
  const setSelVal = (k, v) => {
    setSel((s) => ({ ...s, [k]: v }))
    camSet(k, v)
  }
  const toggle = (k) => {
    setTog((t) => {
      const nv = t[k] ? 0 : 1
      camSet(k, nv)
      return { ...t, [k]: nv }
    })
  }
  const applyPreset = (preset) => {
    setSel((s) => {
      const ns = { ...s }
      for (const k in preset) if (k in SEL_DEFAULTS) ns[k] = preset[k]
      return ns
    })
    setTog((t) => {
      const nt = { ...t }
      for (const k in preset) if (k in TOG_DEFAULTS) nt[k] = preset[k]
      return nt
    })
    for (const k in preset) camSet(k, preset[k])
    setStatus('Preset applied')
  }

  const Range = ({ k, min, max, label }) => (
    <div className="live-row">
      <label>
        {label} <span className="val">{sel[k]}</span>
      </label>
      <input type="range" min={min} max={max} value={sel[k]} onChange={(e) => setSelVal(k, Number(e.target.value))} />
    </div>
  )
  const Select = ({ k, options, label }) => (
    <div className="live-row">
      <label>{label}</label>
      <select value={sel[k]} onChange={(e) => setSelVal(k, Number(e.target.value))}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  )
  const Toggle = ({ k, label }) => (
    <div className="live-toggle">
      <span>{label}</span>
      <div className={'live-switch' + (tog[k] ? ' on' : '')} onClick={() => toggle(k)} />
    </div>
  )

  return (
    <div className="live-detail">
      <div className="live-main">
        <button className="live-back" onClick={onBack}>
          ← All cameras
        </button>
        <div className="live-stream-wrap" ref={wrapRef}>
          <img id="liveStream" ref={imgRef} draggable="false" alt="" />
          <div className="live-overlay">
            <span className="live-dot" />
            LIVE · <span>{camera.name}</span>
          </div>
          <div className="live-zoom-badge">{(zoom / 100).toFixed(1)}x</div>
          {note && <div className="live-demo-note">{note}</div>}
        </div>
        <div className="live-hint">Scroll to zoom · drag to pan</div>
        <div className="live-actions">
          <button className="btn-save" onClick={requestFresh}>
            Request fresh photo
          </button>
          <button className="btn-secondary" onClick={toggleStream}>
            {streaming ? 'Pause' : 'Resume'}
          </button>
          <button className="btn-secondary" onClick={resetZoom}>
            Reset Zoom
          </button>
          <button className="btn-secondary" onClick={setHost} title="Watch the true live stream if this camera runs the streaming firmware on your network.">
            Stream address…
          </button>
        </div>
        <div className="live-status">{status}</div>
      </div>

      <div className="live-panel">
        <div className="live-presets">
          <button className="preset p-uw" onClick={() => applyPreset(PRESETS.underwater)}>Underwater</button>
          <button className="preset p-day" onClick={() => applyPreset(PRESETS.daylight)}>Daylight</button>
          <button className="preset p-night" onClick={() => applyPreset(PRESETS.night)}>Night</button>
        </div>
        <div className="live-cols">
          <div className="live-group">
            <h4>Zoom</h4>
            <div className="live-row">
              <label>
                Zoom <span className="val">{(zoom / 100).toFixed(1)}x</span>
              </label>
              <input type="range" min={100} max={500} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </div>
          </div>

          <div className="live-group">
            <h4>Resolution &amp; Quality</h4>
            <Select k="framesize" options={FRAMESIZES} label="Frame Size" />
            <Range k="quality" min={4} max={63} label="JPEG Quality" />
          </div>

          <div className="live-group">
            <h4>Image</h4>
            <Range k="brightness" min={-2} max={2} label="Brightness" />
            <Range k="contrast" min={-2} max={2} label="Contrast" />
            <Range k="saturation" min={-2} max={2} label="Saturation" />
            <Select k="special_effect" options={EFFECTS} label="Special Effect" />
          </div>

          <div className="live-group">
            <h4>White Balance</h4>
            <Toggle k="whitebal" label="Auto White Balance" />
            <Toggle k="awb_gain" label="AWB Gain" />
            <Select k="wb_mode" options={WB_MODES} label="WB Mode" />
          </div>

          <div className="live-group">
            <h4>Exposure &amp; Gain</h4>
            <Toggle k="exposure_ctrl" label="Auto Exposure" />
            <Toggle k="aec2" label="AEC DSP" />
            <Range k="ae_level" min={-2} max={2} label="AE Level" />
            <Range k="aec_value" min={0} max={1200} label="Exposure" />
            <Toggle k="gain_ctrl" label="Auto Gain" />
            <Range k="agc_gain" min={0} max={30} label="Gain" />
            <Select k="gainceiling" options={GAIN_CEIL} label="Gain Ceiling" />
          </div>

          <div className="live-group">
            <h4>Pixel Processing</h4>
            <div className="live-grid2">
              <Toggle k="bpc" label="BPC" />
              <Toggle k="wpc" label="WPC" />
              <Toggle k="raw_gma" label="Gamma" />
              <Toggle k="lenc" label="Lens Corr" />
              <Toggle k="hmirror" label="H Mirror" />
              <Toggle k="vflip" label="V Flip" />
              <Toggle k="dcw" label="DCW" />
              <Toggle k="colorbar" label="Color Bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
