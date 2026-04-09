import { useState, useEffect, useRef } from 'react'

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!slides.length || paused) return
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5500)
    return () => clearInterval(intervalRef.current)
  }, [slides.length, paused])

  if (!slides.length) {
    return (
      <div className="bg-surface-950 min-h-[500px] flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/40 via-surface-950 to-surface-950"></div>
        <div className="text-center z-10 max-w-2xl px-6">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6 border border-brand-500/30">Welcome</span>
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 leading-none text-white">AY&apos;s Store</h1>
          <p className="text-surface-300 mt-3 text-lg md:text-xl font-light">The premium destination for phones & gadgets in Nigeria.</p>
          <a href="/products" className="inline-flex mt-10 bg-brand-500 text-white px-10 py-4 rounded-full font-bold hover:bg-brand-400 hover:shadow-glow transition-all transform hover:-translate-y-1">
            Explore Collection
          </a>
        </div>
      </div>
    )
  }

  const slide = slides[current]

  return (
    <div className="relative overflow-hidden bg-surface-950 min-h-[500px] md:min-h-[600px] flex items-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-surface-950/90 z-10 backdrop-blur-3xl"></div>
        {slide.type === 'video' ? (
           <video autoPlay muted loop className="w-full h-full object-cover opacity-30">
             <source src={slide.url} type="video/mp4" />
           </video>
        ) : (
          <img src={slide.url} alt="" className="w-full h-full object-cover opacity-30" />
        )}
      </div>
      
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between px-6 py-20 relative z-20 gap-12">
        {/* Text */}
        <div className="md:w-1/2 mb-8 md:mb-0">
          <div className="animate-fade-up" key={`text-${current}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-6 leading-[1.1] tracking-tight drop-shadow-md">
              {slide.headline}
            </h1>
            <p className="text-surface-300 mb-10 text-lg md:text-xl font-light leading-relaxed max-w-lg drop-shadow-md">
              {slide.subheadline}
            </p>
            <div className="flex flex-wrap gap-4">
              {slide.cta_primary_text && (
                <button className="bg-brand-500 text-white py-4 px-8 rounded-full font-bold hover:bg-brand-400 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(255,98,0,0.5)] transform hover:-translate-y-1">
                  {slide.cta_primary_text}
                </button>
              )}
              {slide.cta_secondary_text && (
                <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 px-8 rounded-full font-bold hover:bg-white/20 transition-all transform hover:-translate-y-1">
                  {slide.cta_secondary_text}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="md:w-1/2 flex justify-center lg:justify-end w-full">
          <div className="relative animate-fade-up w-full max-w-lg" key={`media-${current}`}>
            <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full transform scale-90"></div>
            {slide.type === 'video' ? (
              <video autoPlay muted loop className="rounded-[2rem] shadow-2xl w-full h-[300px] md:h-[450px] object-cover relative z-10 border border-white/10">
                <source src={slide.url} type="video/mp4" />
              </video>
            ) : (
              <img src={slide.url} alt={slide.headline} className="rounded-[2rem] shadow-2xl w-full h-[300px] md:h-[450px] object-cover relative z-10 border border-white/10" />
            )}
          </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="absolute bottom-8 left-0 w-full z-30 px-6 max-w-7xl mx-auto flex items-center justify-between">
        {/* Play/Pause */}
        <button
          onClick={() => setPaused(v => !v)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
        >
          <i className={`fas ${paused ? 'fa-play' : 'fa-pause'} text-sm`} />
        </button>

        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-brand-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}