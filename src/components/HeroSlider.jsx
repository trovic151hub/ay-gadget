import { useState, useEffect, useRef } from 'react'

const FALLBACK_BG = [
  'from-brand-900/50 via-surface-900 to-surface-950',
  'from-surface-800 via-surface-900 to-brand-950/50',
  'from-surface-900 via-surface-800 to-brand-900/30',
]

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const [visible, setVisible] = useState(true)
  const intervalRef = useRef(null)
  const pendingRef = useRef(null)

  function goTo(idx) {
    if (idx === current) return
    setVisible(false)
    pendingRef.current = idx
  }

  useEffect(() => {
    if (visible) return
    const t = setTimeout(() => {
      setCurrent(pendingRef.current)
      setVisible(true)
    }, 350)
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    if (!slides.length || paused) return
    intervalRef.current = setInterval(() => {
      const next = (current + 1) % slides.length
      goTo(next)
    }, 5500)
    return () => clearInterval(intervalRef.current)
  }, [slides.length, paused, current])

  if (!slides.length) {
    return (
      <div className="bg-surface-950 min-h-[560px] flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/40 via-surface-950 to-surface-950" />
        <div className="text-center z-10 max-w-2xl px-6">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6 border border-brand-500/30">
            Welcome
          </span>
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 leading-none text-white">
            AY&apos;s Store
          </h1>
          <p className="text-surface-300 mt-3 text-lg md:text-xl font-light">
            The premium destination for phones &amp; gadgets in Nigeria.
          </p>
          <a
            href="/products"
            className="inline-flex mt-10 bg-brand-500 text-white px-10 py-4 rounded-full font-bold hover:bg-brand-400 hover:shadow-glow transition-all transform hover:-translate-y-1"
          >
            Explore Collection
          </a>
        </div>
      </div>
    )
  }

  const slide = slides[current]
  const hasBrokenImg = imgErrors[current]
  const hasImg = slide.url && !hasBrokenImg && slide.type !== 'video'
  const hasVideo = slide.url && !hasBrokenImg && slide.type === 'video'

  return (
    <div className="relative overflow-hidden bg-surface-950 min-h-[560px] md:min-h-[640px]">

      {/* Backgrounds — cross-fade via z layers + opacity */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
          style={{ opacity: i === current ? 1 : 0, zIndex: 0 }}
        >
          <div className="absolute inset-0 z-10"
            style={{ background: 'linear-gradient(to right, rgba(10,15,30,0.97) 0%, rgba(10,15,30,0.80) 55%, rgba(10,15,30,0.40) 100%)' }}
          />
          {s.url && !imgErrors[i] ? (
            s.type === 'video' ? (
              <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-30">
                <source src={s.url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={s.url}
                alt=""
                onError={() => setImgErrors(e => ({ ...e, [i]: true }))}
                className="w-full h-full object-cover opacity-25"
              />
            )
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_BG[i % FALLBACK_BG.length]}`} />
          )}
        </div>
      ))}

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between px-6 pt-14 pb-24 md:py-28 relative gap-8 md:gap-12" style={{ zIndex: 20 }}>

        {/* Text — fade + subtle lift */}
        <div
          className="md:w-1/2 transition-all duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {slide.subheadline && (
            <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6 border border-brand-500/30">
              {slide.subheadline}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white leading-[1.08] tracking-tight mb-8">
            {slide.headline}
          </h1>
          <div className="flex flex-wrap gap-4">
            {slide.cta_primary_text && (
              <button className="bg-brand-500 text-white py-4 px-8 rounded-full font-bold hover:bg-brand-400 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(255,98,0,0.5)] hover:-translate-y-0.5 transform">
                {slide.cta_primary_text}
              </button>
            )}
            {slide.cta_secondary_text && (
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-full font-bold hover:bg-white/20 transition-all hover:-translate-y-0.5 transform">
                {slide.cta_secondary_text}
              </button>
            )}
          </div>
        </div>

        {/* Media — cross-fade all images stacked */}
        <div className="md:w-1/2 flex justify-center lg:justify-end w-full">
          <div className="relative w-full max-w-lg h-[300px] md:h-[420px]">
            {/* Glow blob */}
            <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full transform scale-95 pointer-events-none" />

            {slides.map((s, i) => {
              const broken = imgErrors[i]
              const isImg = s.url && !broken && s.type !== 'video'
              const isVid = s.url && !broken && s.type === 'video'
              return (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
                  style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 10 : 0 }}
                >
                  {isVid ? (
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                      <source src={s.url} type="video/mp4" />
                    </video>
                  ) : isImg ? (
                    <img
                      src={s.url}
                      alt={s.headline}
                      onError={() => setImgErrors(e => ({ ...e, [i]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_BG[i % FALLBACK_BG.length]} flex items-center justify-center`}>
                      <div className="text-center">
                        <i className="fas fa-bolt text-5xl text-brand-500/40 mb-3 block" />
                        <p className="text-white/20 text-sm font-medium">AY&apos;s Store</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom controls — centered */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 w-full flex items-center justify-center gap-4" style={{ zIndex: 30 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-500 ease-in-out ${
                i === current
                  ? 'w-9 h-3 bg-brand-500 shadow-[0_0_12px_rgba(255,98,0,0.55)]'
                  : 'w-3 h-3 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button
            onClick={() => setPaused(v => !v)}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/15"
          >
            <i className={`fas ${paused ? 'fa-play' : 'fa-pause'} text-[10px]`} />
          </button>
        </div>
      )}
    </div>
  )
}
