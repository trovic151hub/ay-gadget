{/*
  DRAFT — written to fill the previously-dead footer link and give the store
  a real starting point. Not reviewed by a lawyer. The return window and
  conditions below are reasonable defaults for a gadget retailer — adjust
  them to match what you're actually willing to honor before treating this
  as final.
*/}
import LegalPageLayout from '../components/LegalPageLayout'

export default function ReturnsPage() {
  return (
    <LegalPageLayout title="Return & Refund Policy" updated="11 August 2026">
      <section>
        <p>
          We want you to be happy with your order. If something&apos;s wrong with what you received,
          here&apos;s how returns and refunds work.
        </p>
      </section>

      <section>
        <h2>Eligibility for Returns</h2>
        <p>You can request a return within 48 hours of delivery if:</p>
        <ul>
          <li>The item arrived faulty or dead on arrival</li>
          <li>You received the wrong item or wrong variant</li>
          <li>The item was damaged in transit</li>
        </ul>
        <p>
          To be eligible, the item must be unused, in its original packaging, and include all
          accessories it came with.
        </p>
      </section>

      <section>
        <h2>What&apos;s Not Covered</h2>
        <ul>
          <li>Change of mind after a device has been activated or used</li>
          <li>Physical damage caused after delivery</li>
          <li>Items without their original packaging or accessories</li>
        </ul>
      </section>

      <section>
        <h2>How to Request a Return</h2>
        <p>
          Message us on{' '}
          <a href="https://wa.me/2349053380773" target="_blank" rel="noreferrer">WhatsApp</a> or
          email <a href="mailto:victoradeyimika0@gmail.com">victoradeyimika0@gmail.com</a> with your
          order reference, the issue, and photos or a short video showing the problem. We&apos;ll
          confirm next steps — usually a pickup or drop-off arrangement — within 24 hours.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          Once we&apos;ve received and inspected the returned item, we&apos;ll confirm your refund or
          exchange. Approved refunds are sent back to the account or method you paid from within
          5–10 business days.
        </p>
      </section>

      <section>
        <h2>Exchanges</h2>
        <p>
          Prefer a replacement over a refund? Let us know when you request your return — subject to
          stock availability.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          Reach us on{' '}
          <a href="https://wa.me/2349053380773" target="_blank" rel="noreferrer">WhatsApp</a> or at{' '}
          <a href="mailto:victoradeyimika0@gmail.com">victoradeyimika0@gmail.com</a> for any return
          or refund questions.
        </p>
      </section>
    </LegalPageLayout>
  )
}
