import {
  FiCreditCard,
  FiLayers,
  FiLink,
  FiRefreshCw,
  FiSend,
  FiServer,
  FiShield,
  FiSmartphone,
  FiTool,
  FiZap,
} from 'react-icons/fi';
import { servicesData } from './servicesData.js';
import './services.css';

const SERVICE_ICONS = Object.freeze({
  smartphone: FiSmartphone,
  refresh: FiRefreshCw,
  zap: FiZap,
  rocket: FiSend,
  shield: FiShield,
  server: FiServer,
  link: FiLink,
  layers: FiLayers,
  creditCard: FiCreditCard,
});

function ServiceIcon({ name }) {
  const Icon = SERVICE_ICONS[name] || FiTool;

  return <Icon aria-hidden="true" focusable="false" />;
}

export default function Services() {
  const services = servicesData.tabs.flatMap((tab) =>
    tab.items.map((service) => ({ ...service, category: tab.id }))
  );

  return (
    <section
      id="services"
      className="services-section"
      aria-labelledby="services-heading"
      data-section="services"
    >
      <div className="services-container">
        <h2 id="services-heading" className="services-label">
          {servicesData.label}
        </h2>

        <div className="services-grid" role="list" aria-label="Services offered">
          {services.map((service) => (
            <article
              key={service.id}
              className="services-item"
              data-category={service.category}
              role="listitem"
            >
              <div className="services-item-icon">
                <ServiceIcon name={service.icon} />
              </div>
              <h3 className="services-item-name">{service.name}</h3>
              <p className="services-item-description">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
