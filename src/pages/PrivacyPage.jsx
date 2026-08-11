{/*
  DRAFT — written to fill the previously-dead footer link and give the store
  a real starting point. Not reviewed by a lawyer. Have this checked against
  Nigeria's Data Protection Act 2023 (and your actual practices) before
  treating it as final, then update the contact details/dates below.
*/}
import LegalPageLayout from '../components/LegalPageLayout'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="11 August 2026">
      <section>
        <p>
          AY&apos;s Store (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what
          information we collect when you shop with us, how we use it, and the choices you have.
          It applies to aysstore.com and covers both browsing our catalog and placing an order.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <p>When you add items to your cart or place an order, we collect:</p>
        <ul>
          <li>Your name, email address, and phone number</li>
          <li>Your delivery address (street, LGA, and state)</li>
          <li>The items, quantities, and prices in your cart or order</li>
        </ul>
        <p>
          We never see or store your card or bank details. Payment is arranged directly with our
          team or, where offered, processed by Paystack, whose own privacy policy governs that
          transaction.
        </p>
      </section>

      <section>
        <h2>How We Identify Your Cart and Orders</h2>
        <p>
          We don&apos;t require an account or password to shop. Instead, your browser is given a
          random, unguessable identifier stored on your device (via <code>localStorage</code>) the
          first time you visit. Your cart and order history are tied to that identifier, not a
          login — which means they&apos;re tied to this device and browser. If you clear your browser
          storage or switch devices, we won&apos;t be able to show you past orders automatically; you
          can always reach us on WhatsApp with your order reference instead.
        </p>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process, confirm, and deliver your order</li>
          <li>To contact you about your order via WhatsApp, phone, or email</li>
          <li>To resolve disputes, returns, or delivery issues</li>
          <li>To improve our catalog and service based on what customers actually order</li>
        </ul>
        <p>We do not sell your information to third parties.</p>
      </section>

      <section>
        <h2>Where Your Information Is Stored</h2>
        <p>
          Your information is stored using Google Firebase, a cloud infrastructure provider, with
          access restricted to our store administrators. Order confirmation and support happen over
          WhatsApp, which is subject to WhatsApp&apos;s own privacy terms for messages sent through it.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          Under Nigeria&apos;s Data Protection Act 2023, you can ask us to access, correct, or delete
          the personal information we hold about you. To make a request, contact us using the
          details below with your order reference or the phone/email you used at checkout.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy as our store or practices change. The date at the top of this
          page reflects the latest revision.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          Questions about this policy or your information? Reach us on{' '}
          <a href="https://wa.me/2349053380773" target="_blank" rel="noreferrer">WhatsApp</a> or at{' '}
          <a href="mailto:victoradeyimika0@gmail.com">victoradeyimika0@gmail.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
