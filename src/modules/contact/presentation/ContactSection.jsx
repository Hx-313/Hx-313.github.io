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
            Have a system to build? <strong className="title-accent">Start here.</strong>
          </h2>
          <p className="contact-lead">
            Tell me what you’re building, who it is for, and where the workflow gets difficult. I’ll help turn the brief into a buildable plan.
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
