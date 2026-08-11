import { useState } from 'react'

// Swaps to the placeholder icon if the image URL is missing OR fails to
// load (a plain <img src="broken-url"> just renders a tiny/invisible
// broken-image glyph, especially on a dark background -- easy to miss
// entirely). Assumes the parent already centers its content
// (flex items-center justify-center) and sets the box size.
export default function ProductThumb({ src, alt, className = 'w-full h-full object-contain', iconClassName = 'text-xl text-surface-600' }) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  if (!showImage) {
    return <i className={`fas fa-image ${iconClassName}`} />
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
