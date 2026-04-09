import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import ProductModal from '../components/ProductModal'

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

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [gadgets, setGadgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsSnap, gadgetsSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'gadgets'))
        ])
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setGadgets(gadgetsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.warn('ProductsPage fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'gadgets') setActiveTab('gadgets')
    else setActiveTab('products')
  }, [searchParams])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSearch('')
    setSearchParams({ tab })
  }

  const data = activeTab === 'products' ? products : gadgets
  const filtered = search
    ? data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
    : data

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans">
      <NotificationContainer />
      <Navbar />
      <MiniCart />

      {/* Page header */}
      <div className="pt-32 pb-14 px-6 text-center border-b border-surface-800">
        <span className="inline-block py-1 px-3 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 border border-brand-500/20">
          Collection
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight mb-3">
          {activeTab === 'products' ? 'Smartphones' : 'Gadgets & Accessories'}
        </h1>
        <p className="text-surface-400 text-base max-w-xl mx-auto">
          {activeTab === 'products'
            ? 'New, UK-used, and Nigeria-used phones — all verified.'
            : 'Accessories and gadgets to elevate your everyday experience.'}
        </p>
      </div>

      <main className="flex-1 px-6 max-w-[88rem] mx-auto py-12 w-full">

        {/* Breadcrumb */}
        <nav className="text-xs text-surface-500 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-brand-500 transition-colors">
            <i className="fas fa-home" /> Home
          </a>
          <i className="fas fa-chevron-right text-[10px]" />
          <span className="text-surface-300 font-semibold">
            {activeTab === 'products' ? 'Smartphones' : 'Accessories'}
          </span>
        </nav>

        {/* Tabs + Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-10">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-900 border border-surface-700/50 rounded-2xl">
            {[
              { label: 'Smartphones', value: 'products' },
              { label: 'Accessories', value: 'gadgets' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.value
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or brand..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-surface-700/50 bg-surface-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all placeholder:text-surface-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-20 h-20 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-search text-2xl text-surface-500" />
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-2">
              {search ? 'No results found' : 'Nothing here yet'}
            </h3>
            <p className="text-surface-500 max-w-sm text-sm">
              {search
                ? `We couldn't find anything matching "${search}". Try a different term.`
                : 'Products will appear here once added from the admin panel.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-5 text-brand-500 font-semibold text-sm hover:text-brand-400 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filtered.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i % 10) * 40}ms` }}>
                <ProductCard product={p} onClick={() => setSelectedProduct(p)} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
