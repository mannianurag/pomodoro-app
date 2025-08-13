import { useEffect, useRef } from 'react'

export function useAudioController({ tickSrc, focusRingSrc, breakRingSrc, volume, muted }) {
  const tickRef = useRef(null)
  const focusRef = useRef(null)
  const breakRef = useRef(null)
  const previewFadeIntervalRef = useRef(null)
  const previewTimeoutRef = useRef(null)

  useEffect(() => {
    tickRef.current = new Audio(tickSrc)
    focusRef.current = new Audio(focusRingSrc)
    breakRef.current = new Audio(breakRingSrc)
    return () => {
      try { tickRef.current && tickRef.current.pause() } catch {}
      try { focusRef.current && focusRef.current.pause() } catch {}
      try { breakRef.current && breakRef.current.pause() } catch {}
    }
  }, [tickSrc, focusRingSrc, breakRingSrc])

  useEffect(() => {
    const v = muted ? 0 : Math.max(0, Math.min(1, volume))
    if (tickRef.current) tickRef.current.volume = v
    if (focusRef.current) focusRef.current.volume = v
    if (breakRef.current) breakRef.current.volume = v
  }, [volume, muted])

  const stopAll = () => {
    try { tickRef.current && tickRef.current.pause() } catch {}
    try { focusRef.current && focusRef.current.pause() } catch {}
    try { breakRef.current && breakRef.current.pause() } catch {}
  }

  const playTick = () => {
    if (muted || !tickRef.current) return
    try { tickRef.current.currentTime = 0; tickRef.current.play() } catch {}
  }

  const playFocusRing = () => {
    if (muted || !focusRef.current) return
    try { focusRef.current.currentTime = 0; focusRef.current.play() } catch {}
  }

  const playBreakRing = () => {
    if (muted || !breakRef.current) return
    try { breakRef.current.currentTime = 0; breakRef.current.play() } catch {}
  }

  const previewVolume = (targetVolumePct) => {
    if (muted || !focusRef.current) return
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current)
    if (previewFadeIntervalRef.current) clearInterval(previewFadeIntervalRef.current)
    const vol = Math.max(0, Math.min(1, Number(targetVolumePct) / 100))
    try { focusRef.current.currentTime = 0; focusRef.current.volume = vol; focusRef.current.play() } catch {}
    const durationMs = 3000
    const steps = 10
    const stepMs = durationMs / steps
    let current = 0
    previewFadeIntervalRef.current = setInterval(() => {
      current += 1
      const remaining = Math.max(0, steps - current)
      const nextVol = (vol * remaining) / steps
      if (focusRef.current) focusRef.current.volume = nextVol
      if (current >= steps) clearInterval(previewFadeIntervalRef.current)
    }, stepMs)
    previewTimeoutRef.current = setTimeout(() => {
      try { focusRef.current && focusRef.current.pause() } catch {}
    }, durationMs + 50)
  }

  return { tickRef, focusRef, breakRef, playTick, playFocusRing, playBreakRing, stopAll, previewVolume }
}


