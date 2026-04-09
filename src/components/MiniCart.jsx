import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'

export default function MiniCart() {
  const { cartOpen, setCartOpen, cartItems, cartSubtotal, removeFromCart, changeQuantity, cartCount } = useCart()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

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
      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-[auto_0_40px_rgba(0,0,0,0.1)] z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-surface-100">
          <h2 className="text-2xl font-bold font-display text-surface-900 tracking-tight">Cart <span className="text-brand-500 text-lg ml-1 font-sans bg-brand-50 px-2 py-0.5 rounded-full">{cartCount}</span></h2>
          <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-50 text-surface-400 hover:text-surface-800 hover:bg-surface-100 transition-all">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-surface-400 h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-shopping-bag text-4xl text-surface-300" />
              </div>
              <p className="text-lg font-medium text-surface-600">Your cart is feeling light</p>
              <p className="text-sm mt-2 text-surface-400">Time to fill it up with amazing tech.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 py-4 border-b border-surface-100 last:border-0 group">
                <div className="w-24 h-24 bg-surface-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-surface-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-surface-300 hover:text-red-500 transition-colors p-1">
                      <i className="fas fa-trash-can text-sm" />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-brand-600 font-bold text-base tracking-tight">₦{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 bg-surface-100 rounded-full p-1 border border-surface-200 shadow-sm">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="text-surface-500 hover:text-surface-900 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm transition-colors"
                      >−</button>
                      <span className="text-xs font-bold w-6 text-center text-surface-700">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        className="text-surface-500 hover:text-surface-900 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-8 py-8 bg-white border-t border-surface-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-end mb-6">
            <span className="text-surface-500 font-medium">Subtotal</span>
            <span className="text-3xl font-bold font-display text-surface-900 tracking-tight">₦{cartSubtotal.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleViewCart} className="w-full bg-surface-50 border border-surface-200 text-surface-800 py-4 rounded-2xl text-sm font-bold hover:bg-surface-100 transition-colors">
              View Cart
            </button>
            <button onClick={handleCheckout} className="w-full bg-brand-500 text-white py-4 rounded-2xl text-sm font-bold hover:bg-brand-600 hover:shadow-glow transition-all transform hover:-translate-y-0.5">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}