import { useContactForm } from '../application/useContactForm.js';
import { PROJECT_CATEGORIES, CONTACT_TEXT } from '../domain/contactData.js';

export default function ContactForm() {
  const { formData, errors, isDraftReady, handleChange, handleSubmit } = useContactForm();
  const { form } = CONTACT_TEXT;

  return (
    <section className="contact-form-card" aria-labelledby="contact-form-title">
      <div className="form-card-header">
        <div>
          <div className="form-card-title-row">
            <span className="console-led" aria-hidden="true" />
            <h3 className="form-card-title" id="contact-form-title">{form.title}</h3>
          </div>
          <p className="form-card-subtitle">{form.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="inquiry-form" noValidate>
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="contact-name" className="form-label">{form.nameLabel}</label>
            <span className="field-hint">{form.optionalBadge}</span>
          </div>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={form.namePlaceholder}
            value={formData.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className="form-input"
          />
        </div>

        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <div className="form-label-row">
            <label htmlFor="contact-email" className="form-label">
              {form.emailLabel} <span className="field-req" aria-hidden="true">*</span>
            </label>
            <span className="field-hint">{form.requiredBadge}</span>
          </div>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={form.emailPlaceholder}
            value={formData.email}
            onChange={(event) => handleChange('email', event.target.value)}
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

        <fieldset className="form-group form-group--category">
          <legend className="form-label">
            {form.categoryLabel} <span className="field-hint">{form.optionalBadge}</span>
          </legend>
          <p id="contact-category-help" className="form-help">{form.categoryHelp}</p>
          <div className="category-chips-grid" aria-describedby="contact-category-help">
            {PROJECT_CATEGORIES.map((category) => {
              const isSelected = formData.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleChange('category', isSelected ? '' : category)}
                  className={`category-chip ${isSelected ? 'is-selected' : ''}`}
                >
                  <span className="chip-indicator" aria-hidden="true" />
                  <span className="chip-label">{category}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="form-group form-group--message">
          <div className="form-label-row">
            <label htmlFor="contact-message" className="form-label">{form.messageLabel}</label>
            <span className="field-hint">{form.optionalBadge}</span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            rows={3}
            maxLength={1000}
            placeholder={form.messagePlaceholder}
            value={formData.message}
            onChange={(event) => handleChange('message', event.target.value)}
            className="form-textarea"
          />
          <p className="form-help">{form.messageHelp}</p>
        </div>

        <div className="form-actions">
          <button type="submit" className="form-submit-btn">
            <span>{form.submitIdle}</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </button>
          <p className="form-footer-note">{form.footerNote}</p>
        </div>

        {isDraftReady && (
          <div className="form-draft-status" role="status" aria-live="polite">
            <p>{form.draftReady}</p>
            <p>
              {form.draftFallback}{' '}
              <a href={CONTACT_TEXT.channels.email.mailto}>{form.emailMeDirectly}</a>
            </p>
          </div>
        )}
      </form>
    </section>
  );
}
