import { useCallback, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useCaptures } from './hooks/useCaptures'
import { signIn, signOut } from './lib/firebase'
import { API_BASE } from './lib/api'
import { notifyDetections } from './lib/notifications'
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
        <LibraryPage key={page} mode={page} captures={captures} signedIn={!!user} onNavigate={setPage} onAddCamera={onAddCamera} />
      )}
      {page === 'live' && <LivePage captures={captures} user={user} signedIn={!!user} />}
      {page === 'activity' && <ActivityPage captures={captures} />}
      {page === 'settings' && (
        <SettingsPage captures={captures} user={user} signedIn={!!user} onAuth={onAuth} onAddCamera={onAddCamera} />
      )}
    </AppShell>
  )
}
