import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

// Subscribes to Firebase auth. `user` is null while signed out (anonymous) and
// `ready` flips true after the first auth callback so the app can wait for the
// real privacy level before its first fetch.
export function useAuth() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  return { user, ready }
}
