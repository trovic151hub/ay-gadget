import { useEffect } from 'react'

// Multiple overlays (a drawer plus a confirm modal, say) can be open at
// once, each wanting the background locked. A plain "set then restore"
// effect would have the first one to close unlock scrolling while the
// other is still open, so we reference-count instead: scrolling stays
// locked as long as anything holds a lock, and only clears once the last
// one releases.
let lockCount = 0
let savedScrollY = 0

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return

    if (lockCount === 0) {
      // overflow:hidden alone is well known to NOT stop touch-driven
      // background scroll on iOS Safari -- the page can still be dragged
      // underneath a "locked" modal. The reliable cross-browser fix is to
      // take the body out of the flow entirely: pin it with
      // position:fixed at its current scroll offset (so nothing visibly
      // jumps), which leaves no scrollable content for a touch drag to
      // move. We restore the exact scroll position on unlock.
      savedScrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${savedScrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    }
    lockCount++

    return () => {
      lockCount--
      if (lockCount === 0) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, savedScrollY)
      }
    }
  }, [active])
}
