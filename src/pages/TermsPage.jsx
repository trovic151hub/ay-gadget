import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'

const SECTIONS = [
  {
    title: 'Overview',
    content: `By browsing or placing an order on AY's Gadget Store, you agree to be bound by these Terms of Service. Please read them carefully before making a purchase. We reserve the right to update these terms at any time without prior notice.`
  },
  {
    title: 'Products & Pricing',
    content: `All product listings, descriptions, images, and prices are as accurate as possible. We reserve the right to correct any errors and to change or update information at any time without prior notice. Prices are displayed in Nigerian Naira (₦) and are subject to change without notice.`
  },
  {
    title: 'Orders & Payment',
    content: `Orders are processed after successful payment confirmation via Paystack, our secure payment provider. We accept debit/credit cards and bank transfers through Paystack. Once an order is placed and payment is confirmed, it will be prepared for delivery. AY's Gadget Store is not responsible for failed transactions due to incorrect payment details or insufficient funds.`
  },
  {
    title: 'Delivery',
    content: `We currently deliver within Lagos State only. Delivery timelines are estimates and may vary based on your location within Lagos and current order volume. We will contact you via the phone number provided at checkout to coordinate delivery. We are not liable for delays caused by circumstances beyond our control.`
  },
  {
    title: 'Product Condition',
    content: `Products are listed with their condition clearly stated — New, UK-Used, or Nigeria-Used. Please review the condition carefully before purchasing. Images are representative of the product condition and may vary slightly from the actual item. All sales are final.`
  },
  {
    title: 'Limitation of Liability',
    content: `AY's Gadget Store shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or services. Our liability is limited to the purchase price of the product in question.`
  },
  {
    title: 'Contact Us',
    content: null,
    isContact: true
  },
  {
    title: 'Governing Law',
    content: `These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.`
  }
]

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-surface-400 text-base max-w-md mx-auto">
          Last updated: April 2025
        </p>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
        <div className="space-y-10">
          {SECTIONS.map((s, i) => (
            <div key={i} className="border-b border-surface-800 pb-10 last:border-0 last:pb-0">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brand-500/15 border border-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {s.title}
              </h2>
              {s.isContact ? (
                <p className="text-surface-400 leading-relaxed">
                  For any questions about these terms, reach us via WhatsApp at{' '}
                  <a
                    href="https://wa.me/2349053380773"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    +234 905 338 0773
                  </a>{' '}
                  or email us at{' '}
                  <a
                    href="mailto:victoradeyimika0@gmail.com"
                    className="text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    victoradeyimika0@gmail.com
                  </a>
                  .
                </p>
              ) : (
                <p className="text-surface-400 leading-relaxed">{s.content}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/privacy" className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5">
            <i className="fas fa-arrow-right text-xs" /> View Privacy Policy
          </Link>
          <Link to="/" className="text-sm text-surface-500 hover:text-white transition-colors flex items-center gap-1.5">
            <i className="fas fa-arrow-left text-xs" /> Back to Store
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
