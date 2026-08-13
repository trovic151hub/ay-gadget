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
import { Home, ChevronRight, Search, X, ChevronDown } from 'lucide-react'

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

const TABS = [
  { label: 'All Products', value: 'all' },
  { label: 'Smartphones', value: 'products' },
  { label: 'Accessories', value: 'gadgets' },
  { label: 'Games', value: 'games' },
]

const TAB_META = {
  all: { title: 'All Products', crumb: 'All Products', desc: 'Our full catalog of phones, gadgets, games, and accessories — all verified.' },
  products: { title: 'Smartphones', crumb: 'Smartphones', desc: 'New, UK-used, and Nigeria-used phones — all verified.' },
  gadgets: { title: 'Gadgets & Accessories', crumb: 'Accessories', desc: 'Accessories and gadgets to elevate your everyday experience.' },
  games: { title: 'Video Games & Accessories', crumb: 'Games', desc: 'Consoles, titles, and gaming accessories — all verified.' },
}

const CONDITIONS = ['New', 'UK-Used', 'Nigeria-Used']
const PAGE_SIZE = 15

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [gadgets, setGadgets] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsSnap, gadgetsSnap, gamesSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'gadgets')),
          getDocs(collection(db, 'games'))
        ])
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data(), _tab: 'products' })))
        setGadgets(gadgetsSnap.docs.map(d => ({ id: d.id, ...d.data(), _tab: 'gadgets' })))
        setGames(gamesSnap.docs.map(d => ({ id: d.id, ...d.data(), _tab: 'games' })))
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
    if (tab === 'gadgets' || tab === 'products' || tab === 'games') setActiveTab(tab)
    else setActiveTab('all')
  }, [searchParams])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeTab, conditionFilter, search])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSearch('')
    setSearchParams(tab === 'all' ? {} : { tab })
  }

  const data = activeTab === 'products' ? products
    : activeTab === 'gadgets' ? gadgets
    : activeTab === 'games' ? games
    : [...products, ...gadgets, ...games]
  const filtered = data
    .filter(p => conditionFilter === 'all' || p.condition === conditionFilter)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
  const visible = filtered.slice(0, visibleCount)

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
          {TAB_META[activeTab].title}
        </h1>
        <p className="text-surface-400 text-base max-w-xl mx-auto">
          {TAB_META[activeTab].desc}
        </p>
      </div>

      <main className="flex-1 px-6 max-w-[88rem] mx-auto py-12 w-full">

        {/* Breadcrumb */}
        <nav className="text-xs text-surface-500 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-brand-500 transition-colors inline-flex items-center gap-1">
            <Home size={12} /> Home
          </a>
          <ChevronRight size={10} />
          <span className="text-surface-300 font-semibold">
            {TAB_META[activeTab].crumb}
          </span>
        </nav>

        {/* Tabs + Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-900 border border-surface-700/50 rounded-2xl overflow-x-auto max-w-full">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`shrink-0 px-4 sm:px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
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
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
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
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Condition filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['all', ...CONDITIONS].map(c => (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                conditionFilter === c
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-surface-700/50 text-surface-400 hover:text-white hover:border-surface-600'
              }`}
            >
              {c === 'all' ? 'All Conditions' : c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-20 h-20 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mb-6">
              <Search size={24} className="text-surface-500" />
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-2">
              {search || conditionFilter !== 'all' ? 'No results found' : 'Nothing here yet'}
            </h3>
            <p className="text-surface-500 max-w-sm text-sm">
              {search
                ? `We couldn't find anything matching "${search}". Try a different term.`
                : conditionFilter !== 'all'
                ? `No ${conditionFilter} items in this category yet.`
                : 'Products will appear here once added from the admin panel.'}
            </p>
            {(search || conditionFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setConditionFilter('all') }}
                className="mt-5 text-brand-500 font-semibold text-sm hover:text-brand-400 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {visible.map((p, i) => (
                <div key={`${p._tab}-${p.id}`} className="animate-fade-up" style={{ animationDelay: `${(i % 10) * 40}ms` }}>
                  <ProductCard product={p} onClick={() => setSelectedProduct(p)} />
                </div>
              ))}
            </div>

            {filtered.length > visible.length && (
              <div className="flex flex-col items-center gap-3 pt-10">
                <p className="text-surface-500 text-xs font-medium">
                  Showing {visible.length} of {filtered.length}
                </p>
                <button
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-surface-900 border border-surface-700/50 text-white font-bold text-sm hover:bg-surface-800 hover:border-surface-600 transition-all"
                >
                  <ChevronDown size={16} /> See More
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
