import { useEffect } from 'react'

// Multiple overlays (a drawer plus a confirm modal, say) can be open at
// once, each wanting the background locked. A plain "set then restore"
// effect would have the first one to close unlock scrolling while the
// other is still open, so we reference-count instead: scrolling stays
// locked as long as anything holds a lock, and only clears once the last
// one releases.
let lockCount = 0

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    if (lockCount === 0) document.body.style.overflow = 'hidden'
    lockCount++
    return () => {
      lockCount--
      if (lockCount === 0) document.body.style.overflow = ''
    }
  }, [active])
}
