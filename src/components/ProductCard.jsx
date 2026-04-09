import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'

export default function ProductCard({ product, onClick }) {
  const { addToCart } = useCart()
  const { showNotification } = useNotification()

  async function handleAddToCart(e) {
    e.stopPropagation()
    await addToCart(product)
    showNotification(`${product.name} added to cart`, 'success')
  }

  const image = product.images?.[0] || product.image || ''

  return (
    <div
      onClick={onClick}
      className="group relative bg-surface-900 rounded-[20px] overflow-hidden cursor-pointer border border-surface-700/50 hover:border-brand-500/30 flex flex-col h-full transition-all duration-350 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)] hover:shadow-brand-500/5"
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-surface-800 h-52 flex items-center justify-center">
        {/* Subtle top gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none z-10" />

        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500 ease-out relative z-0"
          />
        ) : (
          <div className="text-surface-600 z-0">
            <i className="fas fa-image text-5xl" />
          </div>
        )}

        {/* Brand badge */}
        {product.brand && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-surface-900/80 backdrop-blur-sm text-surface-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-surface-700/50">
              {product.brand}
            </span>
          </div>
        )}

        {/* Add to cart — slides in on hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 z-20 w-11 h-11 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-400 transition-all opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 duration-300 hover:scale-110"
        >
          <i className="fas fa-cart-plus text-sm" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug tracking-tight mb-1">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-surface-500 font-semibold uppercase tracking-wider block mb-0.5">Price</span>
            <p className="text-brand-500 font-display font-bold text-base tracking-tight leading-none">
              ₦{Number(product.price).toLocaleString()}
            </p>
          </div>

          {/* Mobile add to cart */}
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 bg-surface-800 text-brand-500 rounded-full flex items-center justify-center md:hidden active:scale-90 border border-surface-700/50"
          >
            <i className="fas fa-plus text-xs" />
          </button>
        </div>
      </div>
    </div>
  )
}
