import { useState, useCallback } from 'react';
import { CONTACT_CHANNELS, TELEMETRY_DATA } from '../domain/contactData.js';

export default function ContactChannels() {
  const [copied, setCopied] = useState(false);
  const { meeting, whatsapp, email, socials } = CONTACT_CHANNELS;

  const handleCopyEmail = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      } else {
        window.location.href = email.mailto;
      }
    } catch {
      window.location.href = email.mailto;
    }
  }, [email.address, email.mailto]);

  return (
    <aside className="contact-channels" aria-label="Direct Communication Channels & Fast-Track Booking">
      {/* 1. Fast-Track Discovery Meeting Card */}
      <div className="channel-card channel-card--meeting">
        <div className="channel-card__header">
          <div className="channel-badge-group">
            <span className="channel-badge channel-badge--accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {meeting.duration}
            </span>
            <span className="channel-badge channel-badge--status">FAST TRACK</span>
          </div>
          <h3 className="channel-card__title">{meeting.title}</h3>
        </div>
        <p className="channel-card__desc">{meeting.description}</p>
        <a
          href={meeting.link}
          target="_blank"
          rel="noopener noreferrer"
          className="channel-action-btn channel-action-btn--primary"
          aria-label={`${meeting.buttonLabel} (opens booking in new tab)`}
        >
          <span>{meeting.buttonLabel}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>

      {/* 2. Live Operational Telemetry */}
      <div className="channel-card channel-card--telemetry">
        <div className="telemetry-item">
          <span className="telemetry-label">OPERATIONAL STATUS</span>
          <div className="telemetry-status-row">
            <span className="status-beacon" aria-hidden="true" />
            <span className="telemetry-value">{TELEMETRY_DATA.status}</span>
          </div>
        </div>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="telemetry-label">LOCAL BASE / TIMEZONE</span>
            <span className="telemetry-value">{TELEMETRY_DATA.timezone}</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">RESPONSE LATENCY</span>
            <span className="telemetry-value">{TELEMETRY_DATA.responseTime}</span>
          </div>
        </div>
      </div>

      {/* 3. Direct Tactical Channels */}
      <div className="direct-channels-list">
        {/* WhatsApp Direct */}
        <a
          href={whatsapp.link}
          target="_blank"
          rel="noopener noreferrer"
          className="direct-channel-pill direct-channel-pill--whatsapp"
          aria-label={`${whatsapp.title}: ${whatsapp.label}`}
        >
          <div className="direct-channel-info">
            <span className="direct-channel-tag">{whatsapp.title}</span>
            <span className="direct-channel-val">{whatsapp.label}</span>
          </div>
          <span className="direct-channel-action">
            {whatsapp.actionLabel}
          </span>
        </a>

        {/* Email Direct */}
        <div className="direct-channel-pill direct-channel-pill--email">
          <div className="direct-channel-info">
            <span className="direct-channel-tag">{email.title}</span>
            <a href={email.mailto} className="direct-channel-val direct-channel-val--link">
              {email.address}
            </a>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="direct-channel-copy-btn"
            aria-label={copied ? 'Email copied to clipboard' : 'Copy email address'}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        {/* Social Badges */}
        <div className="channel-socials-row">
          {socials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-tactical-badge"
              aria-label={`${social.name}: ${social.handle} (opens in new tab)`}
            >
              <span className="social-tactical-name">{social.name}</span>
              <span className="social-tactical-handle">{social.handle}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
