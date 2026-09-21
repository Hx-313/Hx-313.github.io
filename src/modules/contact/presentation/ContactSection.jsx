import ContactChannels from './ContactChannels.jsx';
import ContactForm from './ContactForm.jsx';
import { CONTACT_TEXT } from '../../../core/constants/contact/contactText.js';
import './contact.css';

export default function ContactSection({
  kickerIndex = CONTACT_TEXT.kicker.index,
  kickerLabel = CONTACT_TEXT.kicker.label,
  titlePrefix = CONTACT_TEXT.title.prefix,
  titleAccent = CONTACT_TEXT.title.accent,
  lead = CONTACT_TEXT.lead,
  className = '',
} = {}) {
  return (
    <section id="contact" className={`contact-section ${className}`.trim()} aria-label={CONTACT_TEXT.aria.section} data-section="contact">
      <div className="contact-container">
        <header className="contact-header">
          <div className="contact-kicker">
            <span className="kicker-index">{kickerIndex}</span>
            <span>{kickerLabel}</span>
          </div>
          <h2 className="contact-title">
            {titlePrefix}<strong className="title-accent">{titleAccent}</strong>
          </h2>
          <p className="contact-lead">
            {lead}
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
