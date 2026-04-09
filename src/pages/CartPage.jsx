import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import NotificationContainer from '../components/NotificationContainer'
import { Link } from 'react-router-dom'

const LAGOS_LGA_FEES = {
  "Agege": 3000, "Ajeromi-Ifelodun": 3000, "Alimosho": 3000, "Amuwo-Odofin": 3000,
  "Apapa": 3000, "Epe": 6000, "Eti-Osa": 5000, "Ibeju-Lekki": 5000, "Lekki Phase": 4000,
  "Sangotedo": 4000, "Ajah": 4000, "Ifako-Ijaiye": 3000, "Ikeja": 3000, "Ikorodu": 4000,
  "Kosofe": 4000, "Lagos Island": 4000, "Lagos Mainland": 4000, "Mushin": 3000,
  "Ojo": 3000, "Oshodi-Isolo": 3000, "Shomolu": 3000, "Surulere": 3000
}

const STEPS = ['cart', 'checkout', 'complete']

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
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxx',
      email: form.email,
      amount: total * 100,
      currency: 'NGN',
      ref: 'PS-' + Date.now(),
      metadata: { name: `${form.firstName} ${form.lastName}`, phone: `${form.areaCode}${form.phone}` },
      callback: async (response) => {
        await addDoc(collection(db, 'orders'), {
          guestId,
          items: cartItems,
          address: { email: form.email, name: `${form.firstName} ${form.lastName}`, phone: `${form.areaCode}${form.phone}`, full: `${form.street}, ${form.lga}, ${form.state}` },
          subtotal: cartSubtotal,
          shippingFee,
          total,
          reference: response.reference,
          status: 'paid',
          createdAt: serverTimestamp()
        })
        await clearCart()
        setStep('complete')
      },
      onClose: () => showNotification('Payment window closed', 'info')
    })
    handler.openIframe()
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-[32px] shadow-soft max-w-lg mx-auto w-full border border-surface-100 animate-fade-up">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-[8px] border-green-50/50">
            <i className="fas fa-check text-green-500 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold font-display text-surface-900 tracking-tight mb-4">Order Successful!</h2>
          <p className="text-surface-500 text-lg mb-10 max-w-sm mx-auto">Thank you for shopping with AY's Store. We've received your order and will process it shortly.</p>
          <a href="/" className="inline-block bg-surface-950 text-white px-10 py-4 rounded-full font-bold hover:bg-brand-500 transition-colors transform hover:-translate-y-1 shadow-md">
            Continue Shopping
          </a>
        </div>
      </div>
    )
  }

  const inputClass = "w-full h-14 px-5 rounded-2xl bg-surface-50 border border-surface-200 text-surface-900 font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all placeholder:font-normal placeholder:text-surface-400"
  const labelClass = "block text-sm font-bold text-surface-700 mb-2"

  return (
    <div className="min-h-screen bg-surface-50 font-sans pb-20">
      <NotificationContainer />

      {/* Top Nav */}
      <nav className="bg-white border-b border-surface-100 h-20 flex items-center justify-between px-6 sticky top-0 z-40">
        <a href="/" className="text-2xl font-bold text-surface-900 font-display tracking-tight flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors">
            <i className="fas fa-bolt text-sm" />
          </div>
          AY&apos;s Store
        </a>
        <div className="hidden sm:flex items-center gap-4 text-sm font-bold">
          {['cart', 'checkout', 'complete'].map((s, i) => (
            <span key={s} className={`flex items-center gap-4 ${step === s ? 'text-brand-600' : STEPS.indexOf(step) > i ? 'text-surface-900' : 'text-surface-300'}`}>
              {i > 0 && <i className="fas fa-chevron-right text-[10px] text-surface-200" />}
              <span className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === s ? 'bg-brand-100 text-brand-600' : STEPS.indexOf(step) > i ? 'bg-surface-100 text-surface-900' : 'bg-surface-50 text-surface-300'}`}>
                  {STEPS.indexOf(step) > i ? <i className="fas fa-check"></i> : i + 1}
                </span>
                <span className="capitalize tracking-wide">{s === 'cart' ? 'Shopping Cart' : s === 'checkout' ? 'Secure Checkout' : 'Complete'}</span>
              </span>
            </span>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
        {step === 'cart' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 animate-fade-up">
              <h2 className="text-3xl font-bold font-display text-surface-900 tracking-tight mb-8">Review your bag.</h2>
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-[32px] p-16 text-center text-surface-400 border border-surface-100 shadow-soft">
                  <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-shopping-bag text-4xl text-surface-300" />
                  </div>
                  <p className="text-xl font-medium text-surface-600 mb-2">Your bag is empty</p>
                  <p className="text-surface-400 mb-8">Time to fill it up with amazing tech.</p>
                  <a href="/" className="inline-block bg-surface-950 text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-500 transition-colors">Continue Shopping</a>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-6 bg-white p-6 rounded-[24px] shadow-soft border border-surface-100 group">
                      <div className="w-32 h-32 bg-surface-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                        <img src={item.image || item.images?.[0] || ''} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="flex justify-between gap-4">
                          <h4 className="font-bold text-lg text-surface-900 leading-tight">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-surface-300 hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 rounded-full hover:bg-red-50">
                            <i className="fas fa-trash-can" />
                          </button>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center gap-1 bg-surface-50 rounded-full p-1 border border-surface-200">
                            <button onClick={() => changeQuantity(item.id, -1)} className="text-surface-500 hover:text-surface-900 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm font-medium">−</button>
                            <span className="font-bold w-8 text-center text-surface-900">{item.quantity}</span>
                            <button onClick={() => changeQuantity(item.id, 1)} className="text-surface-500 hover:text-surface-900 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm font-medium">+</button>
                          </div>
                          <p className="font-bold font-display text-2xl tracking-tight text-surface-900">₦{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="w-full lg:w-[400px] animate-fade-up" style={{animationDelay: '100ms'}}>
              <div className="bg-white rounded-[32px] p-8 shadow-soft border border-surface-100 sticky top-28">
                <h3 className="font-bold font-display text-2xl text-surface-900 tracking-tight mb-6">Order Summary</h3>
                <div className="space-y-4 text-surface-600 font-medium">
                  <div className="flex justify-between pb-4 border-b border-surface-100">
                    <span>Subtotal</span>
                    <span className="text-surface-900">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-surface-100">
                    <span>Shipping</span>
                    <span className="text-surface-400 font-normal">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-lg text-surface-900">Total</span>
                    <span className="font-bold font-display text-3xl tracking-tight text-surface-900">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => { if (!cartItems.length) { showNotification('Your cart is empty', 'warning'); return }; setStep('checkout') }}
                  className="mt-8 w-full bg-surface-950 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-500 hover:shadow-glow transition-all transform hover:-translate-y-1"
                >
                  Checkout
                </button>
                <a href="/" className="block mt-4 w-full bg-surface-50 text-surface-700 py-4 rounded-2xl text-center font-bold hover:bg-surface-100 transition-colors">
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="flex-1 space-y-8 animate-fade-up">
              
              {/* Shipping Section */}
              <div className="bg-white rounded-[32px] p-8 shadow-soft border border-surface-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-2xl font-display tracking-tight text-surface-900">1. Shipping details</h3>
                  {addressLocked && (
                    <button onClick={() => setAddressLocked(false)} className="text-sm font-bold text-brand-600 hover:text-brand-700">Edit</button>
                  )}
                </div>

                {!addressLocked ? (
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
                      <div className="w-24">
                        <label className={labelClass}>Code</label>
                        <input name="areaCode" value={form.areaCode} onChange={handleFormChange} className={inputClass} disabled />
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="801 234 5678" className={inputClass} />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button onClick={handleConfirmAddress} className="bg-surface-950 text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-500 transition-colors">
                        Confirm Address
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200">
                    <p className="text-surface-900 font-medium text-lg mb-1">{form.firstName} {form.lastName}</p>
                    <p className="text-surface-500 mb-4">{form.email} &bull; {form.areaCode} {form.phone}</p>
                    <p className="text-surface-700 leading-relaxed max-w-md">{form.street}<br/>{form.lga}, {form.state}</p>
                  </div>
                )}
              </div>

              {/* Delivery Section */}
              <div className={`bg-white rounded-[32px] p-8 shadow-soft border border-surface-100 transition-opacity duration-300 ${!addressLocked ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <h3 className="font-bold text-2xl font-display tracking-tight text-surface-900 mb-6">2. Delivery method</h3>
                <div className="border-2 border-brand-500 bg-brand-50 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-100 rounded-bl-full flex items-center justify-center -mr-2 -mt-2">
                    <i className="fas fa-check text-brand-500 pl-2 pb-2"></i>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-500 shadow-sm">
                      <i className="fas fa-truck-fast text-lg"></i>
                    </div>
                    <div>
                      <p className="font-bold text-surface-900 text-lg">Standard Delivery</p>
                      <p className="text-surface-600 font-medium">₦{shippingFee.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className={`bg-white rounded-[32px] p-8 shadow-soft border border-surface-100 transition-opacity duration-300 ${!addressLocked ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <h3 className="font-bold text-2xl font-display tracking-tight text-surface-900 mb-6">3. Payment method</h3>
                <div
                  onClick={() => setPaymentMethod('Paystack')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'Paystack' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-surface-200 bg-surface-50 hover:border-surface-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Paystack' ? 'border-brand-500' : 'border-surface-300'}`}>
                      {paymentMethod === 'Paystack' && <div className="w-3 h-3 bg-brand-500 rounded-full" />}
                    </div>
                    <span className="font-bold text-surface-900 text-lg">Pay with Card or Transfer</span>
                  </div>
                  <img className="h-8" src="https://cdn.brandfetch.io/idM5mrwtDs/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX" alt="Paystack" />
                </div>
              </div>

            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-[400px] animate-fade-up" style={{animationDelay: '100ms'}}>
              <div className="bg-surface-950 rounded-[32px] p-8 shadow-xl sticky top-28 text-white">
                <h3 className="font-bold text-2xl font-display tracking-tight mb-8">Summary</h3>
                
                <div className="space-y-4 mb-8">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden p-1 flex-shrink-0">
                        <img src={item.image || ''} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-white line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-surface-400 text-xs mt-1">Qty: {item.quantity}</p>
                        <p className="font-bold text-brand-400 mt-1">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-surface-800 pt-6 space-y-4 text-surface-300 font-medium">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-white">₦{cartSubtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="text-white">₦{shippingFee.toLocaleString()}</span></div>
                </div>
                
                <div className="border-t border-surface-800 mt-6 pt-6 flex justify-between items-end">
                  <span className="text-lg text-surface-300">Total</span>
                  <span className="font-bold font-display text-4xl tracking-tight text-white">₦{total.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={!addressLocked || !paymentMethod}
                  className={`mt-8 w-full py-4 rounded-2xl font-bold text-lg transition-all ${addressLocked && paymentMethod ? 'bg-brand-500 text-white hover:bg-brand-400 hover:shadow-glow transform hover:-translate-y-1' : 'bg-surface-800 text-surface-500 cursor-not-allowed'}`}
                >
                  Pay ₦{total.toLocaleString()}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-surface-500 text-xs">
                  <i className="fas fa-lock"></i> Payments are secure and encrypted
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}