import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { cartCount, setCartOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  return (
    <header className="bg-surface-950/95 backdrop-blur-md shadow-lg fixed w-full z-40 top-0 border-b border-surface-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors">
            <i className="fas fa-bolt text-sm" />
          </div>
          AY&apos;s Store
        </Link>

        {/* Nav links - desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-surface-300">
          <Link to="/" className="hover:text-white transition-colors duration-200">Phones</Link>
          <Link to="/products" className="hover:text-white transition-colors duration-200">All Products</Link>
          <Link to="/products" className="hover:text-white transition-colors duration-200">Gadgets</Link>
          <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-6">
          <button className="text-surface-300 hover:text-white transition-colors hidden md:block">
            <i className="fas fa-search text-lg" />
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative text-surface-300 hover:text-white transition-colors group"
          >
            <i className="fas fa-bag-shopping text-xl group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-glow">
                {cartCount}
              </span>
            )}
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setUserOpen(v => !v)}
              className="text-surface-300 hover:text-white transition-colors"
            >
              <i className="far fa-user text-xl" />
            </button>
            {userOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white shadow-2xl rounded-2xl py-2 z-50 border border-surface-100 transform origin-top-right transition-all">
                <a href="/admin" className="block px-5 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50 hover:text-brand-600 transition-colors"><i className="fas fa-chart-line w-5 text-center mr-2 text-surface-400"></i> Dashboard</a>
                <a href="/login" className="block px-5 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50 hover:text-brand-600 transition-colors"><i className="fas fa-sign-in-alt w-5 text-center mr-2 text-surface-400"></i> Login</a>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden text-surface-300 hover:text-white transition-colors">
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-900 border-t border-surface-800 px-6 py-6 space-y-4 text-base font-medium text-surface-300">
          <Link to="/" className="block hover:text-white transition-colors">Phones</Link>
          <Link to="/products" className="block hover:text-white transition-colors">All Products</Link>
          <Link to="/products" className="block hover:text-white transition-colors">Gadgets</Link>
          <a href="#" className="block hover:text-white transition-colors">Support</a>
        </div>
      )}
    </header>
  )
}