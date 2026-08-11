import Navbar from './Navbar'
import MiniCart from './MiniCart'
import NotificationContainer from './NotificationContainer'
import Footer from './Footer'

export default function LegalPageLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col font-sans">
      <NotificationContainer />
      <Navbar />
      <MiniCart />

      <div className="pt-32 pb-14 px-6 text-center border-b border-surface-800">
        <span className="inline-block py-1 px-3 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 border border-brand-500/20">
          Legal
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-surface-500 text-sm">Last updated: {updated}</p>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 space-y-10 text-surface-300 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:font-display [&_h2]:text-white [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_a]:text-brand-500 [&_a]:hover:text-brand-400">
        {children}
      </main>

      <Footer />
    </div>
  )
}
