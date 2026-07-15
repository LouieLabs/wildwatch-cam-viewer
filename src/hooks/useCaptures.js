import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchCaptures, PAGE_SIZE, kickAnalysis } from '../lib/api'
import { mapCaptureToPhoto } from '../lib/photos'

// ── CAPTURES ENGINE ───────────────────────────────────────────────────────────
// Owns the full photo list, paging, the 60s auto-refresh, and "N new photos"
// bookkeeping. Re-pulls whenever the signed-in state changes (different privacy
// level). Mirrors the original single-file app's data loop, in hook form.
export function useCaptures({ user, ready, onFresh }) {
  const [photos, setPhotos] = useState([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const [error, setError] = useState(false)

  // Keep the live list in a ref so the interval + merge always see the latest
  // without re-subscribing on every render.
  const photosRef = useRef([])
  photosRef.current = photos
  const onFreshRef = useRef(onFresh)
  onFreshRef.current = onFresh

  const signedIn = !!user

  // Merge freshly-fetched cards into the list by id. Fetched entries win (their
  // signed image URLs are newer); paged-in history survives a refresh.
  const merge = useCallback((cards) => {
    const fresh = cards.map(mapCaptureToPhoto).filter((p) => p.src)
    const byId = new Map(fresh.map((p) => [p.id, p]))
    for (const p of photosRef.current) if (!byId.has(p.id)) byId.set(p.id, p)
    const next = [...byId.values()].sort((a, b) => b.date - a.date)
    setPhotos(next)
    return fresh.length
  }, [])

  const refresh = useCallback(async () => {
    try {
      const cards = await fetchCaptures({ signedIn })
      const wasEmpty = photosRef.current.length === 0
      if (!wasEmpty) {
        const known = new Set(photosRef.current.map((p) => p.id))
        const freshCards = cards.filter((c) => c.id && !known.has(c.id))
        if (freshCards.length > 0) {
          setNewCount((n) => n + freshCards.length)
          // Hand the new arrivals to the notifier (mapped to photo objects).
          onFreshRef.current?.(freshCards.map(mapCaptureToPhoto).filter((p) => p.src))
        }
      }
      merge(cards)
      if (wasEmpty) setHasMore(cards.length >= PAGE_SIZE)
      setError(false)
    } catch (e) {
      // A failed refresh shouldn't wipe a working gallery — keep what we have.
      console.error('[wildwatch] failed to load captures:', e)
      if (photosRef.current.length === 0) setError(true)
    }
  }, [signedIn, merge])

  // Fetch the page BEFORE the oldest photo we have and append it.
  const loadMore = useCallback(async () => {
    if (loadingMore || !photosRef.current.length) return
    setLoadingMore(true)
    try {
      const oldestMs = photosRef.current[photosRef.current.length - 1].date.getTime()
      const cards = await fetchCaptures({ signedIn, before: oldestMs })
      setHasMore(cards.length >= PAGE_SIZE)
      merge(cards)
    } catch (e) {
      console.error('[wildwatch] failed to load older photos:', e)
      throw e
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, signedIn, merge])

  // (Re)load whenever the auth state resolves or flips. Reset history flag so a
  // fresh privacy level starts from its own newest page.
  useEffect(() => {
    if (!ready) return
    setPhotos([])
    photosRef.current = []
    setHasMore(false)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, signedIn])

  // Keep the gallery fresh: new uploads appear within a minute, no reload.
  useEffect(() => {
    if (!ready) return
    const t = setInterval(refresh, 60000)
    return () => clearInterval(t)
  }, [ready, refresh])

  // Nudge the in-cloud AI while the site is open (fire-and-forget).
  useEffect(() => {
    kickAnalysis()
    const t = setInterval(kickAnalysis, 120000)
    return () => clearInterval(t)
  }, [])

  const dismissNew = useCallback(() => {
    setNewCount(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Update one photo in place (used after a rotation is saved).
  const patchPhoto = useCallback((id, patch) => {
    setPhotos((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  return {
    photos,
    hasMore,
    loadingMore,
    loadMore,
    newCount,
    dismissNew,
    error,
    patchPhoto,
  }
}
