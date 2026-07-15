import { useEffect, useMemo, useRef, useState } from 'react'
import { prettyCamName } from '../lib/photos'
import {
  fetchDevices, fetchNetworks, renameDevice, patchDevice, deleteDevice,
  revealNetwork, deleteNetwork, addNetwork, hideBefore, takePhoto,
} from '../lib/api'
import {
  isEnabledPref, disable, requestEnable, toggleWanted, addCustom, removeCustom,
  buildChips, searchSpecies,
} from '../lib/notifications'
import { useToast } from '../context/ToastContext'
import { Icon } from './AppShell'

const online = (lastUpdate) => !!lastUpdate && Date.now() - lastUpdate < 3 * 60 * 1000

// Settings — Account, Detection Notifications, Cameras, Wi-Fi, and Public
// Gallery Curation. Matches the Stitch Settings mockup; all logic ported from
// the original app.
export default function SettingsPage({ captures, user, signedIn, onAuth, onAddCamera }) {
  const toast = useToast()
  const [, setBump] = useState(0)
  const bump = () => setBump((n) => n + 1)

  // ── Detection notifications (localStorage; no account needed) ──
  const seenAnimals = useMemo(
    () => [...new Set(captures.photos.map((p) => p.animal).filter((a) => a !== 'Unknown'))].sort(),
    [captures.photos],
  )
  const chips = buildChips(seenAnimals)
  const notifOn = isEnabledPref()

  const [searchVal, setSearchVal] = useState('')
  const [results, setResults] = useState([])
  const searchTimer = useRef(null)

  const onToggleNotifs = async () => {
    if (isEnabledPref()) {
      disable()
      bump()
      return
    }
    const r = await requestEnable()
    if (r.status === 'unsupported') toast('This browser does not support notifications.')
    else if (r.status === 'denied') toast('Notifications are blocked — allow them in your browser settings, then try again.')
    else toast('Notifications on — try walking past a camera!')
    bump()
  }

  const onSearch = (v) => {
    setSearchVal(v)
    clearTimeout(searchTimer.current)
    const q = v.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      const titleCase = (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1))
      let rows = []
      try {
        rows = await searchSpecies(q)
      } catch {
        /* offline — fall through to add-as-typed */
      }
      if (!rows.some((r) => r.label.toLowerCase() === q.toLowerCase())) {
        rows = [...rows, { label: titleCase(q), sci: '', typed: true }]
      }
      setResults(rows)
    }, 350)
  }
  const onAddSpecies = (name) => {
    addCustom(name)
    setSearchVal('')
    setResults([])
    bump()
    toast(`Added ${name} to your notification list`)
  }

  // ── Camera fleet + Wi-Fi (signed-in) ──
  const [devices, setDevices] = useState([])
  const [networks, setNetworks] = useState([])
  const [adminBlocked, setAdminBlocked] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(false)

  const reloadAdmin = async () => {
    const [d, n] = await Promise.allSettled([fetchDevices(), fetchNetworks()])
    setAdminBlocked(d.status === 'rejected')
    setDevices(d.status === 'fulfilled' ? d.value : [])
    setNetworks(n.status === 'fulfilled' ? n.value : [])
  }

  useEffect(() => {
    if (!signedIn) {
      setDevices([])
      setNetworks([])
      setAdminBlocked(false)
      return
    }
    let alive = true
    setLoadingAdmin(true)
    ;(async () => {
      const [d, n] = await Promise.allSettled([fetchDevices(), fetchNetworks()])
      if (!alive) return
      setAdminBlocked(d.status === 'rejected')
      setDevices(d.status === 'fulfilled' ? d.value : [])
      setNetworks(n.status === 'fulfilled' ? n.value : [])
      setLoadingAdmin(false)
    })()
    return () => {
      alive = false
    }
  }, [signedIn, user])

  // ── Public gallery sweep ──
  const [sweepStatus, setSweepStatus] = useState('')
  const onSweep = async () => {
    if (!signedIn) {
      toast('Sign in with your @louielabs.com account first')
      return
    }
    if (
      !window.confirm(
        'Hide ALL photos taken before right now from the public gallery?\n\nVisitors will no longer see them. You (signed in) still will — marked "Hidden". Nothing is deleted.',
      )
    )
      return
    setSweepStatus('Sweeping…')
    try {
      const data = await hideBefore(Date.now())
      setSweepStatus(
        `Done — ${data.hidden} photo${data.hidden !== 1 ? 's' : ''} hidden` +
          (data.alreadyHidden ? ` (${data.alreadyHidden} already were)` : '') + '.',
      )
      toast('Public gallery swept clean 🧹')
    } catch {
      setSweepStatus('Sweep failed — the backend may not have this route deployed yet.')
    }
  }

  const heading = 'flex items-center gap-2 mb-4'
  const card = 'bg-surface rounded-xl p-6 border border-border shadow-sm'

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-primary">Settings</h2>
        <p className="font-label-sm text-label-sm text-text-secondary">Manage your field station</p>
      </div>

      {/* Account */}
      <section className="mb-12">
        <div className={heading}>
          <Icon name="account_circle" className="text-primary" />
          <h3 className="font-headline-md text-headline-md text-on-surface">Account</h3>
        </div>
        <div className={card + ' flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'}>
          <div>
            <p className="text-text-secondary font-label-sm uppercase tracking-wider mb-1">Status</p>
            {signedIn ? (
              <p className="text-on-surface font-medium">
                Signed in as <span className="text-primary">{user.email}</span>
              </p>
            ) : (
              <p className="text-on-surface font-medium">
                Sign in with your @louielabs.com Google account to manage cameras and Wi-Fi.
              </p>
            )}
          </div>
          {signedIn ? (
            <button
              onClick={onAuth}
              className="px-4 py-2 border border-error text-error rounded-lg font-button-text text-button-text hover:bg-error-container transition-colors self-start"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={onAuth}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-tertiary transition-colors self-start whitespace-nowrap"
            >
              Sign in with Louie Labs
            </button>
          )}
        </div>
      </section>

      {/* Detection Notifications */}
      <section className="mb-12">
        <div className={heading}>
          <Icon name="notifications_active" className="text-primary" />
          <h3 className="font-headline-md text-headline-md text-on-surface">Detection Notifications</h3>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-on-surface font-medium">Notify me about new detections</p>
              <p className="text-text-secondary font-body-md">
                Get instant browser alerts when animals are spotted on your cameras (this device, while a tab is open).
              </p>
            </div>
            <button
              onClick={onToggleNotifs}
              className={'shrink-0 w-11 h-6 rounded-full relative transition-colors ' + (notifOn ? 'bg-primary' : 'bg-surface-container-highest')}
              aria-pressed={notifOn}
            >
              <span className={'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ' + (notifOn ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>

          <p className="text-text-secondary font-label-sm uppercase tracking-wider mb-3">
            Watchlist Species{' '}
            <span className="normal-case tracking-normal text-text-secondary/80">— leave all off to be alerted about every detection</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  toggleWanted(c.name)
                  bump()
                }}
                className={
                  'px-4 py-1.5 rounded-full font-button-text text-button-text border flex items-center gap-2 transition-all ' +
                  (c.active
                    ? 'bg-green-faint text-primary border-primary'
                    : 'bg-surface text-text-secondary border-border hover:border-primary hover:text-primary')
                }
              >
                {c.active && (
                  <Icon name="check_circle" fill size="18px" />
                )}
                {c.name}
                {c.custom && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCustom(c.name)
                      bump()
                    }}
                    className="ml-1 opacity-60 hover:opacity-100"
                    title="Remove"
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Species search (iNaturalist autocomplete) */}
          <div className="mt-4 max-w-md">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
              <Icon name="search" className="text-text-secondary" size="18px" />
              <input
                className="bg-transparent border-none outline-none text-body-md w-full text-on-surface"
                placeholder="Search any species to add (e.g. bobcat, opossum)…"
                value={searchVal}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            {results.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onAddSpecies(r.label)}
                    className="text-left px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary hover:text-primary text-button-text text-text-secondary transition-all"
                  >
                    ＋ {r.typed ? `Add “${r.label}” as typed` : r.label}
                    {r.sci && <em className="opacity-60 ml-1">&nbsp;{r.sci}</em>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cameras */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="photo_camera" className="text-primary" />
            <h3 className="font-headline-md text-headline-md text-on-surface">Cameras</h3>
          </div>
          <button
            onClick={onAddCamera}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-button-text text-button-text flex items-center gap-2 hover:bg-tertiary transition-colors"
          >
            <Icon name="add" size="20px" /> Add a camera
          </button>
        </div>

        {!signedIn ? (
          <div className={card + ' text-text-secondary font-body-md'}>Sign in to manage your cameras.</div>
        ) : loadingAdmin ? (
          <div className={card + ' text-text-secondary font-body-md'}>Loading cameras…</div>
        ) : adminBlocked ? (
          <div className="bg-amber-faint border border-deer-amber/30 rounded-xl p-6 text-text-secondary font-body-md">
            The photo backend hasn't allowed this site to manage cameras yet (a small server update is pending). Photos
            still work — use the admin dashboard for camera changes in the meantime.
          </div>
        ) : devices.length === 0 ? (
          <div className={card + ' text-text-secondary font-body-md'}>No cameras registered yet.</div>
        ) : (
          <div className="space-y-4">
            {devices.map((d) => (
              <CameraRow key={d.deviceId} device={d} networks={networks} onChanged={reloadAdmin} toast={toast} />
            ))}
          </div>
        )}
      </section>

      {/* Wi-Fi Networks */}
      <section className="mb-12">
        <div className={heading}>
          <Icon name="wifi" className="text-primary" />
          <h3 className="font-headline-md text-headline-md text-on-surface">Wi-Fi Networks</h3>
        </div>
        {!signedIn ? (
          <div className={card + ' text-text-secondary font-body-md'}>Sign in to manage saved networks.</div>
        ) : adminBlocked ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={card}>
              <p className="text-text-secondary font-label-sm uppercase tracking-wider mb-4">Saved Networks</p>
              {networks.length === 0 ? (
                <p className="text-text-secondary font-body-md">No saved networks yet — add one.</p>
              ) : (
                <div className="space-y-4">
                  {networks.map((n) => (
                    <NetworkRow key={n.slug} net={n} onChanged={reloadAdmin} toast={toast} />
                  ))}
                </div>
              )}
            </div>
            <AddNetworkForm onChanged={reloadAdmin} toast={toast} />
          </div>
        )}
      </section>

      {/* Public Gallery Curation */}
      <section className="mb-20">
        <div className={heading}>
          <Icon name="visibility_off" className="text-primary" />
          <h3 className="font-headline-md text-headline-md text-on-surface">Public Gallery Curation</h3>
        </div>
        <div className="bg-amber-faint border border-deer-amber/30 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h4 className="font-medium text-on-surface mb-2">Prepare for Public Launch</h4>
              <p className="text-text-secondary text-sm">
                Archive every currently-public photo from the feed, keeping only detections captured from this moment
                forward. Signed-in users still see the archived photos (marked "Hidden") and can unhide any keeper.
                Nothing is deleted.
              </p>
              {sweepStatus && <p className="text-sm text-primary mt-2 font-medium">{sweepStatus}</p>}
            </div>
            <button
              onClick={onSweep}
              className="whitespace-nowrap px-6 py-3 bg-bear-brown text-white rounded-lg font-button-text text-button-text hover:bg-on-background transition-colors flex items-center gap-2"
            >
              <Icon name="history" size="18px" />
              Hide all photos taken before now
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Camera row with inline Wi-Fi / capture editors ──
function CameraRow({ device: d, networks, onChanged, toast }) {
  const [edit, setEdit] = useState(null) // 'wifi' | 'capture' | null
  const [wifiSlug, setWifiSlug] = useState(networks[0]?.slug || '')
  const [capMs, setCapMs] = useState(d.settings?.burstMs || 2000)
  const [capMax, setCapMax] = useState(d.settings?.burstMaxShots || 60)
  const on = online(d.lastUpdate)
  const iconBtn = 'p-2 rounded-lg transition-all text-text-secondary'

  const act = async (fn, okMsg) => {
    try {
      await fn()
      if (okMsg) toast(okMsg)
      setEdit(null)
      onChanged()
    } catch (e) {
      toast(e.message || 'Action failed')
    }
  }

  const rename = () => {
    const newId = window.prompt('New camera id (letters, numbers, - and _ only, 3-40 chars):', d.deviceId)
    if (!newId || newId === d.deviceId) return
    if (!/^[A-Za-z0-9_-]{3,40}$/.test(newId)) {
      toast("That name has characters the system can't use.")
      return
    }
    act(() => renameDevice(d.deviceId, newId), `Rename queued — the camera adopts "${newId}" on its next wake.`)
  }
  const del = () => {
    if (!window.confirm(`Delete camera "${d.deviceId}"?\n\nThis removes its registration. It CANNOT be undone. Photos already in the cloud are NOT touched.`)) return
    act(() => deleteDevice(d.deviceId), `Camera "${d.deviceId}" deleted.`)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={'w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center ' + (on ? 'text-primary' : 'text-text-secondary')}>
            <Icon name="nest_cam_outdoor" className="text-3xl" />
          </div>
          <div>
            <h4 className="font-medium text-on-surface">{prettyCamName(d.deviceId)}</h4>
            <div className="flex gap-4 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-text-secondary text-sm">🔋 {d.battery ?? '—'}%</span>
              <span className="flex items-center gap-1 text-text-secondary text-sm">📶 {d.wifiSsid || '—'}</span>
              <span className={'flex items-center gap-1 font-medium text-sm ' + (on ? 'text-turkey-sage' : 'text-text-secondary')}>
                <span className={'w-2 h-2 rounded-full ' + (on ? 'bg-turkey-sage animate-pulse' : 'bg-gray-fox')} />
                {on ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 self-end md:self-auto">
          <button className={iconBtn + ' hover:text-primary hover:bg-green-faint'} title="Take photo" onClick={() => act(() => takePhoto(d.deviceId), `Asked ${prettyCamName(d.deviceId)} for a photo — arrives on its next wake.`)}>
            <Icon name="photo_camera" />
          </button>
          <button className={iconBtn + ' hover:text-primary hover:bg-green-faint'} title="Wi-Fi" onClick={() => setEdit(edit === 'wifi' ? null : 'wifi')}>
            <Icon name="wifi" />
          </button>
          <button className={iconBtn + ' hover:text-primary hover:bg-green-faint'} title="Capture settings" onClick={() => setEdit(edit === 'capture' ? null : 'capture')}>
            <Icon name="tune" />
          </button>
          <button className={iconBtn + ' hover:text-primary hover:bg-green-faint'} title="Rename" onClick={rename}>
            <Icon name="edit" />
          </button>
          <button className={iconBtn + ' hover:text-error hover:bg-error-container'} title="Delete" onClick={del}>
            <Icon name="delete" />
          </button>
        </div>
      </div>

      {edit === 'wifi' && (
        <div className="flex items-center gap-2 flex-wrap pt-4 mt-4 border-t border-border text-sm">
          {networks.length === 0 ? (
            <span className="text-text-secondary">No saved networks — add one in the Wi-Fi section first.</span>
          ) : (
            <>
              <select value={wifiSlug} onChange={(e) => setWifiSlug(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 bg-white">
                {networks.map((n) => (
                  <option key={n.slug} value={n.slug}>{n.ssid}</option>
                ))}
              </select>
              <button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg" onClick={() => act(() => patchDevice(d.deviceId, { action: 'set_wifi', networkSlug: wifiSlug }), "Wi-Fi change queued for the camera's next wake.")}>
                Apply
              </button>
              <span className="text-text-secondary text-xs">applies on next wake; auto-reverts if it can't connect</span>
            </>
          )}
        </div>
      )}
      {edit === 'capture' && (
        <div className="flex items-center gap-2 flex-wrap pt-4 mt-4 border-t border-border text-sm">
          a photo every
          <input type="number" min={500} max={30000} step={100} value={capMs} onChange={(e) => setCapMs(Number(e.target.value))} className="w-24 border border-border rounded-lg px-2 py-1.5 bg-white" /> ms, up to
          <input type="number" min={1} max={500} value={capMax} onChange={(e) => setCapMax(Number(e.target.value))} className="w-20 border border-border rounded-lg px-2 py-1.5 bg-white" /> per burst
          <button className="px-3 py-1.5 bg-primary text-on-primary rounded-lg" onClick={() => act(() => patchDevice(d.deviceId, { action: 'set_capture_settings', burstMs: capMs, burstMaxShots: capMax }), 'Capture settings saved — picked up on the next wake.')}>
            Apply
          </button>
        </div>
      )}
    </div>
  )
}

function NetworkRow({ net, onChanged, toast }) {
  const [pass, setPass] = useState(null)
  const reveal = async () => {
    try {
      const rec = await revealNetwork(net.slug)
      setPass(rec.password || '(no password)')
    } catch (e) {
      toast('Reveal failed: ' + e.message)
    }
  }
  const del = async () => {
    if (!window.confirm(`Delete saved network "${net.ssid}"?`)) return
    try {
      await deleteNetwork(net.slug)
      toast(`Network "${net.ssid}" deleted.`)
      onChanged()
    } catch (e) {
      toast('Delete failed: ' + e.message)
    }
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <Icon name="wifi" className="text-text-secondary" />
        <span className="font-medium truncate">{net.ssid}</span>
        {pass != null && <span className="text-text-secondary text-sm ml-1">· {pass}</span>}
      </div>
      <div className="flex gap-3 shrink-0">
        <button className="text-primary text-sm font-medium hover:underline" onClick={reveal}>Reveal</button>
        <button className="text-error text-sm font-medium hover:underline" onClick={del}>Delete</button>
      </div>
    </div>
  )
}

function AddNetworkForm({ onChanged, toast }) {
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    if (!ssid.trim()) {
      toast('Enter the network name first.')
      return
    }
    try {
      await addNetwork(ssid.trim(), password)
      toast(`Network "${ssid.trim()}" saved.`)
      setSsid('')
      setPassword('')
      onChanged()
    } catch (e) {
      toast('Saving failed: ' + e.message)
    }
  }
  const field = 'w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none'
  return (
    <div className="bg-surface-container-low border border-border rounded-xl p-6 shadow-sm">
      <p className="text-text-secondary font-label-sm uppercase tracking-wider mb-4">Add a network</p>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">SSID</label>
          <input className={field} placeholder="Network Name" value={ssid} onChange={(e) => setSsid(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">PASSWORD</label>
          <input className={field} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-primary text-on-primary py-2 rounded-lg font-button-text text-button-text mt-2 hover:bg-tertiary transition-colors">
          Save Network
        </button>
      </form>
    </div>
  )
}
