import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart()
  const { showNotification } = useNotification()

  async function handleAddToCart() {
    await addToCart(product)
    showNotification(`${product.name} added to cart`, 'success')
    onClose()
  }

  const image = product.images?.[0] || product.image || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] w-full max-w-4xl shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-slide-in">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-surface-100 hover:bg-surface-200 rounded-full flex items-center justify-center text-surface-600 transition-colors">
          <i className="fas fa-times text-lg" />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 bg-surface-50 p-5 md:p-8 flex items-center justify-center min-h-[220px] md:min-h-0 relative">
          {product.brand && (
            <span className="absolute top-6 left-6 bg-white shadow-sm text-surface-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider z-10">
              {product.brand}
            </span>
          )}
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-contain max-h-[400px] mix-blend-multiply drop-shadow-xl" />
          ) : (
            <i className="fas fa-image text-6xl text-surface-200" />
          )}
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-6 md:p-12 flex flex-col bg-white overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold font-display text-surface-900 tracking-tight leading-tight mb-3 md:mb-4">{product.name}</h2>
            {product.condition && (
              <span className="inline-block mb-3 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-600 text-xs font-bold uppercase tracking-wider rounded-lg">
                {product.condition}
              </span>
            )}
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
                <i className="fas fa-cart-plus text-lg" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}