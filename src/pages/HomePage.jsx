import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'
import HeroSlider from '../components/HeroSlider'
import ProductCard from '../components/ProductCard'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import ProductModal from '../components/ProductModal'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [gadgets, setGadgets] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [productsSnap, gadgetsSnap, heroSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'gadgets')),
        getDocs(collection(db, 'hero'))
      ])
      setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setGadgets(gadgetsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setHeroSlides(heroSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <NotificationContainer />
      <Navbar />
      <MiniCart />

      <main className="flex-1 pt-20">
        <HeroSlider slides={heroSlides} />

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 tracking-tight">Shop by Category</h2>
            <p className="text-surface-500 mt-3 text-lg">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {['New Phones', 'UK-Used Phones', 'Nigeria-Used Phones'].map((label, i) => (
              <div key={i} className="group bg-white rounded-3xl p-8 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 border border-surface-100 cursor-pointer animate-fade-up" style={{animationDelay: `${i * 100}ms`}}>
                <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors duration-300">
                  <i className={`fas ${i === 0 ? 'fa-box' : i === 1 ? 'fa-plane-departure' : 'fa-check-circle'} text-2xl text-brand-500 group-hover:text-white transition-colors duration-300`} />
                </div>
                <h3 className="text-surface-900 font-bold text-xl font-display tracking-tight mb-3">{label}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">
                  {i === 0 ? 'Brand new sealed phones with full manufacturer warranty.' : i === 1 ? 'Premium pre-owned phones imported from the UK, tested and trusted.' : 'Locally used phones verified by our expert technicians.'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Phones */}
        <section className="bg-white py-20 border-y border-surface-100">
          <div className="max-w-[90rem] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 tracking-tight">Featured Phones</h2>
                <p className="text-surface-500 mt-2 text-lg">Top picks for you</p>
              </div>
              <a href="/products" className="group inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
                View All Collection <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array(5).fill(0).map((_, i) => <div key={i} className="h-[360px] rounded-[24px] skeleton" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {products.slice(0, 10).map((p, i) => (
                  <div key={p.id} className="animate-fade-up" style={{animationDelay: `${i * 50}ms`}}>
                    <ProductCard product={p} onClick={() => setSelectedProduct(p)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Gadgets */}
        <section className="max-w-[90rem] mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 tracking-tight">Gadgets & Accessories</h2>
              <p className="text-surface-500 mt-2 text-lg">Elevate your experience</p>
            </div>
            <a href="/products" className="group inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
              Explore Accessories <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array(5).fill(0).map((_, i) => <div key={i} className="h-[360px] rounded-[24px] skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {gadgets.slice(0, 10).map((p, i) => (
                <div key={p.id} className="animate-fade-up" style={{animationDelay: `${i * 50}ms`}}>
                  <ProductCard product={p} onClick={() => setSelectedProduct(p)} />
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Trust badges */}
        <section className="bg-surface-950 text-white py-16 mt-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-surface-800">
              {[
                { icon: 'fa-truck-fast', title: 'Fast Delivery', desc: 'Across all 36 states in Nigeria' },
                { icon: 'fa-shield-halved', title: '100% Secure', desc: 'Verified and trusted products' },
                { icon: 'fa-headset', title: '24/7 Support', desc: 'Always here to help you' },
                { icon: 'fa-rotate-left', title: 'Easy Returns', desc: '7-day return policy' }
              ].map((b, i) => (
                <div key={i} className="pt-8 md:pt-0 md:px-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-surface-800 rounded-full flex items-center justify-center mb-4 text-brand-500">
                    <i className={`fas ${b.icon} text-lg`} />
                  </div>
                  <h4 className="font-bold text-lg font-display mb-1">{b.title}</h4>
                  <p className="text-surface-400 text-sm">{b.desc}</p>
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