import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-300 py-16 border-t border-surface-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-bolt text-sm" />
              </div>
              AY&apos;s Store
            </h3>
            <p className="text-surface-400 max-w-sm leading-relaxed">
              Nigeria's premium destination for top-tier phones, gadgets, and accessories. Experience shopping redefined.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/products?tab=products" className="hover:text-brand-500 transition-colors">Smartphones</Link>
              <Link to="/products?tab=gadgets" className="hover:text-brand-500 transition-colors">Gadgets</Link>
              <Link to="/products" className="hover:text-brand-500 transition-colors">All Products</Link>
              <Link to="/account" className="hover:text-brand-500 transition-colors">Track Order</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-surface-500">
          <p>&copy; {new Date().getFullYear()} AY&apos;s Gadget Store. All rights reserved.</p>
          <div className="flex gap-4 text-lg">
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fab fa-twitter" /></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fab fa-instagram" /></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fab fa-facebook" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
