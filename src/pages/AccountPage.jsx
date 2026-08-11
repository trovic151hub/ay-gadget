import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import Navbar from '../components/Navbar'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useScrollLock } from '../hooks/useScrollLock'
import ProductThumb from '../components/ProductThumb'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

const STATUS_META = {
  pending:    { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400', label: 'Pending',    icon: 'fa-clock' },
  processing: { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/20',   dot: 'bg-blue-400',   label: 'Processing', icon: 'fa-gear' },
  shipped:    { bg: 'bg-brand-500/15',  text: 'text-brand-400',  border: 'border-brand-500/20',  dot: 'bg-brand-400',  label: 'Shipped',    icon: 'fa-truck-fast' },
  delivered:  { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/20',  dot: 'bg-green-400',  label: 'Delivered',  icon: 'fa-circle-check' },
  cancelled:  { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/20',    dot: 'bg-red-400',    label: 'Cancelled',  icon: 'fa-circle-xmark' },
}

function OrderModal({ order, onClose }) {
  const [copied, setCopied] = useState(false)

  useScrollLock(true)

  const status = STATUS_META[order.status] || STATUS_META.pending
  const date = order.createdAt?.toDate?.()
  const isCancelled = order.status === 'cancelled'

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  function copyRef() {
    if (order.reference) {
      navigator.clipboard.writeText(order.reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm touch-none" onClick={onClose}>
      <div
        className="bg-surface-900 border border-surface-700/50 rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-800 sticky top-0 bg-surface-900 rounded-t-[28px] z-10">
          <div>
            <p className="text-white font-bold text-base">Order #{order.id.slice(-6).toUpperCase()}</p>
            {date && (
              <p className="text-surface-500 text-xs mt-0.5">
                {date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
              {status.label}
            </span>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors">
              <i className="fas fa-xmark text-sm" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Status Timeline */}
          {!isCancelled ? (
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-4">Order Progress</p>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const meta = STATUS_META[step]
                  const done = currentStepIndex >= i
                  const active = currentStepIndex === i
                  const isLast = i === STATUS_STEPS.length - 1
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${done ? `${meta.dot} border-transparent` : 'bg-surface-800 border-surface-700'}`}>
                          <i className={`fas ${meta.icon} text-[10px] ${done ? 'text-white' : 'text-surface-600'}`} />
                        </div>
                        <span className={`text-[9px] font-bold text-center leading-tight ${active ? meta.text : done ? 'text-surface-400' : 'text-surface-600'}`}>
                          {meta.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full ${currentStepIndex > i ? 'bg-brand-500/60' : 'bg-surface-700'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
              <i className="fas fa-circle-xmark text-red-400" />
              <p className="text-red-400 text-sm font-semibold">This order has been cancelled.</p>
            </div>
          )}

          {/* Items */}
          {order.items?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Items Ordered</p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700/50 overflow-hidden flex items-center justify-center shrink-0 p-1">
                      <ProductThumb src={item.image || item.images?.[0]} alt={item.name} iconClassName="text-sm text-surface-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-surface-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-brand-500 font-bold text-sm shrink-0">
                      ₦{Number(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.address && (
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Delivery Address</p>
              <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-4 flex gap-3">
                <div className="w-8 h-8 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fas fa-location-dot text-brand-500 text-xs" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{order.address.name}</p>
                  <p className="text-surface-400 text-xs mt-0.5">{order.address.phone}</p>
                  <p className="text-surface-400 text-xs mt-1 leading-relaxed">{order.address.full}</p>
                </div>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div>
            <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Price Breakdown</p>
            <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Subtotal</span>
                <span className="text-white font-medium">₦{Number(order.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Shipping</span>
                <span className="text-white font-medium">₦{Number(order.shippingFee || 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-surface-700/50 pt-2.5 flex justify-between">
                <span className="text-white font-bold text-sm">Total</span>
                <span className="text-brand-500 font-bold text-base">₦{Number(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Reference */}
          {order.reference && (
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Payment Reference</p>
              <button
                onClick={copyRef}
                className="w-full flex items-center justify-between gap-3 bg-surface-800 border border-surface-700/50 hover:border-surface-600 rounded-2xl px-4 py-3 transition-all group"
              >
                <span className="text-surface-300 text-sm font-mono truncate">{order.reference}</span>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${copied ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-surface-700 text-surface-400 group-hover:text-white border border-surface-600'}`}>
                  {copied ? <><i className="fas fa-check mr-1" />Copied</> : <><i className="fas fa-copy mr-1" />Copy</>}
                </span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { cartItems, cartCount, cartSubtotal, setCartOpen, guestId } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Orders are tied to this browser's guestId (an unguessable token, same
  // as the cart) rather than a phone number — no login needed, and nobody
  // can look up a stranger's orders without already having their token.
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('guestId', '==', guestId))
    const unsub = onSnapshot(
      q,
      snap => {
        const results = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        setOrders(results)
        setLoading(false)
        setSelectedOrder(prev =>
          prev ? (results.find(o => o.id === prev.id) ?? null) : null
        )
      },
      err => {
        setError('Unable to load your orders right now. Please try again.')
        setLoading(false)
        console.warn('Orders listener error:', err.message)
      }
    )
    return unsub
  }, [guestId])

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
                      <ProductThumb src={item.image} alt={item.name} className="w-full h-full object-contain p-1" iconClassName="text-surface-600" />
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
          <h2 className="text-lg font-bold font-display text-white mb-2">Your Orders</h2>
          <p className="text-surface-400 text-sm mb-5">
            Orders placed from this browser show up here automatically. Checked out on a different device? Message us on WhatsApp with your order reference.
          </p>

          {loading && (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-surface-600 block mb-2" />
            </div>
          )}

          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-3xl text-surface-600 mb-3 block" />
              <p className="text-surface-400 text-sm">No orders yet on this device.</p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-surface-500 font-medium">{orders.length} order{orders.length !== 1 ? 's' : ''} — tap any to view details</p>
              {orders.map(order => {
                const status = STATUS_META[order.status] || STATUS_META.pending
                const date = order.createdAt?.toDate?.()
                const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) ?? 0
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left border border-surface-700/50 hover:border-surface-600 bg-surface-800/50 hover:bg-surface-800 rounded-2xl p-4 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${status.bg} border ${status.border} flex items-center justify-center shrink-0`}>
                          <i className={`fas ${status.icon} ${status.text} text-sm`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-surface-500 text-xs mt-0.5">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                            {date ? ` · ${date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-brand-500 font-bold text-sm">₦{Number(order.total || 0).toLocaleString()}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                            {status.label}
                          </span>
                        </div>
                        <i className="fas fa-chevron-right text-surface-600 group-hover:text-surface-400 text-xs transition-colors" />
                      </div>
                    </div>
                  </button>
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

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
