import ContactChannels from './ContactChannels.jsx';
import ContactForm from './ContactForm.jsx';
import { CONTACT_TEXT } from '../../../core/constants/contact/contactText.js';
import './contact.css';

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section" aria-label={CONTACT_TEXT.aria.section} data-section="contact">
      <div className="contact-container">
        <header className="contact-header">
          <div className="contact-kicker">
            <span className="kicker-index">{CONTACT_TEXT.kicker.index}</span>
            <span>{CONTACT_TEXT.kicker.label}</span>
          </div>
          <h2 className="contact-title">
            {CONTACT_TEXT.title.prefix}<strong className="title-accent">{CONTACT_TEXT.title.accent}</strong>
          </h2>
          <p className="contact-lead">
            {CONTACT_TEXT.lead}
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
