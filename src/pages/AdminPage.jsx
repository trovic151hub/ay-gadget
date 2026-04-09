import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import {
  collection, getDocs, addDoc, setDoc, doc, deleteDoc,
  serverTimestamp, query, orderBy, updateDoc
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const SECTIONS = ['products', 'gadgets', 'hero', 'orders']

const emptyProduct = { name: '', brand: '', description: '', price: '', images: [''] }
const emptyHero = { headline: '', subheadline: '', cta_primary_text: '', cta_secondary_text: '', type: 'image', url: '', active: true }

export default function AdminPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [section, setSection] = useState('products')
  const [products, setProducts] = useState([])
  const [gadgets, setGadgets] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [gadgetForm, setGadgetForm] = useState(emptyProduct)
  const [heroForm, setHeroForm] = useState(emptyHero)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingGadgetId, setEditingGadgetId] = useState(null)
  const [editingHeroId, setEditingHeroId] = useState(null)
  const [productModal, setProductModal] = useState(false)
  const [gadgetModal, setGadgetModal] = useState(false)
  const [heroModal, setHeroModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) navigate('/login')
      else setUser(u)
    })
    return unsub
  }, [navigate])

  useEffect(() => {
    fetchAll()
  }, [])

  const emptySnap = { docs: [] }

  async function safeGet(col, q) {
    try {
      return q ? await getDocs(q) : await getDocs(col)
    } catch {
      try { return await getDocs(col) } catch { return emptySnap }
    }
  }

  async function fetchAll() {
    setLoading(true)
    try {
      const [p, g, h, o] = await Promise.all([
        safeGet(collection(db, 'products'), query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        safeGet(collection(db, 'gadgets'), query(collection(db, 'gadgets'), orderBy('createdAt', 'desc'))),
        safeGet(collection(db, 'hero'), null),
        safeGet(collection(db, 'orders'), query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
      ])
      setProducts(p.docs.map(d => ({ id: d.id, ...d.data() })))
      setGadgets(g.docs.map(d => ({ id: d.id, ...d.data() })))
      setHeroSlides(h.docs.map(d => ({ id: d.id, ...d.data() })))
      setOrders(o.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.warn('Admin fetchAll error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProduct() {
    setSaving(true)
    const data = { ...productForm, price: Number(productForm.price), images: productForm.images.filter(Boolean), updatedAt: serverTimestamp() }
    if (editingProductId) {
      await setDoc(doc(db, 'products', editingProductId), data)
    } else {
      await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
    }
    setProductModal(false)
    setProductForm(emptyProduct)
    setEditingProductId(null)
    setSaving(false)
    fetchAll()
  }

  async function handleSaveGadget() {
    setSaving(true)
    const data = { ...gadgetForm, price: Number(gadgetForm.price), images: gadgetForm.images.filter(Boolean), updatedAt: serverTimestamp() }
    if (editingGadgetId) {
      await setDoc(doc(db, 'gadgets', editingGadgetId), data)
    } else {
      await addDoc(collection(db, 'gadgets'), { ...data, createdAt: serverTimestamp() })
    }
    setGadgetModal(false)
    setGadgetForm(emptyProduct)
    setEditingGadgetId(null)
    setSaving(false)
    fetchAll()
  }

  async function handleSaveHero() {
    setSaving(true)
    const data = { ...heroForm, updatedAt: serverTimestamp() }
    if (editingHeroId) {
      await setDoc(doc(db, 'hero', editingHeroId), data)
    } else {
      await addDoc(collection(db, 'hero'), { ...data, createdAt: serverTimestamp() })
    }
    setHeroModal(false)
    setHeroForm(emptyHero)
    setEditingHeroId(null)
    setSaving(false)
    fetchAll()
  }

  async function deleteItem(col, id) {
    if (!confirm('Delete this item?')) return
    await deleteDoc(doc(db, col, id))
    fetchAll()
  }

  async function updateOrderStatus(orderId, status) {
    await updateDoc(doc(db, 'orders', orderId), { status })
    fetchAll()
  }

  function openEditProduct(p) {
    setProductForm({ name: p.name || '', brand: p.brand || '', description: p.description || '', price: p.price || '', images: p.images?.length ? p.images : [''] })
    setEditingProductId(p.id)
    setProductModal(true)
  }

  function openEditGadget(g) {
    setGadgetForm({ name: g.name || '', brand: g.brand || '', description: g.description || '', price: g.price || '', images: g.images?.length ? g.images : [''] })
    setEditingGadgetId(g.id)
    setGadgetModal(true)
  }

  function openEditHero(h) {
    setHeroForm({ headline: h.headline || '', subheadline: h.subheadline || '', cta_primary_text: h.cta_primary_text || '', cta_secondary_text: h.cta_secondary_text || '', type: h.type || 'image', url: h.url || '', active: h.active ?? true })
    setEditingHeroId(h.id)
    setHeroModal(true)
  }

  const stats = [
    { label: 'Products', value: products.length, icon: 'fa-mobile-screen-button', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Gadgets', value: gadgets.length, icon: 'fa-headphones', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Hero Slides', value: heroSlides.length, icon: 'fa-images', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Orders', value: orders.length, icon: 'fa-bag-shopping', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ]

  return (
    <div className="min-h-screen bg-surface-950 flex font-sans text-surface-300 selection:bg-brand-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-900 border-r border-surface-800 flex-shrink-0 flex flex-col hidden md:flex z-10 shadow-2xl">
        <div className="p-6 border-b border-surface-800">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors shadow-glow">
              <i className="fas fa-bolt text-sm" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-white tracking-tight leading-none">AY&apos;s Store</h1>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-1">Command Center</p>
            </div>
          </a>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-4 mb-4">Management</p>
          {[
            { id: 'products', icon: 'fa-mobile-screen-button', label: 'Smartphones' },
            { id: 'gadgets', icon: 'fa-headphones', label: 'Accessories' },
            { id: 'hero', icon: 'fa-images', label: 'Hero Slides' },
            { id: 'orders', icon: 'fa-bag-shopping', label: 'Orders' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                section === item.id 
                  ? 'bg-brand-500 text-white shadow-glow' 
                  : 'text-surface-400 hover:bg-surface-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center ${section === item.id ? 'text-white' : 'text-surface-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-800">
          <div className="bg-surface-800 rounded-xl p-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-surface-300">
              <i className="fas fa-user-shield" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-brand-400 uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth).then(() => navigate('/login'))}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-surface-400 bg-surface-800 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
          >
            <i className="fas fa-power-off" />
            End Session
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-900 to-surface-950">
        {/* Header */}
        <div className="bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold font-display text-white capitalize tracking-tight">{section}</h2>
            <p className="text-sm text-surface-400 font-medium">Manage your {section} database</p>
          </div>
          <div className="flex gap-3">
            {section === 'products' && (
              <button onClick={() => { setProductForm(emptyProduct); setEditingProductId(null); setProductModal(true) }}
                className="bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-400 transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center gap-2">
                <i className="fas fa-plus" /> New Phone
              </button>
            )}
            {section === 'gadgets' && (
              <button onClick={() => { setGadgetForm(emptyProduct); setEditingGadgetId(null); setGadgetModal(true) }}
                className="bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-400 transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center gap-2">
                <i className="fas fa-plus" /> New Accessory
              </button>
            )}
            {section === 'hero' && (
              <button onClick={() => { setHeroForm(emptyHero); setEditingHeroId(null); setHeroModal(true) }}
                className="bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-400 transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center gap-2">
                <i className="fas fa-plus" /> New Slide
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats row */}
          {section === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 animate-fade-up">
              {stats.map(s => (
                <div key={s.label} className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                    <i className={`fas ${s.icon} text-2xl`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold font-display text-white tracking-tight leading-none mb-1">{s.value}</p>
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <div key={i} className="h-32 bg-surface-800 rounded-2xl animate-pulse border border-surface-700" />)}
            </div>
          ) : (
            <div className="animate-fade-up" style={{animationDelay: '100ms'}}>
              {/* Products */}
              {section === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg flex gap-5 group hover:border-surface-700 transition-colors">
                      <div className="w-24 h-24 bg-white rounded-xl flex-shrink-0 p-1 flex items-center justify-center">
                        <img src={p.images?.[0] || ''} alt={p.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-white text-base truncate mb-1">{p.name}</h3>
                          <span className="inline-block px-2 py-0.5 bg-surface-800 text-surface-400 text-[10px] font-bold uppercase tracking-wider rounded-md">{p.brand}</span>
                        </div>
                        <div className="flex items-end justify-between mt-3">
                          <p className="text-brand-400 font-bold font-display text-lg leading-none tracking-tight">₦{Number(p.price).toLocaleString()}</p>
                          <div className="flex gap-2">
                            <button onClick={() => openEditProduct(p)} className="w-8 h-8 rounded-lg bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center">
                              <i className="fas fa-pen text-sm" />
                            </button>
                            <button onClick={() => deleteItem('products', p.id)} className="w-8 h-8 rounded-lg bg-surface-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors flex items-center justify-center">
                              <i className="fas fa-trash text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Gadgets */}
              {section === 'gadgets' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {gadgets.map(g => (
                    <div key={g.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg flex gap-5 group hover:border-surface-700 transition-colors">
                      <div className="w-24 h-24 bg-white rounded-xl flex-shrink-0 p-1 flex items-center justify-center">
                        <img src={g.images?.[0] || ''} alt={g.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-white text-base truncate mb-1">{g.name}</h3>
                          <span className="inline-block px-2 py-0.5 bg-surface-800 text-surface-400 text-[10px] font-bold uppercase tracking-wider rounded-md">{g.brand}</span>
                        </div>
                        <div className="flex items-end justify-between mt-3">
                          <p className="text-brand-400 font-bold font-display text-lg leading-none tracking-tight">₦{Number(g.price).toLocaleString()}</p>
                          <div className="flex gap-2">
                            <button onClick={() => openEditGadget(g)} className="w-8 h-8 rounded-lg bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center">
                              <i className="fas fa-pen text-sm" />
                            </button>
                            <button onClick={() => deleteItem('gadgets', g.id)} className="w-8 h-8 rounded-lg bg-surface-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors flex items-center justify-center">
                              <i className="fas fa-trash text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hero */}
              {section === 'hero' && (
                <div className="space-y-4 max-w-4xl">
                  {heroSlides.map(h => (
                    <div key={h.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg flex gap-6 items-center">
                      <div className="w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-surface-700 relative group">
                        {h.type === 'image' ? (
                          <img src={h.url} alt={h.headline} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-950 flex items-center justify-center relative">
                            <video src={h.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            <i className="fas fa-video text-surface-500 text-2xl relative z-10" />
                          </div>
                        )}
                        <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none ${h.active ? 'border-brand-500' : 'border-transparent'}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${h.active ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-surface-800 text-surface-500'}`}>
                            {h.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{h.type}</span>
                        </div>
                        <h3 className="font-bold text-white text-lg">{h.headline}</h3>
                        <p className="text-sm text-surface-400 mt-1 line-clamp-1">{h.subheadline}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => openEditHero(h)} className="w-10 h-10 rounded-xl bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center">
                          <i className="fas fa-pen" />
                        </button>
                        <button onClick={() => deleteItem('hero', h.id)} className="w-10 h-10 rounded-xl bg-surface-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors flex items-center justify-center">
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!heroSlides.length && (
                    <div className="text-center bg-surface-900 border border-surface-800 rounded-3xl py-20 px-6">
                      <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-images text-2xl text-surface-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No slides configured</h3>
                      <p className="text-surface-400 text-sm">Add hero slides to make a strong first impression.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Orders */}
              {section === 'orders' && (
                <div className="space-y-6">
                  {orders.map(o => (
                    <div key={o.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-lg">
                      <div className="flex flex-col md:flex-row md:justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">New Order</span>
                            <span className="text-surface-500 text-sm font-mono">{o.id.slice(0,8)}</span>
                          </div>
                          <p className="font-bold text-white text-lg">{o.address?.name || 'Guest Order'}</p>
                          <div className="flex items-center gap-4 text-sm text-surface-400 mt-2">
                            <span className="flex items-center gap-1.5"><i className="fas fa-envelope text-surface-600"></i> {o.address?.email}</span>
                            <span className="flex items-center gap-1.5"><i className="fas fa-phone text-surface-600"></i> {o.address?.phone}</span>
                          </div>
                          <div className="mt-4 p-4 bg-surface-950 rounded-xl border border-surface-800">
                            <p className="text-sm text-surface-300 font-medium leading-relaxed flex items-start gap-2">
                              <i className="fas fa-map-marker-alt text-brand-500 mt-1"></i> {o.address?.full}
                            </p>
                          </div>
                        </div>
                        
                        <div className="w-full md:w-64 flex flex-col items-start md:items-end">
                          <div className="text-left md:text-right w-full mb-4">
                            <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="font-bold font-display text-brand-400 text-3xl tracking-tight">₦{(o.total || 0).toLocaleString()}</p>
                          </div>
                          
                          <div className="w-full">
                            <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-2 text-left md:text-right">Order Status</p>
                            <div className="relative">
                              <select
                                value={o.status || 'paid'}
                                onChange={e => updateOrderStatus(o.id, e.target.value)}
                                className={`w-full appearance-none rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 border cursor-pointer
                                  ${o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 focus:ring-emerald-500' : 
                                    o.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 focus:ring-blue-500' :
                                    o.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 focus:ring-amber-500' :
                                    o.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20 focus:ring-red-500' :
                                    'bg-surface-800 text-white border-surface-700 focus:ring-brand-500'
                                  }
                                `}
                              >
                                <option value="paid" className="bg-surface-900 text-white">Paid</option>
                                <option value="processing" className="bg-surface-900 text-amber-400">Processing</option>
                                <option value="shipped" className="bg-surface-900 text-blue-400">Shipped</option>
                                <option value="delivered" className="bg-surface-900 text-emerald-400">Delivered</option>
                                <option value="cancelled" className="bg-surface-900 text-red-400">Cancelled</option>
                              </select>
                              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none text-xs"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-surface-800">
                        <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-3">Order Items</p>
                        <div className="flex flex-wrap gap-2">
                          {(o.items || []).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-surface-950 border border-surface-800 rounded-lg pr-3 overflow-hidden">
                              <div className="bg-white p-1 w-10 h-10 flex items-center justify-center">
                                <img src={item.image || ''} className="w-full h-full object-contain" alt="" />
                              </div>
                              <span className="text-sm font-medium text-surface-300">
                                {item.name} <span className="text-brand-500 font-bold ml-1">x{item.quantity}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!orders.length && (
                    <div className="text-center bg-surface-900 border border-surface-800 rounded-3xl py-20 px-6">
                      <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-box-open text-2xl text-surface-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                      <p className="text-surface-400 text-sm">When customers place orders, they will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {productModal && (
        <FormModal
          title={editingProductId ? 'Edit Smartphone' : 'Add Smartphone'}
          onClose={() => setProductModal(false)}
          onSave={handleSaveProduct}
          saving={saving}
        >
          <ItemForm form={productForm} setForm={setProductForm} />
        </FormModal>
      )}

      {/* Gadget Modal */}
      {gadgetModal && (
        <FormModal
          title={editingGadgetId ? 'Edit Accessory' : 'Add Accessory'}
          onClose={() => setGadgetModal(false)}
          onSave={handleSaveGadget}
          saving={saving}
        >
          <ItemForm form={gadgetForm} setForm={setGadgetForm} />
        </FormModal>
      )}

      {/* Hero Modal */}
      {heroModal && (
        <FormModal
          title={editingHeroId ? 'Edit Hero Slide' : 'Add Hero Slide'}
          onClose={() => setHeroModal(false)}
          onSave={handleSaveHero}
          saving={saving}
        >
          <HeroForm form={heroForm} setForm={setHeroForm} />
        </FormModal>
      )}
    </div>
  )
}

function FormModal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative bg-surface-900 border border-surface-700 rounded-[32px] w-full max-w-xl shadow-2xl z-10 max-h-[90vh] flex flex-col animate-slide-in">
        <div className="flex justify-between items-center p-8 border-b border-surface-800">
          <h3 className="font-bold text-2xl font-display text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center">
            <i className="fas fa-times text-lg" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {children}
        </div>
        <div className="p-8 border-t border-surface-800 flex gap-4 bg-surface-900/50 rounded-b-[32px]">
          <button onClick={onClose} className="flex-1 bg-surface-800 text-white py-4 rounded-2xl font-bold hover:bg-surface-700 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving} className="flex-1 bg-brand-500 text-white py-4 rounded-2xl font-bold hover:bg-brand-400 hover:shadow-glow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:bg-brand-500 disabled:hover:-translate-y-0 disabled:hover:shadow-none">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-circle-notch fa-spin" /> Saving...
              </span>
            ) : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemForm({ form, setForm }) {
  function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }
  function handleImageChange(i, val) {
    const imgs = [...form.images]
    imgs[i] = val
    setForm(prev => ({ ...prev, images: imgs }))
  }
  function addImageField() { setForm(prev => ({ ...prev, images: [...prev.images, ''] })) }
  function removeImageField(i) { setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) })) }

  const labelClass = "block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider"
  const inputClass = "w-full h-14 px-5 rounded-2xl bg-surface-950 border border-surface-800 text-white font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700 placeholder:font-normal"

  return (
    <>
      <div><label className={labelClass}>Product Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. iPhone 15 Pro Max" className={inputClass} /></div>
      <div className="grid grid-cols-2 gap-5">
        <div><label className={labelClass}>Brand</label><input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Apple" className={inputClass} /></div>
        <div><label className={labelClass}>Price (₦) *</label><input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Product details..." className="w-full p-5 rounded-2xl bg-surface-950 border border-surface-800 text-white font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700 placeholder:font-normal resize-none" /></div>
      
      <div className="bg-surface-950 p-6 rounded-2xl border border-surface-800">
        <label className={`${labelClass} mb-4 flex items-center justify-between`}>
          <span>Media URLs</span>
          <span className="text-[10px] text-surface-600 normal-case font-normal">(HTTPS links required)</span>
        </label>
        <div className="space-y-3">
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-3">
              <div className="relative flex-1">
                <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-surface-600 text-sm" />
                <input value={img} onChange={e => handleImageChange(i, e.target.value)} placeholder="https://..." className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-900 border border-surface-700 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
              </div>
              {form.images.length > 1 && (
                <button onClick={() => removeImageField(i)} className="w-12 h-12 rounded-xl bg-surface-900 text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center">
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addImageField} className="mt-4 text-brand-500 text-sm font-bold hover:text-brand-400 flex items-center gap-2 transition-colors">
          <i className="fas fa-plus-circle" /> Add another image
        </button>
      </div>
    </>
  )
}

function HeroForm({ form, setForm }) {
  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
  }
  
  const labelClass = "block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider"
  const inputClass = "w-full h-14 px-5 rounded-2xl bg-surface-950 border border-surface-800 text-white font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700 placeholder:font-normal"

  return (
    <>
      <div className="flex items-center justify-between bg-surface-950 p-4 rounded-2xl border border-surface-800 mb-6">
        <div>
          <p className="text-sm font-bold text-white mb-1">Slide Status</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wider font-bold">Show on homepage</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="sr-only peer" />
          <div className="w-14 h-7 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
        </label>
      </div>

      <div><label className={labelClass}>Main Headline *</label><input name="headline" value={form.headline} onChange={handleChange} className={inputClass} placeholder="e.g. The New iPhone 15" /></div>
      <div><label className={labelClass}>Subheadline</label><input name="subheadline" value={form.subheadline} onChange={handleChange} className={inputClass} placeholder="e.g. Titanium design. A17 Pro chip." /></div>
      
      <div className="grid grid-cols-2 gap-5">
        <div><label className={labelClass}>Primary Button Text</label><input name="cta_primary_text" value={form.cta_primary_text} onChange={handleChange} className={inputClass} placeholder="e.g. Buy Now" /></div>
        <div><label className={labelClass}>Secondary Button Text</label><input name="cta_secondary_text" value={form.cta_secondary_text} onChange={handleChange} className={inputClass} placeholder="e.g. Learn More" /></div>
      </div>
      
      <div className="bg-surface-950 p-6 rounded-2xl border border-surface-800">
        <label className={labelClass}>Media Settings</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${form.type === 'image' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-surface-800 bg-surface-900 text-surface-500 hover:border-surface-700'}`}>
            <input type="radio" name="type" value="image" checked={form.type === 'image'} onChange={handleChange} className="sr-only" />
            <i className="fas fa-image text-xl" />
            <span className="font-bold text-sm">Image</span>
          </label>
          <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-colors ${form.type === 'video' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-surface-800 bg-surface-900 text-surface-500 hover:border-surface-700'}`}>
            <input type="radio" name="type" value="video" checked={form.type === 'video'} onChange={handleChange} className="sr-only" />
            <i className="fas fa-video text-xl" />
            <span className="font-bold text-sm">Video</span>
          </label>
        </div>
        <div className="relative">
          <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-surface-600 text-sm" />
          <input name="url" value={form.url} onChange={handleChange} placeholder="https://..." className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-900 border border-surface-700 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
        </div>
      </div>
    </>
  )
}