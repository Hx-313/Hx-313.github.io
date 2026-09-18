import { useContactForm } from '../application/useContactForm.js';
import { PROJECT_CATEGORIES, CONTACT_TEXT } from '../domain/contactData.js';

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

  const { form } = CONTACT_TEXT;

  return (
    <section className="contact-form-card" aria-labelledby="contact-form-title">
      <div className="form-card-header">
        <div className="form-card-title-row">
          <span className="console-led" aria-hidden="true" />
          <h3 className="form-card-title" id="contact-form-title">{form.title}</h3>
        </div>
        <span className="form-card-subtitle">{form.subtitle}</span>
      </div>

      {isSuccess ? (
        <div className="form-success-banner" role="status" aria-live="polite">
          <div className="success-icon-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4 className="success-heading">{form.success.heading}</h4>
          <p className="success-text">
            {form.success.thanksPrefix}<strong>{formData.name}</strong>{form.success.detailsMiddle}<em>{formData.category}</em>{form.success.detailsSuffix}
          </p>
          <div className="success-actions">
            {mailtoUrl && (
              <a
                href={mailtoUrl}
                className="success-btn success-btn--primary"
                aria-label={form.success.emailAria}
              >
                <span>{form.success.openEmailBtn}</span>
              </a>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="success-btn success-btn--ghost"
            >
              {form.success.startAnotherBtn}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="inquiry-form" noValidate>
          <div className="form-group">
            <label className="form-label" id="category-label">
              {form.categoryLabel} <span className="field-hint">{form.optionalBadge}</span>
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

          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="contact-name" className="form-label">
              {form.nameLabel} <span className="field-req" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder={form.namePlaceholder}
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

          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="contact-email" className="form-label">
              {form.emailLabel} <span className="field-req" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={form.emailPlaceholder}
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

          <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
            <label htmlFor="contact-message" className="form-label">
              {form.messageLabel} <span className="field-req" aria-hidden="true">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              placeholder={form.messagePlaceholder}
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

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`form-submit-btn ${isSubmitting ? 'is-loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <span className="submit-spinner" aria-hidden="true" />
                  <span>{form.submitLoading}</span>
                </>
              ) : (
                <>
                  <span>{form.submitIdle}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
            <span className="form-footer-note">
              {form.footerNote}
            </span>
          </div>
        </form>
      )}
    </section>
  );
}
