import ContactChannels from './ContactChannels.jsx';
import ContactForm from './ContactForm.jsx';
import './contact.css';

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section" aria-label="Contact and Technical Inquiries" data-section="contact">
      <div className="contact-container">
        <header className="contact-header">
          <div className="contact-kicker">
            <span className="kicker-index">05</span>
            <span>Start here</span>
          </div>
          <h2 className="contact-title">
            Let’s make the next step <strong className="title-accent">simple.</strong>
          </h2>
          <p className="contact-lead">
            Tell me what you’re building, or choose the fastest way to reach me. I reply within two hours.
          </p>
        </header>

        <div className="contact-grid">
          <ContactForm />
          <ContactChannels />
        </div>
      </div>
    </section>
  );
}
