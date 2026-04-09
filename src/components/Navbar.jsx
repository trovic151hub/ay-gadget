import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const NAV_LINKS = [
  { label: 'Phones', to: '/products?tab=products' },
  { label: 'All Products', to: '/products' },
  { label: 'Gadgets', to: '/products?tab=gadgets' },
]

function isActive(link, location) {
  const [path, qs] = link.to.split('?')
  if (location.pathname !== path) return false
  if (!qs) return location.pathname === path
  const current = new URLSearchParams(location.search)
  const target = new URLSearchParams(qs)
  for (const [k, v] of target) {
    if (current.get(k) !== v) return false
  }
  return true
}

export default function Navbar() {
  const { cartCount, setCartOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="bg-surface-950/95 backdrop-blur-md fixed w-full z-40 top-0 border-b border-surface-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors">
            <i className="fas fa-bolt text-sm" />
          </div>
          AY&apos;s Store
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {NAV_LINKS.map(link => {
            const active = isActive(link, location)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative pb-1 transition-colors duration-200 ${
                  active ? 'text-white' : 'text-surface-400 hover:text-white'
                }`}
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-500 transition-all duration-300"
                  style={{ opacity: active ? 1 : 0, transform: active ? 'scaleX(1)' : 'scaleX(0)' }}
                />
              </Link>
            )
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-6">

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative text-surface-400 hover:text-white transition-colors group"
            aria-label="Open cart"
          >
            <i className="fas fa-bag-shopping text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-glow">
                {cartCount}
              </span>
            )}
          </button>

          {/* User icon — direct link to dashboard */}
          <Link
            to="/admin"
            className="text-surface-400 hover:text-white transition-colors"
            aria-label="Dashboard"
          >
            <i className="far fa-user text-xl" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden text-surface-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-900 border-t border-surface-800 px-4 py-4 space-y-1">
          {NAV_LINKS.map(link => {
            const active = isActive(link, location)
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'text-white bg-surface-800'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                {link.label}
              </Link>
            )
          })}
          <div className="pt-3 mt-3 border-t border-surface-800">
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors"
            >
              <i className="far fa-user text-base" />
              My Account
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
