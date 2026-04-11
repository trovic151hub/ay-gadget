import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MiniCart from '../components/MiniCart'
import NotificationContainer from '../components/NotificationContainer'

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: `When you place an order, we collect your name, phone number, and delivery address. We do not require you to create an account to shop with us. No payment details are stored on our end — all payment processing is handled securely by Paystack.`
  },
  {
    title: 'How We Use Your Information',
    content: `Your information is used solely to process and deliver your order, and to contact you regarding your purchase. We may reach out via the phone number provided at checkout to confirm your order or coordinate delivery.`
  },
  {
    title: 'Data Storage',
    content: `Order information is stored securely using Google Firebase (Firestore), a cloud database service. Data is stored and processed in accordance with Google's data protection standards. We retain order records to allow you to track your purchases using your phone number.`
  },
  {
    title: 'Data Sharing',
    content: `We do not sell, trade, or rent your personal information to any third parties. Your data is never shared with marketing companies or external advertisers. It is used exclusively to fulfill your orders.`
  },
  {
    title: 'Cookies & Tracking',
    content: `Our store uses a local browser identifier (a guest ID stored in your browser) to remember your cart between visits. No invasive tracking cookies or third-party analytics are used. This identifier is only used for cart functionality and is never tied to your personal identity.`
  },
  {
    title: 'Your Rights',
    content: `You have the right to request the deletion of any personal data we hold about you. To do so, contact us directly via WhatsApp or email with your order details and we will process your request promptly.`
  },
  {
    title: 'Contact Us',
    content: null,
    isContact: true
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date. Continued use of our store after changes constitutes acceptance of the revised policy.`
  }
]

export default function PrivacyPage() {
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
          Privacy Policy
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
                  For any privacy-related questions or data deletion requests, reach us via WhatsApp at{' '}
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
          <Link to="/terms" className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5">
            <i className="fas fa-arrow-right text-xs" /> View Terms of Service
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
