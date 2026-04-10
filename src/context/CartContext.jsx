import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, addDoc, setDoc, doc, onSnapshot } from 'firebase/firestore'

const CartContext = createContext(null)

function getGuestId() {
  let guestId = localStorage.getItem('guestId')
  if (!guestId) {
    guestId = 'guest-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
    localStorage.setItem('guestId', guestId)
  }
  return guestId
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const guestId = getGuestId()

  useEffect(() => {
    const cartRef = collection(db, 'carts')
    const q = query(cartRef, where('guestId', '==', guestId))
    const unsubscribe = onSnapshot(q, snapshot => {
      if (snapshot.empty) {
        setCartItems([])
        return
      }
      const data = snapshot.docs[0].data()
      setCartItems(data.items || [])
    }, (error) => {
      console.warn('Cart snapshot error:', error.message)
    })
    return unsubscribe
  }, [guestId])

  const saveCart = useCallback(async (items) => {
    const cartRef = collection(db, 'carts')
    const q = query(cartRef, where('guestId', '==', guestId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      await addDoc(cartRef, { guestId, items })
    } else {
      const docId = snapshot.docs[0].id
      await setDoc(doc(db, 'carts', docId), { guestId, items })
    }
  }, [guestId])

  const addToCart = useCallback(async (product) => {
    const cartRef = collection(db, 'carts')
    const q = query(cartRef, where('guestId', '==', guestId))
    const snapshot = await getDocs(q)
    let cart = snapshot.empty ? [] : (snapshot.docs[0].data().items || [])

    const existing = cart.find(i => i.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        image: product.images?.[0] || '',
        condition: product.condition || ''
      })
    }
    await saveCart(cart)
  }, [guestId, saveCart])

  const removeFromCart = useCallback(async (productId) => {
    const updated = cartItems.filter(i => i.id !== productId)
    await saveCart(updated)
  }, [cartItems, saveCart])

  const changeQuantity = useCallback(async (productId, delta) => {
    const updated = cartItems.map(item => {
      if (item.id === productId) return { ...item, quantity: item.quantity + delta }
      return item
    }).filter(item => item.quantity > 0)
    await saveCart(updated)
  }, [cartItems, saveCart])

  const clearCart = useCallback(async () => {
    await saveCart([])
  }, [saveCart])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartOpen,
      setCartOpen,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      changeQuantity,
      clearCart,
      saveCart,
      guestId
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
