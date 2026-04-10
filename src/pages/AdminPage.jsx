import { useState, useEffect, useRef } from 'react'
import { db, auth } from '../firebase'
import {
  collection, getDocs, addDoc, setDoc, doc, deleteDoc,
  serverTimestamp, query, orderBy, updateDoc, onSnapshot
} from 'firebase/firestore'
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const SECTIONS = ['products', 'gadgets', 'hero', 'orders', 'settings']

const STATUS_CONFIG = {
  paid:       { label: 'Paid',       color: 'text-white',        bg: 'bg-surface-700',       border: 'border-surface-600' },
  pending:    { label: 'Pending',    color: 'text-yellow-400',   bg: 'bg-yellow-500/15',     border: 'border-yellow-500/20' },
  processing: { label: 'Processing', color: 'text-amber-400',    bg: 'bg-amber-500/15',      border: 'border-amber-500/20' },
  shipped:    { label: 'Shipped',    color: 'text-blue-400',     bg: 'bg-blue-500/15',       border: 'border-blue-500/20' },
  delivered:  { label: 'Delivered',  color: 'text-emerald-400',  bg: 'bg-emerald-500/15',    border: 'border-emerald-500/20' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',      bg: 'bg-red-500/15',        border: 'border-red-500/20' },
}

const emptyProduct = { name: '', brand: '', description: '', price: '', condition: '', images: [''] }
const emptyHero = { headline: '', subheadline: '', cta_primary_text: '', cta_secondary_text: '', type: 'image', url: '', active: true }

function timeAgo(date) {
  if (!date) return null
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return 'Just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [section, setSection] = useState(() => localStorage.getItem('adminSection') || 'products')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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
  const [viewingItem, setViewingItem] = useState(null)
  const [viewingCollection, setViewingCollection] = useState('products')
  const [productSearch, setProductSearch] = useState('')
  const [gadgetSearch, setGadgetSearch] = useState('')
  const [productLimit, setProductLimit] = useState(9)
  const [gadgetLimit, setGadgetLimit] = useState(9)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderLimit, setOrderLimit] = useState(10)
  const [adminsList, setAdminsList] = useState([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminConfirm, setNewAdminConfirm] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [createAdminError, setCreateAdminError] = useState('')
  const [createAdminSuccess, setCreateAdminSuccess] = useState('')
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [changePwCurrent, setChangePwCurrent] = useState('')
  const [changePwNew, setChangePwNew] = useState('')
  const [changePwConfirm, setChangePwConfirm] = useState('')
  const [changePwError, setChangePwError] = useState('')
  const [changePwSuccess, setChangePwSuccess] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [showCurrPw, setShowCurrPw] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const unsubOrdersRef = useRef(null)
  const unsubAdminsRef = useRef(null)
  const [tick, setTick] = useState(0)

  // Keep "X mins ago" labels fresh every minute
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  // Write lastActive to Firestore when admin signs in, then refresh every 5 minutes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      try {
        await updateDoc(doc(db, 'admins', u.uid), { lastActive: serverTimestamp() })
      } catch { /* admin doc may not exist yet (owner account) */ }
    })
    return unsub
  }, [navigate])

  useEffect(() => {
    if (!auth.currentUser) return
    const id = setInterval(async () => {
      try {
        await updateDoc(doc(db, 'admins', auth.currentUser.uid), { lastActive: serverTimestamp() })
      } catch { /* silent */ }
    }, 2 * 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetchAll()
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    unsubOrdersRef.current = onSnapshot(ordersQuery, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, err => console.warn('Orders listener error:', err.message))
    return () => { if (unsubOrdersRef.current) unsubOrdersRef.current() }
  }, [])

  function subscribeAdmins() {
    if (unsubAdminsRef.current) return
    try {
      unsubAdminsRef.current = onSnapshot(
        collection(db, 'admins'),
        snap => setAdminsList(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        err => console.warn('admins listener error:', err.message)
      )
    } catch (err) {
      console.warn('subscribeAdmins error:', err.message)
    }
  }

  function fetchAdmins() { subscribeAdmins() }

  useEffect(() => {
    localStorage.setItem('adminSection', section)
    if (section === 'settings') subscribeAdmins()
    else {
      if (unsubAdminsRef.current) { unsubAdminsRef.current(); unsubAdminsRef.current = null }
    }
  }, [section])

  async function handleCreateAdmin() {
    setCreateAdminError('')
    setCreateAdminSuccess('')
    if (!newAdminEmail.trim() || !newAdminPassword) return setCreateAdminError('Email and password are required.')
    if (newAdminPassword !== newAdminConfirm) return setCreateAdminError('Passwords do not match.')
    if (newAdminPassword.length < 6) return setCreateAdminError('Password must be at least 6 characters.')
    setCreatingAdmin(true)
    try {
      const secondaryApp = await import('firebase/app').then(m => {
        try { return m.getApp('secondary') } catch { return null }
      })
      let cred
      if (secondaryApp) {
        const { getAuth: getA } = await import('firebase/auth')
        cred = await createUserWithEmailAndPassword(getA(secondaryApp), newAdminEmail.trim(), newAdminPassword)
      } else {
        const { initializeApp, getApp } = await import('firebase/app')
        const { getAuth: getA } = await import('firebase/auth')
        let app2
        try { app2 = getApp('secondary') } catch { app2 = initializeApp(auth.app.options, 'secondary') }
        cred = await createUserWithEmailAndPassword(getA(app2), newAdminEmail.trim(), newAdminPassword)
      }
      await setDoc(doc(db, 'admins', cred.user.uid), {
        email: newAdminEmail.trim(),
        uid: cred.user.uid,
        createdAt: serverTimestamp()
      })
      setCreateAdminSuccess(`Admin "${newAdminEmail.trim()}" created successfully.`)
      setNewAdminEmail('')
      setNewAdminPassword('')
      setNewAdminConfirm('')
      fetchAdmins()
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'That email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      }
      setCreateAdminError(msgs[err.code] || err.message)
    } finally {
      setCreatingAdmin(false)
    }
  }

  async function handleDeleteAdmin(adminId, adminEmail) {
    if (!confirm(`Remove admin "${adminEmail}"? They will no longer have access.`)) return
    await deleteDoc(doc(db, 'admins', adminId))
    fetchAdmins()
  }

  async function handleChangePassword() {
    setChangePwError('')
    setChangePwSuccess('')
    if (!changePwCurrent) return setChangePwError('Please enter your current password.')
    if (!changePwNew) return setChangePwError('Please enter a new password.')
    if (changePwNew.length < 6) return setChangePwError('New password must be at least 6 characters.')
    if (changePwNew !== changePwConfirm) return setChangePwError('New passwords do not match.')
    setChangingPw(true)
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, changePwCurrent)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, changePwNew)
      setChangePwSuccess('Password updated successfully.')
      setChangePwCurrent('')
      setChangePwNew('')
      setChangePwConfirm('')
    } catch (err) {
      const msgs = {
        'auth/wrong-password': 'Current password is incorrect.',
        'auth/invalid-credential': 'Current password is incorrect.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      }
      setChangePwError(msgs[err.code] || err.message)
    } finally {
      setChangingPw(false)
    }
  }

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
      const [p, g, h] = await Promise.all([
        safeGet(collection(db, 'products'), query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        safeGet(collection(db, 'gadgets'), query(collection(db, 'gadgets'), orderBy('createdAt', 'desc'))),
        safeGet(collection(db, 'hero'), null),
      ])
      setProducts(p.docs.map(d => ({ id: d.id, ...d.data() })))
      setGadgets(g.docs.map(d => ({ id: d.id, ...d.data() })))
      setHeroSlides(h.docs.map(d => ({ id: d.id, ...d.data() })))
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
      await updateDoc(doc(db, 'products', editingProductId), data)
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
      await updateDoc(doc(db, 'gadgets', editingGadgetId), data)
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
      await updateDoc(doc(db, 'hero', editingHeroId), data)
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
  }

  function openEditProduct(p) {
    setProductForm({ name: p.name || '', brand: p.brand || '', description: p.description || '', price: p.price || '', condition: p.condition || '', images: p.images?.length ? p.images : [''] })
    setEditingProductId(p.id)
    setProductModal(true)
  }

  function openEditGadget(g) {
    setGadgetForm({ name: g.name || '', brand: g.brand || '', description: g.description || '', price: g.price || '', condition: g.condition || '', images: g.images?.length ? g.images : [''] })
    setEditingGadgetId(g.id)
    setGadgetModal(true)
  }

  function openEditHero(h) {
    setHeroForm({ headline: h.headline || '', subheadline: h.subheadline || '', cta_primary_text: h.cta_primary_text || '', cta_secondary_text: h.cta_secondary_text || '', type: h.type || 'image', url: h.url || '', active: h.active ?? true })
    setEditingHeroId(h.id)
    setHeroModal(true)
  }

  const filteredProducts = products.filter(p =>
    `${p.name} ${p.brand}`.toLowerCase().includes(productSearch.toLowerCase())
  )
  const filteredGadgets = gadgets.filter(g =>
    `${g.name} ${g.brand}`.toLowerCase().includes(gadgetSearch.toLowerCase())
  )
  const visibleProducts = filteredProducts.slice(0, productLimit)
  const visibleGadgets = filteredGadgets.slice(0, gadgetLimit)

  const orderStatusCounts = orders.reduce((acc, o) => {
    const s = o.status || 'paid'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})
  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase()
    const matchesSearch = !q ||
      (o.address?.name || '').toLowerCase().includes(q) ||
      (o.address?.phone || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q) ||
      (o.reference || '').toLowerCase().includes(q)
    const matchesStatus = orderStatusFilter === 'all' || (o.status || 'paid') === orderStatusFilter
    return matchesSearch && matchesStatus
  })
  const visibleOrders = filteredOrders.slice(0, orderLimit)

  const stats = [
    { label: 'Products', section: 'products', value: products.length, icon: 'fa-mobile-screen-button', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Gadgets', section: 'gadgets', value: gadgets.length, icon: 'fa-headphones', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Hero Slides', section: 'hero', value: heroSlides.length, icon: 'fa-images', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Orders', section: 'orders', value: orders.length, icon: 'fa-bag-shopping', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ]

  const NAV_ITEMS = [
    { id: 'products', icon: 'fa-mobile-screen-button', label: 'Smartphones' },
    { id: 'gadgets', icon: 'fa-headphones', label: 'Accessories' },
    { id: 'hero', icon: 'fa-images', label: 'Hero Slides' },
    { id: 'orders', icon: 'fa-bag-shopping', label: 'Orders' },
    { id: 'settings', icon: 'fa-users-gear', label: 'Admin Settings' }
  ]

  return (
    <div className="min-h-screen bg-surface-950 flex font-sans text-surface-300 selection:bg-brand-500 selection:text-white">

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-surface-900 border-r border-surface-800
        flex-shrink-0 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        md:relative md:sticky md:top-0 md:h-screen md:translate-x-0
        ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-surface-800 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors shadow-glow">
              <i className="fas fa-bolt text-sm" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-white tracking-tight leading-none">AY&apos;s Store</h1>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-1">Command Center</p>
            </div>
          </a>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden w-8 h-8 rounded-lg bg-surface-800 text-surface-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-4 mb-4">Management</p>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setMobileNavOpen(false) }}
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
            <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-surface-300 flex-shrink-0">
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
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-900 to-surface-950">
        {/* Header */}
        <div className="bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center sticky top-0 z-10 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden w-9 h-9 bg-surface-800 rounded-xl flex items-center justify-center text-surface-300 hover:text-white transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <i className="fas fa-bars text-base" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-bold font-display text-white capitalize tracking-tight truncate">
                {section === 'settings' ? 'Admin Settings' : section}
              </h2>
              <p className="text-xs md:text-sm text-surface-400 font-medium hidden sm:block">
                {section === 'settings' ? 'Manage admins and your account security' : `Manage your ${section} database`}
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {section === 'products' && (
              <button onClick={() => { setProductForm(emptyProduct); setEditingProductId(null); setProductModal(true) }}
                className="bg-brand-500 text-white px-4 md:px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-400 transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center gap-2">
                <i className="fas fa-plus" /> <span className="hidden sm:inline">New Phone</span><span className="sm:hidden">Add</span>
              </button>
            )}
            {section === 'gadgets' && (
              <button onClick={() => { setGadgetForm(emptyProduct); setEditingGadgetId(null); setGadgetModal(true) }}
                className="bg-brand-500 text-white px-4 md:px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-400 transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center gap-2">
                <i className="fas fa-plus" /> <span className="hidden sm:inline">New Accessory</span><span className="sm:hidden">Add</span>
              </button>
            )}
            {section === 'hero' && (
              <button onClick={() => { setHeroForm(emptyHero); setEditingHeroId(null); setHeroModal(true) }}
                className="bg-brand-500 text-white px-4 md:px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-400 transition-all shadow-glow transform hover:-translate-y-0.5 flex items-center gap-2">
                <i className="fas fa-plus" /> <span className="hidden sm:inline">New Slide</span><span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 pb-16">
          {/* Stats row — always visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 animate-fade-up">
            {stats.map(s => (
              <button
                key={s.label}
                onClick={() => setSection(s.section)}
                className={`bg-surface-900 border rounded-2xl p-6 shadow-xl flex items-center gap-5 text-left transition-all duration-200 hover:border-surface-600 ${section === s.section ? 'border-brand-500/40 shadow-glow' : 'border-surface-800'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                  <i className={`fas ${s.icon} text-2xl`} />
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-white tracking-tight leading-none mb-1">{s.value}</p>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">{s.label}</p>
                </div>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <div key={i} className="h-32 bg-surface-800 rounded-2xl animate-pulse border border-surface-700" />)}
            </div>
          ) : (
            <div className="animate-fade-up" style={{animationDelay: '100ms'}}>
              {/* Products */}
              {section === 'products' && (
                <div className="space-y-6">
                  {/* Search bar */}
                  <div className="relative">
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 text-sm pointer-events-none" />
                    <input
                      value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setProductLimit(9) }}
                      placeholder="Search by name or brand…"
                      className="w-full h-12 pl-12 pr-5 rounded-2xl bg-surface-900 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-600"
                    />
                    {productSearch && (
                      <button onClick={() => { setProductSearch(''); setProductLimit(9) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white transition-colors">
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center bg-surface-900 border border-surface-800 rounded-3xl py-16 px-6">
                      <div className="w-14 h-14 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-search text-xl text-surface-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">No results for "{productSearch}"</h3>
                      <p className="text-surface-400 text-sm">Try a different name or brand.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleProducts.map(p => (
                          <div
                            key={p.id}
                            onClick={() => { setViewingItem(p); setViewingCollection('products') }}
                            className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg flex gap-5 group hover:border-brand-500/40 hover:shadow-glow transition-all cursor-pointer"
                          >
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
                                  <button onClick={e => { e.stopPropagation(); openEditProduct(p) }} className="w-8 h-8 rounded-lg bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center">
                                    <i className="fas fa-pen text-sm" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); deleteItem('products', p.id) }} className="w-8 h-8 rounded-lg bg-surface-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors flex items-center justify-center">
                                    <i className="fas fa-trash text-sm" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {filteredProducts.length > productLimit && (
                        <div className="flex flex-col items-center gap-2 pt-2">
                          <p className="text-surface-500 text-xs font-medium">
                            Showing {visibleProducts.length} of {filteredProducts.length}
                          </p>
                          <button
                            onClick={() => setProductLimit(prev => prev + 9)}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-surface-800 border border-surface-700 text-white font-bold text-sm hover:bg-surface-700 hover:border-surface-600 transition-all"
                          >
                            <i className="fas fa-chevron-down" /> Load More
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Gadgets */}
              {section === 'gadgets' && (
                <div className="space-y-6">
                  {/* Search bar */}
                  <div className="relative">
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 text-sm pointer-events-none" />
                    <input
                      value={gadgetSearch}
                      onChange={e => { setGadgetSearch(e.target.value); setGadgetLimit(9) }}
                      placeholder="Search by name or brand…"
                      className="w-full h-12 pl-12 pr-5 rounded-2xl bg-surface-900 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-600"
                    />
                    {gadgetSearch && (
                      <button onClick={() => { setGadgetSearch(''); setGadgetLimit(9) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white transition-colors">
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>

                  {filteredGadgets.length === 0 ? (
                    <div className="text-center bg-surface-900 border border-surface-800 rounded-3xl py-16 px-6">
                      <div className="w-14 h-14 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-search text-xl text-surface-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">No results for "{gadgetSearch}"</h3>
                      <p className="text-surface-400 text-sm">Try a different name or brand.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleGadgets.map(g => (
                          <div
                            key={g.id}
                            onClick={() => { setViewingItem(g); setViewingCollection('gadgets') }}
                            className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg flex gap-5 group hover:border-brand-500/40 hover:shadow-glow transition-all cursor-pointer"
                          >
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
                                  <button onClick={e => { e.stopPropagation(); openEditGadget(g) }} className="w-8 h-8 rounded-lg bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center">
                                    <i className="fas fa-pen text-sm" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); deleteItem('gadgets', g.id) }} className="w-8 h-8 rounded-lg bg-surface-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors flex items-center justify-center">
                                    <i className="fas fa-trash text-sm" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {filteredGadgets.length > gadgetLimit && (
                        <div className="flex flex-col items-center gap-2 pt-2">
                          <p className="text-surface-500 text-xs font-medium">
                            Showing {visibleGadgets.length} of {filteredGadgets.length}
                          </p>
                          <button
                            onClick={() => setGadgetLimit(prev => prev + 9)}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-surface-800 border border-surface-700 text-white font-bold text-sm hover:bg-surface-700 hover:border-surface-600 transition-all"
                          >
                            <i className="fas fa-chevron-down" /> Load More
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Hero */}
              {section === 'hero' && (
                <div className="space-y-4 max-w-4xl">
                  {heroSlides.map(h => (
                    <div key={h.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                      <div className="w-full sm:w-40 h-36 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-surface-700 relative group">
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
                <div className="space-y-5">

                  {/* Status summary pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: 'All', count: orders.length },
                      ...Object.entries(STATUS_CONFIG).map(([key, c]) => ({ key, label: c.label, count: orderStatusCounts[key] || 0, cfg: c }))
                    ].map(({ key, label, count, cfg }) => (
                      <button
                        key={key}
                        onClick={() => { setOrderStatusFilter(key); setOrderLimit(10) }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          orderStatusFilter === key
                            ? key === 'all'
                              ? 'bg-brand-500 text-white border-brand-500 shadow-glow'
                              : `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ${cfg.border.replace('border-','ring-')}`
                            : 'bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-600 hover:text-surface-300'
                        }`}
                      >
                        {label}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${orderStatusFilter === key ? 'bg-white/20' : 'bg-surface-700'}`}>
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 text-sm pointer-events-none" />
                    <input
                      value={orderSearch}
                      onChange={e => { setOrderSearch(e.target.value); setOrderLimit(10) }}
                      placeholder="Search by name, phone, order ID or reference…"
                      className="w-full h-12 pl-12 pr-10 rounded-2xl bg-surface-900 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-600"
                    />
                    {orderSearch && (
                      <button onClick={() => { setOrderSearch(''); setOrderLimit(10) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white transition-colors">
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>

                  {/* Order cards */}
                  {filteredOrders.length === 0 ? (
                    <div className="text-center bg-surface-900 border border-surface-800 rounded-3xl py-20 px-6">
                      <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className={`fas ${orderSearch || orderStatusFilter !== 'all' ? 'fa-search' : 'fa-box-open'} text-2xl text-surface-500`} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {orderSearch || orderStatusFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
                      </h3>
                      <p className="text-surface-400 text-sm">
                        {orderSearch || orderStatusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'When customers place orders, they will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {visibleOrders.map(o => {
                        const st = o.status || 'paid'
                        const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.paid
                        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : o.createdAt ? new Date(o.createdAt) : null
                        const dateStr = orderDate ? orderDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
                        const waPhone = (o.address?.phone || '').replace(/\D/g, '').replace(/^0/, '234')
                        return (
                          <div key={o.id} className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-lg hover:border-surface-700 transition-colors">

                            {/* Top row */}
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              <span className="text-surface-500 text-sm font-mono">#{o.id.slice(0,8).toUpperCase()}</span>
                              {dateStr && (
                                <span className="ml-auto text-surface-500 text-xs flex items-center gap-1.5">
                                  <i className="fas fa-clock text-surface-600" /> {dateStr}
                                </span>
                              )}
                              <button
                                onClick={() => { if (confirm('Delete this order? This cannot be undone.')) deleteItem('orders', o.id) }}
                                className="w-7 h-7 rounded-lg bg-surface-800 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors flex items-center justify-center"
                                title="Delete order"
                              >
                                <i className="fas fa-trash text-xs" />
                              </button>
                            </div>

                            <div className="flex flex-col md:flex-row md:justify-between items-start gap-6">
                              {/* Left: customer info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate">{o.address?.name || 'Guest Order'}</p>

                                {/* Contact shortcuts */}
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                  {o.address?.email && (
                                    <a href={`mailto:${o.address.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 text-xs font-medium hover:border-brand-500/40 hover:text-white transition-all truncate max-w-[220px]">
                                      <i className="fas fa-envelope text-surface-500 flex-shrink-0" /> <span className="truncate">{o.address.email}</span>
                                    </a>
                                  )}
                                  {o.address?.phone && (
                                    <a href={`tel:${o.address.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 text-xs font-medium hover:border-brand-500/40 hover:text-white transition-all">
                                      <i className="fas fa-phone text-surface-500 flex-shrink-0" /> {o.address.phone}
                                    </a>
                                  )}
                                  {o.address?.phone && (
                                    <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/20 transition-all">
                                      <i className="fab fa-whatsapp" /> WhatsApp
                                    </a>
                                  )}
                                </div>

                                {/* Address */}
                                <div className="mt-3 p-4 bg-surface-950 rounded-xl border border-surface-800">
                                  <p className="text-sm text-surface-300 font-medium leading-relaxed flex items-start gap-2">
                                    <i className="fas fa-map-marker-alt text-brand-500 mt-1 flex-shrink-0"></i> {o.address?.full}
                                  </p>
                                </div>

                                {/* Payment reference */}
                                {o.reference && (
                                  <div className="mt-3 flex items-center gap-2 p-3 bg-surface-950 rounded-xl border border-surface-800">
                                    <i className="fas fa-receipt text-surface-500 text-xs flex-shrink-0" />
                                    <span className="text-xs text-surface-500 font-bold uppercase tracking-wider">Ref:</span>
                                    <span className="text-xs text-surface-300 font-mono truncate flex-1">{o.reference}</span>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(o.reference)}
                                      className="text-surface-500 hover:text-brand-400 transition-colors flex-shrink-0"
                                      title="Copy reference"
                                    >
                                      <i className="fas fa-copy text-xs" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Right: total + status */}
                              <div className="w-full md:w-64 flex flex-col items-start md:items-end gap-4 flex-shrink-0">
                                <div className="text-left md:text-right w-full">
                                  <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                  <p className="font-bold font-display text-brand-400 text-3xl tracking-tight">₦{(o.total || 0).toLocaleString()}</p>
                                </div>
                                <div className="w-full">
                                  <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-2 text-left md:text-right">Update Status</p>
                                  <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
                                    {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                                      <button
                                        key={key}
                                        onClick={() => updateOrderStatus(o.id, key)}
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all duration-150
                                          ${st === key
                                            ? `${c.bg} ${c.color} ${c.border} ring-1 ring-offset-1 ring-offset-surface-900 ${c.border.replace('border-', 'ring-')}`
                                            : 'bg-surface-800 text-surface-500 border-surface-700 hover:border-surface-600 hover:text-surface-300'
                                          }`}
                                      >
                                        {c.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order items */}
                            {(o.items || []).length > 0 && (
                              <div className="mt-6 pt-5 border-t border-surface-800">
                                <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-3">Order Items</p>
                                <div className="flex flex-wrap gap-2">
                                  {(o.items || []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-surface-950 border border-surface-800 rounded-xl pr-4 overflow-hidden">
                                      <div className="bg-white p-1 w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <img src={item.image || ''} className="w-full h-full object-contain" alt="" />
                                      </div>
                                      <div className="flex flex-col gap-1 py-2">
                                        <span className="text-sm font-semibold text-surface-200">
                                          {item.name} <span className="text-brand-500 font-bold ml-1">×{item.quantity}</span>
                                        </span>
                                        {item.condition ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-500/15 border border-brand-500/25 text-brand-400 text-[10px] font-bold uppercase tracking-wider rounded-md w-fit">
                                            <i className="fas fa-tag text-[8px]" /> {item.condition}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-surface-600 italic">No condition set</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Load more */}
                      {filteredOrders.length > orderLimit && (
                        <div className="flex flex-col items-center gap-2 pt-2">
                          <p className="text-surface-500 text-xs font-medium">
                            Showing {visibleOrders.length} of {filteredOrders.length} orders
                          </p>
                          <button
                            onClick={() => setOrderLimit(prev => prev + 10)}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-surface-800 border border-surface-700 text-white font-bold text-sm hover:bg-surface-700 hover:border-surface-600 transition-all"
                          >
                            <i className="fas fa-chevron-down" /> Load More
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Settings */}
              {section === 'settings' && (
                <div className="space-y-10 max-w-3xl">

                  {/* Current admin card */}
                  <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user-shield text-brand-400 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-lg truncate">{user?.email}</p>
                      <p className="text-xs text-brand-400 font-bold uppercase tracking-wider mt-1">Currently Logged In · Super Admin</p>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-surface-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <i className="fas fa-lock text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Change Password</h3>
                        <p className="text-xs text-surface-500">Update your login password</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {changePwError && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                          <i className="fas fa-circle-exclamation flex-shrink-0" /> {changePwError}
                        </div>
                      )}
                      {changePwSuccess && (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
                          <i className="fas fa-circle-check flex-shrink-0" /> {changePwSuccess}
                        </div>
                      )}
                      <div className="relative">
                        <label className="block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">Current Password</label>
                        <input
                          type={showCurrPw ? 'text' : 'password'}
                          value={changePwCurrent}
                          onChange={e => setChangePwCurrent(e.target.value)}
                          placeholder="Your current password"
                          className="w-full h-12 px-5 pr-12 rounded-2xl bg-surface-950 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700"
                        />
                        <button type="button" onClick={() => setShowCurrPw(v => !v)} className="absolute right-4 top-[34px] text-surface-500 hover:text-white transition-colors">
                          <i className={`fas ${showCurrPw ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </button>
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">New Password</label>
                        <input
                          type={showChangePw ? 'text' : 'password'}
                          value={changePwNew}
                          onChange={e => setChangePwNew(e.target.value)}
                          placeholder="New password (min 6 characters)"
                          className="w-full h-12 px-5 pr-12 rounded-2xl bg-surface-950 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700"
                        />
                        <button type="button" onClick={() => setShowChangePw(v => !v)} className="absolute right-4 top-[34px] text-surface-500 hover:text-white transition-colors">
                          <i className={`fas ${showChangePw ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          value={changePwConfirm}
                          onChange={e => setChangePwConfirm(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full h-12 px-5 rounded-2xl bg-surface-950 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700"
                        />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={changingPw}
                        className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-400 hover:shadow-glow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:bg-brand-500 disabled:hover:-translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                      >
                        {changingPw ? <><i className="fas fa-circle-notch fa-spin" /> Updating…</> : <><i className="fas fa-lock" /> Update Password</>}
                      </button>
                    </div>
                  </div>

                  {/* Create New Admin */}
                  <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-surface-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <i className="fas fa-user-plus text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Create New Admin</h3>
                        <p className="text-xs text-surface-500">Add another admin to this dashboard</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {createAdminError && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                          <i className="fas fa-circle-exclamation flex-shrink-0" /> {createAdminError}
                        </div>
                      )}
                      {createAdminSuccess && (
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
                          <i className="fas fa-circle-check flex-shrink-0" /> {createAdminSuccess}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">Admin Email *</label>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={e => setNewAdminEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full h-12 px-5 rounded-2xl bg-surface-950 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">Password *</label>
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newAdminPassword}
                          onChange={e => setNewAdminPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full h-12 px-5 pr-12 rounded-2xl bg-surface-950 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700"
                        />
                        <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-4 top-[34px] text-surface-500 hover:text-white transition-colors">
                          <i className={`fas ${showNewPw ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">Confirm Password *</label>
                        <input
                          type="password"
                          value={newAdminConfirm}
                          onChange={e => setNewAdminConfirm(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full h-12 px-5 rounded-2xl bg-surface-950 border border-surface-800 text-white text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-surface-700"
                        />
                      </div>
                      <button
                        onClick={handleCreateAdmin}
                        disabled={creatingAdmin}
                        className="w-full h-12 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:bg-blue-500 disabled:hover:-translate-y-0 flex items-center justify-center gap-2"
                      >
                        {creatingAdmin ? <><i className="fas fa-circle-notch fa-spin" /> Creating…</> : <><i className="fas fa-user-plus" /> Create Admin</>}
                      </button>
                    </div>
                  </div>

                  {/* Admins List */}
                  <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-surface-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <i className="fas fa-users text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">All Admins</h3>
                          <p className="text-xs text-surface-500">{adminsList.length} admin{adminsList.length !== 1 ? 's' : ''} registered</p>
                        </div>
                      </div>
                      <button onClick={fetchAdmins} className="w-8 h-8 rounded-lg bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center" title="Refresh">
                        <i className="fas fa-rotate-right text-sm" />
                      </button>
                    </div>
                    <div className="divide-y divide-surface-800">
                      {adminsList.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-surface-500 text-sm">No admins found in database.</p>
                        </div>
                      ) : adminsList.map(a => {
                        const isSelf = a.uid === user?.uid || a.email === user?.email
                        const createdDate = a.createdAt?.toDate ? a.createdAt.toDate() : null
                        const lastActiveDate = a.lastActive?.toDate ? a.lastActive.toDate() : null
                        const ago = timeAgo(lastActiveDate)
                        const diffMs = lastActiveDate ? Date.now() - lastActiveDate.getTime() : Infinity
                        const isOnline = diffMs < 3 * 60_000
                        const isRecent = diffMs < 10 * 60_000
                        void tick
                        return (
                          <div key={a.id} className="px-6 py-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative ${isSelf ? 'bg-brand-500/15 border border-brand-500/30' : 'bg-surface-800'}`}>
                              <i className={`fas fa-user text-sm ${isSelf ? 'text-brand-400' : 'text-surface-500'}`} />
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-surface-900 rounded-full transition-colors ${isOnline ? 'bg-emerald-500' : isRecent ? 'bg-amber-400' : 'bg-surface-700'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-white text-sm truncate">{a.email}</p>
                                {isOnline && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    Online
                                  </span>
                                )}
                                {isSelf && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20">You</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                {ago ? (
                                  <p className="text-xs text-surface-500 flex items-center gap-1.5">
                                    <i className={`fas fa-circle text-[5px] ${isOnline ? 'text-emerald-500' : isRecent ? 'text-amber-400' : 'text-surface-600'}`} />
                                    Last active: <span className={isOnline ? 'text-emerald-400 font-semibold' : isRecent ? 'text-amber-400' : 'text-surface-400'}>{ago}</span>
                                  </p>
                                ) : (
                                  <p className="text-xs text-surface-600 italic">Never logged in</p>
                                )}
                                {createdDate && (
                                  <p className="text-xs text-surface-600">· Added {createdDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                )}
                              </div>
                            </div>
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteAdmin(a.id, a.email)}
                                className="w-8 h-8 rounded-lg bg-surface-800 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors flex items-center justify-center flex-shrink-0"
                                title="Remove admin"
                              >
                                <i className="fas fa-trash text-xs" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

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

      {/* Product / Gadget Detail Modal */}
      {viewingItem && (
        <ProductDetailModal
          item={viewingItem}
          collection={viewingCollection}
          onClose={() => setViewingItem(null)}
          onEdit={() => {
            setViewingItem(null)
            if (viewingCollection === 'products') openEditProduct(viewingItem)
            else openEditGadget(viewingItem)
          }}
          onDelete={() => {
            setViewingItem(null)
            deleteItem(viewingCollection, viewingItem.id)
          }}
        />
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
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Condition</label>
          <select name="condition" value={form.condition} onChange={handleChange} className={inputClass + ' cursor-pointer'}>
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="UK-Used">UK-Used</option>
            <option value="Nigeria-Used">Nigeria-Used</option>
          </select>
        </div>
        <div></div>
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

function ProductDetailModal({ item, collection, onClose, onEdit, onDelete }) {
  const [activeImg, setActiveImg] = useState(0)
  const images = item.images?.filter(Boolean) || []

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-surface-900 border border-surface-700 rounded-[32px] w-full max-w-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col animate-slide-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-surface-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {collection === 'products' ? 'Smartphone' : 'Accessory'}
            </span>
            <span className="text-xs text-surface-600 font-mono">{item.id.slice(0, 10)}…</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 transition-colors flex items-center justify-center flex-shrink-0">
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-8 space-y-8">
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="w-full h-64 bg-white rounded-2xl flex items-center justify-center p-4 border border-surface-800">
                <img
                  src={images[activeImg]}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 flex-shrink-0 rounded-xl bg-white p-1 border-2 transition-all ${i === activeImg ? 'border-brand-500 shadow-glow' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">{item.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {item.brand && (
                  <span className="px-3 py-1 bg-surface-800 text-surface-300 text-xs font-bold uppercase tracking-wider rounded-lg">{item.brand}</span>
                )}
                {item.condition && (
                  <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider rounded-lg">{item.condition}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-surface-500 text-sm font-bold uppercase tracking-wider">Price</span>
              <span className="text-brand-400 font-bold font-display text-3xl tracking-tight ml-auto">₦{Number(item.price).toLocaleString()}</span>
            </div>

            {item.description && (
              <div className="bg-surface-950 rounded-2xl p-5 border border-surface-800">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-2">Description</p>
                <p className="text-surface-300 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="bg-surface-950 rounded-2xl p-5 border border-surface-800">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-3">Media URLs ({images.length})</p>
                <div className="space-y-2">
                  {images.map((img, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-surface-600 font-bold w-4">{i + 1}</span>
                      <p className="text-xs text-surface-400 truncate flex-1 font-mono">{img}</p>
                      <a href={img} target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-400 text-xs flex-shrink-0">
                        <i className="fas fa-external-link-alt" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-surface-800 flex gap-3 bg-surface-900/60 flex-shrink-0">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-bold text-sm transition-all"
          >
            <i className="fas fa-trash" /> Delete
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-400 hover:shadow-glow transition-all transform hover:-translate-y-0.5"
          >
            <i className="fas fa-pen" /> Edit Product
          </button>
        </div>
      </div>
    </div>
  )
}