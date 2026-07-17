import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useCaptures } from './hooks/useCaptures'
import { signIn, signOut } from './lib/firebase'
import { API_BASE } from './lib/api'
import { notifyDetections } from './lib/notifications'
import { getDeletionMode, setDeletionMode as persistDeletionMode, pruneExpired } from './lib/deletion'
import { useToast } from './context/ToastContext'
import AppShell from './components/AppShell'
import LibraryPage from './components/LibraryPage'
import LivePage from './components/LivePage'
import ActivityPage from './components/ActivityPage'
import SettingsPage from './components/SettingsPage'

export default function App() {
  const { user, ready } = useAuth()
  const [page, setPage] = useState('home')
  const toast = useToast()

  // Deletion mode (signed-in only) gates gallery selection + trash. Persisted
  // per-device; the effective value also requires an active sign-in.
  const [deletionMode, setDeletionModeState] = useState(() => getDeletionMode())
  const toggleDeletionMode = () => {
    setDeletionModeState((on) => {
      const next = !on
      persistDeletionMode(next)
      return next
    })
  }
  const deletionEnabled = deletionMode && !!user
  // Forget items whose 30-day window has elapsed (real purge is backend).
  useEffect(() => {
    pruneExpired()
  }, [])

  // Fire browser notifications for genuinely-new detections; clicking one jumps
  // to that photo in the Library.
  const onFresh = useCallback((freshPhotos) => {
    notifyDetections(freshPhotos, (id) => {
      setPage('library')
      window.location.hash = '#photo=' + encodeURIComponent(id)
    })
  }, [])

  const captures = useCaptures({ user, ready, onFresh })

  const onAuth = () => {
    if (user) {
      if (window.confirm('Sign out of ' + (user.email || 'this account') + '?')) {
        signOut().catch((e) => toast('Sign-out failed: ' + e.message))
      }
    } else {
      signIn().catch((e) => toast('Sign-in failed: ' + e.message))
    }
  }

  const onAddCamera = () => window.open(API_BASE + '/provision', '_blank')

  return (
    <AppShell page={page} onNavigate={setPage} user={user} onAuth={onAuth} onAddCamera={onAddCamera}>
      {(page === 'home' || page === 'library') && (
        <LibraryPage
          key={page}
          mode={page}
          captures={captures}
          signedIn={!!user}
          deletionMode={deletionEnabled}
          onNavigate={setPage}
          onAddCamera={onAddCamera}
        />
      )}
      {page === 'live' && <LivePage captures={captures} user={user} signedIn={!!user} />}
      {page === 'activity' && <ActivityPage captures={captures} />}
      {page === 'settings' && (
        <SettingsPage
          captures={captures}
          user={user}
          signedIn={!!user}
          onAuth={onAuth}
          onAddCamera={onAddCamera}
          deletionMode={deletionMode}
          onToggleDeletionMode={toggleDeletionMode}
        />
      )}
    </AppShell>
  )
}
