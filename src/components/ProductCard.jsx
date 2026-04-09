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
      className="group relative bg-white rounded-[24px] overflow-hidden cursor-pointer shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-surface-100/50 flex flex-col h-full"
    >
      <div className="relative overflow-hidden bg-surface-50 h-56 p-6 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="text-surface-300">
            <i className="fas fa-image text-5xl" />
          </div>
        )}

        <div className="absolute top-4 left-4">
          {product.brand && (
            <span className="bg-white/80 backdrop-blur-sm text-surface-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {product.brand}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 w-12 h-12 bg-surface-950 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-500 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300 hover:scale-110"
        >
          <i className="fas fa-cart-plus text-sm" />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-surface-900 line-clamp-2 leading-tight tracking-tight mb-1">{product.name}</h3>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider mb-0.5">Price</span>
            <p className="text-brand-600 font-display font-bold text-lg tracking-tight leading-none">₦{Number(product.price).toLocaleString()}</p>
          </div>
          
          {/* Mobile add to cart */}
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 bg-surface-50 text-surface-900 rounded-full flex items-center justify-center md:hidden active:scale-95"
          >
            <i className="fas fa-plus text-sm" />
          </button>
        </div>
      </div>
    </div>
  )
}