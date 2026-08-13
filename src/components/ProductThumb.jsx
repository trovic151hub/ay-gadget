import { useState } from 'react'
import { ImageOff } from 'lucide-react'

// Swaps to the placeholder icon if the image URL is missing OR fails to
// load (a plain <img src="broken-url"> just renders a tiny/invisible
// broken-image glyph, especially on a dark background -- easy to miss
// entirely). Assumes the parent already centers its content
// (flex items-center justify-center) and sets the box size.
export default function ProductThumb({ src, alt, className = 'w-full h-full object-contain', iconSize = 20, iconClassName = 'text-surface-600' }) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  if (!showImage) {
    return <ImageOff size={iconSize} className={iconClassName} />
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
