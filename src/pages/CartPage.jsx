import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import NotificationContainer from '../components/NotificationContainer'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const LAGOS_LGA_FEES = {
  "Agege": 3000, "Ajeromi-Ifelodun": 3000, "Alimosho": 3000, "Amuwo-Odofin": 3000,
  "Apapa": 3000, "Epe": 6000, "Eti-Osa": 5000, "Ibeju-Lekki": 5000, "Lekki Phase": 4000,
  "Sangotedo": 4000, "Ajah": 4000, "Ifako-Ijaiye": 3000, "Ikeja": 3000, "Ikorodu": 4000,
  "Kosofe": 4000, "Lagos Island": 4000, "Lagos Mainland": 4000, "Mushin": 3000,
  "Ojo": 3000, "Oshodi-Isolo": 3000, "Shomolu": 3000, "Surulere": 3000
}

const STEPS = ['cart', 'checkout', 'complete']
const STEP_LABELS = { cart: 'Shopping Cart', checkout: 'Secure Checkout', complete: 'Order Complete' }

export default function CartPage() {
  const { cartItems, cartSubtotal, removeFromCart, changeQuantity, clearCart, guestId } = useCart()
  const { showNotification } = useNotification()
  const [step, setStep] = useState('cart')
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', street: '', state: 'Lagos', lga: '', areaCode: '+234', phone: '' })
  const [addressLocked, setAddressLocked] = useState(false)
  const [shippingFee, setShippingFee] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('gotoCheckout') === 'true') {
      localStorage.removeItem('gotoCheckout')
      if (cartItems.length > 0) setStep('checkout')
    }
  }, [cartItems])

  const total = cartSubtotal + shippingFee

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleConfirmAddress() {
    const { email, firstName, lastName, street, state, lga, phone } = form
    if (!email || !firstName || !lastName || !street || !state || !lga || !phone) {
      showNotification('Please fill all required fields', 'error')
      return
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      showNotification('Phone number must be at least 10 digits', 'error')
      return
    }
    const fee = state === 'Lagos' && LAGOS_LGA_FEES[lga] ? LAGOS_LGA_FEES[lga] : 0
    setShippingFee(fee)
    setAddressLocked(true)
  }

  function handlePlaceOrder() {
    if (!addressLocked) { showNotification('Please confirm shipping address first', 'warning'); return }
    if (!paymentMethod) { showNotification('Please select a payment method', 'warning'); return }
    if (!cartItems.length) { showNotification('Your cart is empty', 'warning'); return }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_0ed65a8011643dd303600706cb990c9ba067f199',
      email: form.email,
      amount: total * 100,
      currency: 'NGN',
      ref: 'PS-' + Date.now(),
      metadata: { name: `${form.firstName} ${form.lastName}`, phone: `${form.areaCode}${form.phone}` },
      callback: function(response) {
        addDoc(collection(db, 'orders'), {
          guestId,
          items: cartItems,
          address: {
            email: form.email,
            name: `${form.firstName} ${form.lastName}`,
            phone: `${form.areaCode}${form.phone}`,
            full: `${form.street}, ${form.lga}, ${form.state}`
          },
          subtotal: cartSubtotal,
          shippingFee,
          total,
          reference: response.reference,
          status: 'paid',
          createdAt: serverTimestamp()
        }).then(function() {
          return clearCart()
        }).then(function() {
          setStep('complete')
        })
      },
      onClose: () => showNotification('Payment window closed', 'info')
    })
    handler.openIframe()
  }

  const inputClass = "w-full h-14 px-5 rounded-2xl bg-surface-800 border border-surface-700/60 text-white font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all placeholder:font-normal placeholder:text-surface-500 [&_option]:bg-surface-800 [&_option]:text-white"
  const labelClass = "block text-sm font-bold text-surface-400 mb-2"

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <NotificationContainer />
        <div className="text-center bg-surface-900 border border-surface-700/50 p-12 rounded-[32px] max-w-lg mx-auto w-full animate-fade-up">
          <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="fas fa-check text-green-400 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold font-display text-white tracking-tight mb-4">Order Successful!</h2>
          <p className="text-surface-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Thank you for shopping with AY's Store. We've received your order and will process it shortly.
          </p>
          <Link
            to="/"
            className="inline-block bg-brand-500 hover:bg-brand-400 text-white px-10 py-4 rounded-full font-bold transition-colors shadow-[0_0_24px_rgba(255,98,0,0.3)]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-950 font-sans">
      <NotificationContainer />

      {/* Top Nav */}
      <nav className="bg-surface-900 border-b border-surface-700/50 h-20 flex items-center justify-between px-6 sticky top-0 z-40">
        <Link to="/" className="text-xl font-bold text-white font-display tracking-tight flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors">
            <i className="fas fa-bolt text-sm" />
          </div>
          AY&apos;s Store
        </Link>

        <div className="hidden sm:flex items-center gap-3 text-sm font-semibold">
          {STEPS.map((s, i) => {
            const done = STEPS.indexOf(step) > i
            const active = step === s
            const clickable =
              (s === 'cart' && step === 'checkout') ||
              (s === 'checkout' && step === 'cart' && cartItems.length > 0)
            function handleStepClick() {
              if (s === 'cart' && step === 'checkout') setStep('cart')
              if (s === 'checkout' && step === 'cart') {
                if (!cartItems.length) { showNotification('Your cart is empty', 'warning'); return }
                setStep('checkout')
              }
            }
            return (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <i className="fas fa-chevron-right text-[10px] text-surface-600" />}
                <button
                  onClick={handleStepClick}
                  disabled={!clickable}
                  className={`flex items-center gap-2 transition-colors ${active ? 'text-brand-500' : done ? 'text-surface-300' : 'text-surface-600'} ${clickable ? 'hover:text-white cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${active ? 'bg-brand-500 border-brand-500 text-white' : done ? 'bg-surface-700 border-surface-700 text-white' : 'bg-transparent border-surface-700 text-surface-600'}`}>
                    {done ? <i className="fas fa-check text-[10px]" /> : i + 1}
                  </span>
                  {STEP_LABELS[s]}
                </button>
              </span>
            )
          })}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-16">
        {step === 'cart' ? (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold font-display text-white tracking-tight mb-8">Review your bag.</h2>

              {cartItems.length === 0 ? (
                <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-16 text-center">
                  <div className="w-24 h-24 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-bag-shopping text-4xl text-surface-600" />
                  </div>
                  <p className="text-xl font-semibold text-white mb-2">Your bag is empty</p>
                  <p className="text-surface-500 mb-8">Time to fill it up with amazing tech.</p>
                  <Link to="/products" className="inline-block bg-brand-500 hover:bg-brand-400 text-white px-8 py-3.5 rounded-full font-bold transition-colors">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-5 bg-surface-900 border border-surface-700/50 p-5 rounded-[24px] group">
                      <div className="w-28 h-28 bg-surface-800 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                        {item.image || item.images?.[0]
                          ? <img src={item.image || item.images?.[0]} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                          : <i className="fas fa-image text-surface-600 text-2xl" />
                        }
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <h4 className="font-bold text-base text-white leading-tight line-clamp-2">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-surface-600 hover:text-red-400 transition-colors p-1 shrink-0 mt-0.5"
                          >
                            <i className="fas fa-xmark" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-2 bg-surface-800 border border-surface-700/50 rounded-xl px-3 py-2">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                              className="text-surface-400 hover:text-white transition-colors w-5 h-5 flex items-center justify-center text-base leading-none"
                            >−</button>
                            <span className="font-bold text-sm text-white w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                              className="text-surface-400 hover:text-white transition-colors w-5 h-5 flex items-center justify-center text-base leading-none"
                            >+</button>
                          </div>
                          <p className="font-bold font-display text-xl tracking-tight text-brand-500">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px]">
              <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-8 sticky top-28">
                <h3 className="font-bold font-display text-xl text-white tracking-tight mb-6">Order Summary</h3>
                <div className="space-y-4 font-medium">
                  <div className="flex justify-between text-surface-400 pb-4 border-b border-surface-700/50">
                    <span>Subtotal</span>
                    <span className="text-white">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-surface-400 pb-4 border-b border-surface-700/50">
                    <span>Shipping</span>
                    <span className="text-surface-500 font-normal text-sm">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-white font-semibold">Total</span>
                    <span className="font-bold font-display text-2xl tracking-tight text-white">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => { if (!cartItems.length) { showNotification('Your cart is empty', 'warning'); return }; setStep('checkout') }}
                  className="mt-8 w-full bg-brand-500 hover:bg-brand-400 text-white py-4 rounded-2xl font-bold text-base transition-colors shadow-[0_0_20px_rgba(255,98,0,0.2)] hover:shadow-[0_0_30px_rgba(255,98,0,0.4)]"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/products"
                  className="block mt-3 w-full bg-surface-800 hover:bg-surface-700 border border-surface-700/50 text-surface-300 hover:text-white py-4 rounded-2xl text-center font-semibold text-sm transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Checkout Form */}
            <div className="flex-1 space-y-6">

              {/* Shipping Form — visible only when address not yet confirmed */}
              {!addressLocked && (
                <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-8">
                  <h3 className="font-bold text-xl font-display tracking-tight text-white mb-7">1. Shipping details</h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="your@email.com" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="First name" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Last name" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Street Address</label>
                      <input name="street" value={form.street} onChange={handleFormChange} placeholder="123 Main St, Apartment 4B" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>State</label>
                        <select name="state" value={form.state} onChange={handleFormChange} className={inputClass}>
                          <option value="Lagos">Lagos</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Local Government Area</label>
                        <select name="lga" value={form.lga} onChange={handleFormChange} className={inputClass}>
                          <option value="">Select LGA</option>
                          {Object.keys(LAGOS_LGA_FEES).sort().map(lga => <option key={lga} value={lga}>{lga}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-28">
                        <label className={labelClass}>Code</label>
                        <input name="areaCode" value={form.areaCode} onChange={handleFormChange} className={`${inputClass} opacity-50 cursor-not-allowed`} disabled />
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="801 234 5678" className={inputClass} />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button onClick={handleConfirmAddress} className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-bold transition-colors">
                        Confirm Address
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Summary + Delivery + Payment — visible only after address confirmed */}
              {addressLocked && (
                <>
                  {/* Address Summary */}
                  <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-8">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                          <i className="fas fa-check text-white text-[10px]" />
                        </div>
                        <h3 className="font-bold text-xl font-display tracking-tight text-white">Shipping details</h3>
                      </div>
                      <button onClick={() => setAddressLocked(false)} className="text-sm font-bold text-brand-500 hover:text-brand-400 transition-colors">
                        Edit
                      </button>
                    </div>
                    <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
                      <p className="text-white font-semibold text-base mb-1">{form.firstName} {form.lastName}</p>
                      <p className="text-surface-400 text-sm mb-3">{form.email} &bull; {form.areaCode} {form.phone}</p>
                      <p className="text-surface-300 text-sm leading-relaxed">{form.street}<br />{form.lga}, {form.state}</p>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-8">
                    <h3 className="font-bold text-xl font-display tracking-tight text-white mb-6">2. Delivery method</h3>
                    <div className="border border-brand-500/60 bg-brand-500/[0.06] rounded-2xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-brand-500/15 border border-brand-500/30 rounded-xl flex items-center justify-center text-brand-500">
                          <i className="fas fa-truck-fast" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">Standard Delivery</p>
                          <p className="text-surface-400 text-sm mt-0.5">₦{shippingFee.toLocaleString()}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                          <i className="fas fa-check text-white text-[9px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-8">
                    <h3 className="font-bold text-xl font-display tracking-tight text-white mb-6">3. Payment method</h3>
                    <div
                      onClick={() => setPaymentMethod('Paystack')}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${paymentMethod === 'Paystack' ? 'border-brand-500/60 bg-brand-500/[0.06]' : 'border-surface-700/50 bg-surface-800 hover:border-surface-600'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'Paystack' ? 'border-brand-500' : 'border-surface-600'}`}>
                          {paymentMethod === 'Paystack' && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />}
                        </div>
                        <span className="font-bold text-white">Pay with Card or Transfer</span>
                      </div>
                      <img className="h-7 shrink-0" src="https://cdn.brandfetch.io/idM5mrwtDs/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX" alt="Paystack" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="w-full lg:w-[380px]">
              <div className="bg-surface-900 border border-surface-700/50 rounded-[32px] p-8 sticky top-28">
                <h3 className="font-bold text-xl font-display tracking-tight text-white mb-7">Summary</h3>

                <div className="space-y-4 mb-7">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 bg-surface-800 border border-surface-700/50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-1.5">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          : <i className="fas fa-image text-surface-600 text-sm" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white line-clamp-1 leading-tight">{item.name}</p>
                        <p className="text-surface-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                        <p className="font-bold text-brand-500 text-sm mt-0.5">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-surface-700/50 pt-5 space-y-3 text-sm font-medium">
                  <div className="flex justify-between text-surface-400">
                    <span>Subtotal</span>
                    <span className="text-white">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-surface-400">
                    <span>Shipping</span>
                    <span className="text-white">₦{shippingFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-surface-700/50 mt-5 pt-5 flex justify-between items-center">
                  <span className="text-surface-300 font-medium">Total</span>
                  <span className="font-bold font-display text-3xl tracking-tight text-white">₦{total.toLocaleString()}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!addressLocked || !paymentMethod}
                  className={`mt-6 w-full py-4 rounded-2xl font-bold text-base transition-all ${addressLocked && paymentMethod ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_24px_rgba(255,98,0,0.3)] hover:shadow-[0_0_36px_rgba(255,98,0,0.45)]' : 'bg-surface-800 text-surface-600 cursor-not-allowed border border-surface-700/50'}`}
                >
                  Pay ₦{total.toLocaleString()}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-surface-600 text-xs">
                  <i className="fas fa-lock" />
                  <span>Payments are secure and encrypted</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
