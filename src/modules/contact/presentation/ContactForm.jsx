import { useContactForm } from '../application/useContactForm.js';
import { PROJECT_CATEGORIES } from '../domain/contactData.js';

export default function ContactForm() {
  const {
    formData,
    errors,
    mailtoUrl,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
    resetForm,
  } = useContactForm();

  return (
    <div className="contact-form-card" aria-label="Direct Project Inquiry Form">
      <div className="form-card-header">
        <div className="form-card-title-row">
          <span className="console-led" aria-hidden="true" />
          <h3 className="form-card-title">DIRECT INQUIRY CONSOLE</h3>
        </div>
        <span className="form-card-subtitle">Encrypted Direct Client Dispatch</span>
      </div>

      {isSuccess ? (
        <div className="form-success-banner" role="status" aria-live="polite">
          <div className="success-icon-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4 className="success-heading">Transmission Prepared</h4>
          <p className="success-text">
            Thank you, <strong>{formData.name}</strong>. Your project scope for <em>{formData.category}</em> has been packaged.
          </p>
          <div className="success-actions">
            {mailtoUrl && (
              <a
                href={mailtoUrl}
                className="success-btn success-btn--primary"
                aria-label="Open prefilled inquiry in your default email client"
              >
                <span>Open in Email App →</span>
              </a>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="success-btn success-btn--ghost"
            >
              Send Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="inquiry-form" noValidate>
          {/* Category Chips Selector */}
          <div className="form-group">
            <label className="form-label" id="category-label">
              PROJECT CLASSIFICATION
            </label>
            <div
              className="category-chips-grid"
              role="radiogroup"
              aria-labelledby="category-label"
            >
              {PROJECT_CATEGORIES.map((category) => {
                const isSelected = formData.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleChange('category', category)}
                    className={`category-chip ${isSelected ? 'is-selected' : ''}`}
                  >
                    <span className="chip-indicator" aria-hidden="true" />
                    <span className="chip-label">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Field */}
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="contact-name" className="form-label">
              FULL NAME <span className="field-req" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Elena Rostova"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className="form-input"
            />
            {errors.name && (
              <span id="contact-name-error" className="field-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="contact-email" className="form-label">
              WORK EMAIL <span className="field-req" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="elena@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className="form-input"
            />
            {errors.email && (
              <span id="contact-email-error" className="field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Message Field */}
          <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
            <label htmlFor="contact-message" className="form-label">
              PROJECT SCOPE & TIMELINE <span className="field-req" aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              placeholder="Tell me about your product vision, target architecture, or key technical challenges..."
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className="form-textarea"
            />
            {errors.message && (
              <span id="contact-message-error" className="field-error" role="alert">
                {errors.message}
              </span>
            )}
          </div>

          {/* Submit Action */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`form-submit-btn ${isSubmitting ? 'is-loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <span className="submit-spinner" aria-hidden="true" />
                  <span>DISPATCHING TRANSMISSION...</span>
                </>
              ) : (
                <>
                  <span>SEND INQUIRY TRANSMISSION</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
            <span className="form-footer-note">
              Direct response guaranteed within 24 business hours.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
