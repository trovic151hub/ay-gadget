import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import ProductModal from '../components/ProductModal'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [gadgets, setGadgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [productsSnap, gadgetsSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'gadgets'))
      ])
      setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setGadgets(gadgetsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchData()
  }, [])

  const data = activeTab === 'products' ? products : gadgets
  const filtered = search
    ? data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : data

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
      <NotificationContainer />
      <Navbar />
      <MiniCart />

      {/* Page Header */}
      <div className="bg-surface-950 pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight mb-4 animate-fade-up">Our Collection</h1>
        <p className="text-surface-300 text-lg max-w-2xl mx-auto animate-fade-up" style={{animationDelay: '100ms'}}>
          Discover our curated selection of premium smartphones, gadgets, and accessories.
        </p>
      </div>

      <main className="flex-1 px-6 max-w-[90rem] mx-auto py-12 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm text-surface-500 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-brand-600 transition-colors"><i className="fas fa-home"></i> Home</a>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="font-semibold text-surface-900">
            {activeTab === 'products' ? 'Smartphones' : 'Accessories'}
          </span>
        </nav>

        {/* Tabs + Search */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-10 bg-white p-4 rounded-3xl shadow-soft border border-surface-100">
          <div className="flex gap-2 w-full lg:w-auto p-1 bg-surface-50 rounded-2xl">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'products'
                  ? 'bg-white text-brand-600 shadow-sm border border-surface-100'
                  : 'text-surface-500 hover:text-surface-900'
              }`}
            >
              Smartphones
            </button>
            <button
              onClick={() => setActiveTab('gadgets')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'gadgets'
                  ? 'bg-white text-brand-600 shadow-sm border border-surface-100'
                  : 'text-surface-500 hover:text-surface-900'
              }`}
            >
              Accessories
            </button>
          </div>

          <div className="relative w-full lg:w-96">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, brand..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-surface-200 bg-surface-50 text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium placeholder:font-normal"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => <div key={i} className="h-[360px] rounded-[24px] skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[32px] border border-surface-100 shadow-soft flex flex-col items-center">
            <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-search text-3xl text-surface-300" />
            </div>
            <h3 className="text-2xl font-bold font-display text-surface-900 tracking-tight mb-2">No results found</h3>
            <p className="text-surface-500 max-w-md">We couldn't find any products matching "{search}". Try checking your spelling or using less specific terms.</p>
            <button 
              onClick={() => setSearch('')}
              className="mt-6 text-brand-600 font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{animationDelay: `${(i % 10) * 50}ms`}}>
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