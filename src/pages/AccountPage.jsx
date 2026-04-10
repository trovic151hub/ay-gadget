import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

const STATUS_COLORS = {
  pending:    { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20', label: 'Pending' },
  processing: { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/20',   label: 'Processing' },
  shipped:    { bg: 'bg-brand-500/15',  text: 'text-brand-400',  border: 'border-brand-500/20',  label: 'Shipped' },
  delivered:  { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/20',  label: 'Delivered' },
  cancelled:  { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/20',    label: 'Cancelled' },
}

export default function AccountPage() {
  const { cartItems, cartCount, cartSubtotal, setCartOpen } = useCart()
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  function normalizePhone(raw) {
    const p = raw.replace(/\s+/g, '')
    if (p.startsWith('+234')) return p
    if (p.startsWith('234')) return '+' + p
    if (p.startsWith('0')) return '+234' + p
    return '+234' + p
  }

  async function handleLookup(e) {
    e.preventDefault()
    const cleaned = phone.replace(/\s+/g, '')
    if (!cleaned) return
    const normalized = normalizePhone(cleaned)
    setLoading(true)
    setError('')
    setSearched(false)
    try {
      const q = query(collection(db, 'orders'), where('address.phone', '==', normalized))
      const snap = await getDocs(q)
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0
          const tb = b.createdAt?.toMillis?.() ?? 0
          return tb - ta
        })
      setOrders(results)
      setSearched(true)
    } catch (err) {
      setError('Unable to look up orders right now. Please try again.')
      console.warn('Order lookup error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans">
      <NotificationContainer />
      <Navbar />
      <MiniCart />

      {/* Header */}
      <div className="pt-32 pb-14 px-6 text-center border-b border-surface-800">
        <span className="inline-block py-1 px-3 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 border border-brand-500/20">
          Account
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight mb-3">
          My Dashboard
        </h1>
        <p className="text-surface-400 text-base max-w-md mx-auto">
          Track your orders or view what&apos;s in your cart right now.
        </p>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14 space-y-10">

        {/* Cart summary */}
        <section className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-display text-white">Current Cart</h2>
            {cartCount > 0 && (
              <span className="text-xs font-bold bg-brand-500/15 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-full">
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {cartCount === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-bag-shopping text-3xl text-surface-600 mb-3 block" />
              <p className="text-surface-500 text-sm">Your cart is empty.</p>
              <Link to="/products" className="inline-block mt-4 text-brand-500 font-semibold text-sm hover:text-brand-400 transition-colors">
                Browse products
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700/50 overflow-hidden flex items-center justify-center shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                        : <i className="fas fa-image text-surface-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-surface-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-brand-500 font-bold text-sm shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-800 pt-4 flex items-center justify-between">
                <span className="text-surface-400 text-sm font-medium">Subtotal</span>
                <span className="text-white font-bold text-lg">₦{cartSubtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="w-full mt-4 bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </section>

        {/* Order lookup */}
        <section className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold font-display text-white mb-2">Track Your Order</h2>
          <p className="text-surface-400 text-sm mb-5">Enter the phone number you used at checkout to see your orders.</p>

          <form onSubmit={handleLookup} className="flex gap-3">
            <div className="relative flex-1">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-700/50 bg-surface-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all placeholder:text-surface-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shrink-0"
            >
              {loading ? <i className="fas fa-spinner fa-spin" /> : 'Look up'}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}

          {searched && orders.length === 0 && !error && (
            <div className="mt-6 text-center py-8">
              <i className="fas fa-inbox text-3xl text-surface-600 mb-3 block" />
              <p className="text-surface-400 text-sm">No orders found for that number.</p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="mt-6 space-y-4">
              {orders.map(order => {
                const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                const date = order.createdAt?.toDate?.()
                return (
                  <div key={order.id} className="border border-surface-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-white font-semibold text-sm">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        {date && (
                          <p className="text-surface-500 text-xs mt-0.5">
                            {date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                    {order.items?.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-surface-400 text-xs">
                            {item.name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-surface-800 pt-3 flex justify-between">
                      <span className="text-surface-500 text-xs">Total</span>
                      <span className="text-brand-500 font-bold text-sm">
                        ₦{Number(order.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Admin link — subtle, for store owner */}
        <p className="text-center text-surface-600 text-xs">
          Store owner?{' '}
          <Link to="/login" className="text-surface-500 hover:text-brand-500 transition-colors font-medium">
            Go to admin panel
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  )
}
