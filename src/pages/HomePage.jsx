import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'
import HeroSlider from '../components/HeroSlider'
import ProductCard from '../components/ProductCard'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import ProductModal from '../components/ProductModal'

const CATEGORIES = [
  { label: 'New Phones', icon: 'fa-box', desc: 'Brand new sealed phones with full manufacturer warranty.', category: 'new' },
  { label: 'UK-Used Phones', icon: 'fa-plane-departure', desc: 'Premium pre-owned phones imported from the UK, tested and trusted.', category: 'uk-used' },
  { label: 'Nigeria-Used Phones', icon: 'fa-check-circle', desc: 'Locally used phones verified by our expert technicians.', category: 'nigeria-used' },
]

const TRUST_BADGES = [
  { icon: 'fa-truck-fast', title: 'Fast Delivery', desc: 'Across all 36 states in Nigeria' },
  { icon: 'fa-shield-halved', title: '100% Secure', desc: 'Verified and trusted products' },
  { icon: 'fa-headset', title: '24/7 Support', desc: 'Always here to help you' },
]

function SkeletonCard() {
  return (
    <div className="rounded-[20px] bg-surface-800 overflow-hidden animate-pulse">
      <div className="h-52 bg-surface-700" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-surface-700 rounded-full w-3/4" />
        <div className="h-3 bg-surface-700 rounded-full w-1/2" />
        <div className="h-4 bg-surface-700 rounded-full w-1/3 mt-4" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [gadgets, setGadgets] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsSnap, gadgetsSnap, heroSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'gadgets')),
          getDocs(collection(db, 'hero'))
        ])
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setGadgets(gadgetsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setHeroSlides(heroSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.warn('HomePage fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <NotificationContainer />
      <Navbar />
      <MiniCart />

      <main className="flex-1 pt-20">
        <HeroSlider slides={heroSlides} />

        {/* Shop by Category */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 border border-brand-500/20">
              Browse
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">
              Shop by Category
            </h2>
            <p className="text-surface-400 mt-3 text-base">Find exactly what you&apos;re looking for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate(`/products?tab=products&category=${cat.category}`)}
                className="group bg-surface-900 border border-surface-700/50 hover:border-brand-500/30 rounded-2xl p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="w-14 h-14 bg-surface-800 group-hover:bg-brand-500/15 border border-surface-700/50 group-hover:border-brand-500/30 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300">
                  <i className={`fas ${cat.icon} text-xl text-surface-400 group-hover:text-brand-500 transition-colors duration-300`} />
                </div>
                <h3 className="text-white font-bold text-lg font-display tracking-tight mb-2">{cat.label}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{cat.desc}</p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-brand-500 text-xs font-semibold group-hover:gap-2.5 transition-all duration-200">
                  Shop now <i className="fas fa-arrow-right text-[10px]" />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-t border-surface-800" />
        </div>

        {/* Featured Phones */}
        <section className="py-20">
          <div className="max-w-[88rem] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="inline-block py-1 px-3 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold uppercase tracking-widest mb-3 border border-brand-500/20">
                  Phones
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">
                  Featured Phones
                </h2>
                <p className="text-surface-400 mt-1 text-base">Top picks curated for you</p>
              </div>
              <a
                href="/products"
                className="group inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-400 transition-colors text-sm"
              >
                View All <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-surface-500">
                <i className="fas fa-box-open text-4xl mb-4 block opacity-30" />
                <p className="text-base">No phones listed yet. Add some from the admin panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {products.slice(0, 4).map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <ProductCard product={p} onClick={() => setSelectedProduct(p)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-t border-surface-800" />
        </div>

        {/* Gadgets & Accessories */}
        <section className="py-20">
          <div className="max-w-[88rem] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="inline-block py-1 px-3 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold uppercase tracking-widest mb-3 border border-brand-500/20">
                  Gadgets
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">
                  Gadgets &amp; Accessories
                </h2>
                <p className="text-surface-400 mt-1 text-base">Elevate your everyday experience</p>
              </div>
              <a
                href="/products"
                className="group inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-400 transition-colors text-sm"
              >
                Explore All <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : gadgets.length === 0 ? (
              <div className="text-center py-20 text-surface-500">
                <i className="fas fa-plug text-4xl mb-4 block opacity-30" />
                <p className="text-base">No gadgets listed yet. Add some from the admin panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {gadgets.slice(0, 4).map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <ProductCard product={p} onClick={() => setSelectedProduct(p)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trust badges */}
        <section className="border-t border-surface-800 py-16 mt-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
                    <i className={`fas ${b.icon} text-lg`} />
                  </div>
                  <h4 className="font-bold text-white font-display mb-1 text-sm">{b.title}</h4>
                  <p className="text-surface-500 text-xs leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
