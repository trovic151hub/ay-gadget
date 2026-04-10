import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function SearchOverlay({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()

    async function fetchAll() {
      try {
        const [prodSnap, gadgetSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'gadgets')),
        ])
        const phones = prodSnap.docs.map(d => ({ id: d.id, ...d.data(), _category: 'Phones', _tab: 'products' }))
        const gadgets = gadgetSnap.docs.map(d => ({ id: d.id, ...d.data(), _category: 'Gadgets', _tab: 'gadgets' }))
        setAllProducts([...phones, ...gadgets])
      } catch (e) {
        console.warn('Search fetch error:', e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()

    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) { setResults([]); return }
    const filtered = allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
    setResults(filtered.slice(0, 8))
  }, [searchQuery, allProducts])

  function handleSelect(product) {
    navigate(`/products?tab=${product._tab}`)
    onClose()
  }

  const showEmpty = searchQuery.trim().length > 0 && !loading && results.length === 0
  const showResults = results.length > 0

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-950/95 backdrop-blur-md flex flex-col"
      onClick={onClose}
    >
      {/* Search bar area */}
      <div
        className="border-b border-surface-800 px-6 py-6 md:py-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <i className="fas fa-search text-brand-500 text-xl shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search phones, gadgets, brands…"
              className="flex-1 bg-transparent text-white text-xl md:text-2xl font-medium placeholder:text-surface-600 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors shrink-0"
              aria-label="Close search"
            >
              <i className="fas fa-xmark" />
            </button>
          </div>
        </div>
      </div>

      {/* Results area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto">

          {/* Initial state */}
          {!searchQuery.trim() && !loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/50 flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-search text-surface-500 text-xl" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Search the store</p>
              <p className="text-surface-500 text-sm">Find phones, gadgets and accessories across all categories.</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <i className="fas fa-spinner fa-spin text-brand-500 text-2xl" />
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/50 flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-face-frown text-surface-500 text-xl" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">No results found</p>
              <p className="text-surface-500 text-sm">
                Nothing matched <span className="text-white">"{searchQuery}"</span>. Try a different search.
              </p>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
              <div className="space-y-2">
                {results.map(product => {
                  const image = product.image || product.images?.[0]
                  const price = Number(product.price || 0)
                  return (
                    <button
                      key={`${product._tab}-${product.id}`}
                      onClick={() => handleSelect(product)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-900 border border-surface-800 hover:border-surface-600 hover:bg-surface-800 transition-all group text-left"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-surface-800 border border-surface-700/50 flex items-center justify-center shrink-0 overflow-hidden p-1.5 group-hover:border-surface-600 transition-colors">
                        {image
                          ? <img src={image} alt={product.name} className="w-full h-full object-contain" />
                          : <i className="fas fa-image text-surface-600" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            product._category === 'Phones'
                              ? 'bg-brand-500/15 text-brand-400 border-brand-500/20'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                          }`}>
                            {product._category}
                          </span>
                        </div>
                        {product.brand && (
                          <p className="text-surface-500 text-xs">{product.brand}</p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <p className="text-brand-500 font-bold text-sm">₦{price.toLocaleString()}</p>
                        <i className="fas fa-arrow-right text-surface-600 group-hover:text-surface-400 text-xs transition-colors" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
