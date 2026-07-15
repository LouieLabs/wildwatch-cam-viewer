// Icon helper — Material Symbols, optionally filled (active nav items).
function Icon({ name, className = '', fill = false, size }) {
  const style = {}
  if (fill) style.fontVariationSettings = "'FILL' 1"
  if (size) style.fontSize = size
  return (
    <span className={'material-symbols-outlined ' + className} style={style}>
      {name}
    </span>
  )
}

const NAV = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'library', label: 'Library', icon: 'library_books' },
  { key: 'live', label: 'Live', icon: 'videocam' },
  { key: 'activity', label: 'Activity', icon: 'list_alt' },
]

// Sidebar + mobile chrome shared by every page. Children render inside <main>.
export default function AppShell({ page, onNavigate, user, onAuth, onAddCamera, children }) {
  const item = (n) => {
    const active = page === n.key
    return (
      <button
        key={n.key}
        onClick={() => onNavigate(n.key)}
        className={
          'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200 ' +
          (active
            ? 'bg-green-faint text-primary'
            : 'text-text-secondary hover:bg-surface-container')
        }
      >
        <Icon name={n.icon} fill={active} />
        <span className="font-body-md text-body-md">{n.label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-low flex-col p-4 z-40">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0">
              <Icon name="landscape" fill size="22px" />
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary leading-none">WildWatch</h1>
              <p className="text-micro-tag font-micro-tag text-text-secondary uppercase tracking-widest mt-0.5">
                Naturalist Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">{NAV.map(item)}</nav>

        <button
          onClick={onAddCamera}
          className="my-4 bg-primary text-on-primary py-3 px-4 rounded-xl font-button-text text-button-text flex items-center justify-center gap-2 shadow-sm hover:bg-tertiary transition-all active:scale-95"
        >
          <Icon name="add" size="18px" />
          Add New Camera
        </button>

        <div className="pt-4 border-t border-border space-y-1">
          <button
            onClick={() => onNavigate('settings')}
            className={
              'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all ' +
              (page === 'settings'
                ? 'bg-green-faint text-primary'
                : 'text-text-secondary hover:bg-surface-container')
            }
          >
            <Icon name="settings" fill={page === 'settings'} />
            <span className="font-body-md text-body-md">Settings</span>
          </button>

          {/* Account / sign-in */}
          <button
            onClick={onAuth}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-text-secondary hover:bg-surface-container transition-all"
            title={user ? user.email + ' — click to sign out' : 'Sign in'}
          >
            {user ? (
              <>
                <span className="w-6 h-6 rounded-full bg-deer-amber text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {(user.email || '?')[0].toUpperCase()}
                </span>
                <span className="font-body-md text-body-md truncate">{user.email}</span>
              </>
            ) : (
              <>
                <Icon name="login" />
                <span className="font-body-md text-body-md">Sign in</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile top header ── */}
      <header className="md:hidden sticky top-0 z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">WildWatch</h1>
        <button onClick={onAuth} className="text-primary flex items-center">
          {user ? (
            <span className="w-8 h-8 rounded-full bg-deer-amber text-white text-sm font-bold flex items-center justify-center">
              {(user.email || '?')[0].toUpperCase()}
            </span>
          ) : (
            <Icon name="account_circle" size="28px" />
          )}
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="md:ml-64 p-page-margin-mobile md:p-page-margin-desktop pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] h-16 flex items-center justify-around z-50">
        {[...NAV, { key: 'settings', label: 'Settings', icon: 'settings' }].map((n) => {
          const active = page === n.key
          return (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              className={'flex flex-col items-center gap-0.5 ' + (active ? 'text-primary' : 'text-text-secondary')}
            >
              <Icon name={n.icon} fill={active} />
              <span className="text-[10px] font-semibold uppercase">{n.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export { Icon }
