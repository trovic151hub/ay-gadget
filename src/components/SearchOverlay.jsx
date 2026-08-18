import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useScrollLock } from '../hooks/useScrollLock'
import ProductThumb from './ProductThumb'
import ProductModal from './ProductModal'
import { Search, X, Loader2, Frown, ArrowRight, Clock } from 'lucide-react'

const RECENT_KEY = 'recentSearches'
const CACHE_TTL_MS = 3 * 60 * 1000

// Module-level so it survives the overlay unmounting -- reopening search
// shortly after the last time doesn't re-read the whole catalog again.
let catalogCache = { data: null, fetchedAt: 0 }

async function loadCatalog() {
  if (catalogCache.data && Date.now() - catalogCache.fetchedAt < CACHE_TTL_MS) {
    return catalogCache.data
  }
  const [prodSnap, gadgetSnap, gameSnap] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'gadgets')),
    getDocs(collection(db, 'games')),
  ])
  const phones = prodSnap.docs.map(d => ({ id: d.id, ...d.data(), _category: 'Phones', _tab: 'products' }))
  const gadgets = gadgetSnap.docs.map(d => ({ id: d.id, ...d.data(), _category: 'Gadgets', _tab: 'gadgets' }))
  const games = gameSnap.docs.map(d => ({ id: d.id, ...d.data(), _category: 'Games', _tab: 'games' }))
  const data = [...phones, ...gadgets, ...games]
  catalogCache = { data, fetchedAt: Date.now() }
  return data
}

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}

function saveRecentSearch(q) {
  const trimmed = q.trim()
  if (!trimmed) return
  const rest = getRecentSearches().filter(s => s.toLowerCase() !== trimmed.toLowerCase())
  localStorage.setItem(RECENT_KEY, JSON.stringify([trimmed, ...rest].slice(0, 5)))
}

function Highlight({ text, query }) {
  if (!query) return text
  const i = text.toLowerCase().indexOf(query.toLowerCase())
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-brand-500/30 text-white rounded-sm">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  )
}

export default function SearchOverlay({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [allProducts, setAllProducts] = useState(catalogCache.data || [])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(!catalogCache.data)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [activeProduct, setActiveProduct] = useState(null)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)
  const inputRef = useRef(null)

  useScrollLock(true)

  useEffect(() => {
    inputRef.current?.focus()
    loadCatalog()
      .then(setAllProducts)
      .catch(e => console.warn('Search fetch error:', e.message))
      .finally(() => setLoading(false))
  }, [])

  // Debounce so fast typing doesn't churn the results list on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 200)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); setActiveIndex(-1); return }
    const filtered = allProducts.filter(p =>
      p.name?.toLowerCase().includes(debouncedQuery) ||
      p.brand?.toLowerCase().includes(debouncedQuery) ||
      p.description?.toLowerCase().includes(debouncedQuery)
    )
    setResults(filtered.slice(0, 8))
    setActiveIndex(-1)
  }, [debouncedQuery, allProducts])

  function handleSelect(product) {
    saveRecentSearch(searchQuery)
    setRecentSearches(getRecentSearches())
    setActiveProduct(product)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    }
  }

  const showEmpty = debouncedQuery.length > 0 && !loading && results.length === 0
  const showResults = results.length > 0
  const showRecent = !searchQuery.trim() && !loading && recentSearches.length > 0

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
            <Search size={20} className="text-brand-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search phones, gadgets, brands…"
              className="flex-1 bg-transparent text-white text-xl md:text-2xl font-medium placeholder:text-surface-600 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors shrink-0"
              aria-label="Close search"
            >
              <X size={16} />
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
          {!searchQuery.trim() && !loading && !showRecent && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/50 flex items-center justify-center mx-auto mb-5">
                <Search size={20} className="text-surface-500" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Search the store</p>
              <p className="text-surface-500 text-sm">Find phones, gadgets and accessories across all categories.</p>
            </div>
          )}

          {/* Recent searches */}
          {showRecent && (
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-4">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-900 border border-surface-800 hover:border-surface-600 text-surface-300 hover:text-white text-sm transition-all"
                  >
                    <Clock size={13} className="text-surface-500" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="text-brand-500 animate-spin" />
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/50 flex items-center justify-center mx-auto mb-5">
                <Frown size={20} className="text-surface-500" />
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
                {results.map((product, i) => {
                  const image = product.image || product.images?.[0]
                  const price = Number(product.price || 0)
                  return (
                    <button
                      key={`${product._tab}-${product.id}`}
                      onClick={() => handleSelect(product)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group text-left ${
                        i === activeIndex
                          ? 'bg-surface-800 border-surface-600'
                          : 'bg-surface-900 border-surface-800 hover:border-surface-600 hover:bg-surface-800'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-surface-800 border border-surface-700/50 flex items-center justify-center shrink-0 overflow-hidden p-1.5 group-hover:border-surface-600 transition-colors">
                        <ProductThumb src={image} alt={product.name} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-semibold text-sm truncate">
                            <Highlight text={product.name || ''} query={debouncedQuery} />
                          </p>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            product._category === 'Phones'
                              ? 'bg-brand-500/15 text-brand-400 border-brand-500/20'
                              : product._category === 'Games'
                              ? 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                          }`}>
                            {product._category}
                          </span>
                        </div>
                        {(product.brand || product.condition) && (
                          <p className="text-surface-500 text-xs">
                            {[product.brand, product.condition].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <p className="text-brand-500 font-bold text-sm">₦{price.toLocaleString()}</p>
                        <ArrowRight size={12} className="text-surface-600 group-hover:text-surface-400 transition-colors ml-auto" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </div>

      {activeProduct && (
        <div onClick={e => e.stopPropagation()}>
          <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
        </div>
      )}
    </div>
  )
}
