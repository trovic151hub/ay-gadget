import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import { useScrollLock } from '../hooks/useScrollLock'
import ProductThumb from './ProductThumb'
import { X, ShoppingCart, PlayCircle } from 'lucide-react'

const CONDITION_STYLES = {
  'New': 'bg-green-50 text-green-700',
  'UK-Used': 'bg-blue-50 text-blue-700',
  'Nigeria-Used': 'bg-amber-50 text-amber-700',
}

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart()
  const { showNotification } = useNotification()
  const [activeIdx, setActiveIdx] = useState(0)

  useScrollLock(true)

  async function handleAddToCart() {
    await addToCart(product)
    showNotification(`${product.name} added to cart`, 'success')
    onClose()
  }

  const images = product.images?.filter(Boolean) || (product.image ? [product.image] : [])
  const videos = product.videos?.filter(Boolean) || []
  const media = [
    ...images.map(url => ({ url, type: 'image' })),
    ...videos.map(url => ({ url, type: 'video' })),
  ]
  const active = media[activeIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-md transition-opacity touch-none" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] w-full max-w-4xl shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-slide-in">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-surface-100 hover:bg-surface-200 rounded-full flex items-center justify-center text-surface-600 transition-colors">
          <X size={18} />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 bg-surface-50 flex flex-col min-h-[220px] md:min-h-0">
          <div className="flex-1 p-5 md:p-8 flex items-center justify-center relative">
            <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2 max-w-[70%]">
              {product.brand && (
                <span className="bg-white shadow-sm text-surface-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              {product.condition && (
                <span className={`shadow-sm text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${CONDITION_STYLES[product.condition] || 'bg-white text-surface-800'}`}>
                  {product.condition}
                </span>
              )}
            </div>
            {active?.type === 'video' ? (
              <video src={active.url} controls className="w-full h-full max-h-[400px] object-contain" />
            ) : (
              <ProductThumb
                src={active?.url}
                alt={product.name}
                className="w-full h-full object-contain max-h-[400px] mix-blend-multiply drop-shadow-xl"
                iconSize={60}
                iconClassName="text-surface-200"
              />
            )}
          </div>
          {media.length > 1 && (
            <div className="flex gap-3 overflow-x-auto p-5 pt-0 md:px-8 md:pb-8">
              {media.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-xl bg-white p-1 border-2 transition-all ${i === activeIdx ? 'border-brand-500 shadow-glow' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {m.type === 'video' ? (
                    <div className="w-full h-full bg-surface-100 rounded-lg flex items-center justify-center">
                      <PlayCircle size={20} className="text-surface-400" />
                    </div>
                  ) : (
                    <ProductThumb src={m.url} alt="" className="w-full h-full object-contain mix-blend-multiply" iconSize={18} iconClassName="text-surface-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-6 md:p-12 flex flex-col bg-white overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold font-display text-surface-900 tracking-tight leading-tight mb-3 md:mb-4">{product.name}</h2>
            {product.description && (
              <p className="text-surface-500 text-base leading-relaxed">{product.description}</p>
            )}
          </div>
          
          <div className="mt-auto border-t border-surface-100 pt-8">
            <p className="text-sm font-semibold text-surface-400 uppercase tracking-widest mb-2">Price</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <p className="text-brand-600 font-display font-bold text-4xl tracking-tight">₦{Number(product.price).toLocaleString()}</p>
              
              <button
                onClick={handleAddToCart}
                className="bg-surface-950 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-500 hover:shadow-glow transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}