import ContactChannels from './ContactChannels.jsx';
import ContactForm from './ContactForm.jsx';
import './contact.css';

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section" aria-label="Contact and Technical Inquiries" data-section="contact">
      <div className="contact-container">
        {/* Section Header */}
        <header className="contact-header">
          <div className="contact-kicker">
            <span className="kicker-pulse" aria-hidden="true" />
            <span>04 // INITIATE TRANSMISSION</span>
          </div>
          <h2 className="contact-title">
            Let's Build Something <strong className="title-accent">Exceptional.</strong>
          </h2>
          <p className="contact-lead">
            Whether you are launching a greenfield SaaS product, architecting resilient distributed systems, or need technical advisory — select a fast-track channel or submit an inquiry below.
          </p>
        </header>

        {/* Dual-Column Conversion Hub */}
        <div className="contact-grid">
          <ContactChannels />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
