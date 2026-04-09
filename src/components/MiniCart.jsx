import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'

export default function MiniCart() {
  const { cartOpen, setCartOpen, cartItems, cartSubtotal, removeFromCart, changeQuantity, cartCount } = useCart()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setCartOpen(false)
    }
    if (cartOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, setCartOpen])

  function handleCheckout() {
    if (cartCount === 0) { showNotification('Your cart is empty', 'warning'); return }
    localStorage.setItem('gotoCheckout', 'true')
    navigate('/cart')
    setCartOpen(false)
  }

  function handleViewCart() {
    if (cartCount === 0) { showNotification('Your cart is empty', 'warning'); return }
    navigate('/cart')
    setCartOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? 'auto' : 'none' }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-surface-900 border-l border-surface-700/50 z-50 flex flex-col shadow-[−40px_0_80px_rgba(0,0,0,0.6)]"
        style={{
          transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-surface-700/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-display text-white tracking-tight">Your Cart</h2>
            {cartCount > 0 && (
              <span className="bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-800 border border-surface-700/50 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mb-5">
                <i className="fas fa-bag-shopping text-3xl text-surface-600" />
              </div>
              <p className="text-white font-semibold text-base mb-1">Your cart is empty</p>
              <p className="text-surface-500 text-sm">Add something to get started.</p>
              <button
                onClick={() => { navigate('/products'); setCartOpen(false) }}
                className="mt-6 text-brand-500 hover:text-brand-400 font-semibold text-sm transition-colors"
              >
                Browse products →
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-surface-800 border border-surface-700/30 group">
                {/* Image */}
                <div className="w-20 h-20 bg-surface-700/50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                    : <i className="fas fa-image text-surface-600 text-xl" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-surface-600 hover:text-red-400 transition-colors p-0.5 shrink-0"
                    >
                      <i className="fas fa-xmark text-xs" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-brand-500 font-bold text-sm">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-surface-900 border border-surface-700/50 rounded-xl px-2 py-1">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center text-surface-400 hover:text-white transition-colors text-base leading-none"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center text-surface-400 hover:text-white transition-colors text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-6 border-t border-surface-700/50 bg-surface-950/60">
            <div className="flex justify-between items-center mb-5">
              <span className="text-surface-400 text-sm font-medium">Subtotal</span>
              <span className="text-2xl font-bold font-display text-white tracking-tight">
                ₦{cartSubtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewCart}
                className="flex-1 bg-surface-800 border border-surface-700/50 hover:border-surface-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-brand-500 hover:bg-brand-400 text-white py-3.5 rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_rgba(255,98,0,0.25)] hover:shadow-[0_0_30px_rgba(255,98,0,0.4)]"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
