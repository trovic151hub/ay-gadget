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
              <a href="/" className="hover:text-brand-500 transition-colors">Smartphones</a>
              <a href="/products" className="hover:text-brand-500 transition-colors">Accessories</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Track Order</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Return Policy</a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-surface-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-surface-500">
          <p>&copy; {new Date().getFullYear()} AY&apos;s Gadget Store. All rights reserved.</p>
          <div className="flex gap-4 text-lg">
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fab fa-facebook"></i></a>
          </div>
        </div>
      </div>
    </footer>
  )
}