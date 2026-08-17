import { useRef, useState, useEffect } from 'react'
import { Play } from 'lucide-react'

// Native <video controls> looks like a bare browser widget dropped into an
// otherwise branded page. Starts as a clean poster frame with a big brand-
// colored play button; native controls only take over once actually
// playing, and pausing brings the branded button back instead of leaving a
// stalled video sitting under a stark control bar.
export default function VideoPlayer({ src, className = '' }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
  }, [src])

  function handlePlay() {
    videoRef.current?.play()
    setPlaying(true)
  }

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        controls={playing}
        playsInline
        preload="metadata"
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="w-full h-full object-contain"
      />
      {!playing && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
          aria-label="Play video"
        >
          <span className="w-16 h-16 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-glow hover:scale-110 transition-transform">
            <Play size={26} className="ml-1" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  )
}
