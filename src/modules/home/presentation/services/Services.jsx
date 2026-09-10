import { useRef, useState } from 'react';
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
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabRefs = useRef([]);

  const selectTab = (index) => {
    setActiveTabIndex(index);
  };

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % servicesData.tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + servicesData.tabs.length) % servicesData.tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = servicesData.tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      id="services"
      className="services-section"
      aria-labelledby="services-heading"
      data-section="services"
    >
      <div className="services-container">
        <h2 id="services-heading" className="services-label section-heading">
          {servicesData.label}
        </h2>

        <div className="services-tabs" role="tablist" aria-label="Service categories">
          {servicesData.tabs.map((tab, index) => {
            const isActive = index === activeTabIndex;

            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`services-tab-${tab.id}`}
                className={`services-tab${isActive ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`services-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="services-panels">
          {servicesData.tabs.map((tab, index) => {
            const isActive = index === activeTabIndex;

            return (
              <div
                key={tab.id}
                id={`services-panel-${tab.id}`}
                className={`services-panel${isActive ? ' is-active' : ''}`}
                role="tabpanel"
                aria-labelledby={`services-tab-${tab.id}`}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
              >
                <div className="services-grid" role="list" aria-label={`${tab.label} services`}>
                  {tab.items.map((service) => (
                    <article key={service.id} className="services-item" role="listitem">
                      <div className="services-item-icon">
                        <ServiceIcon name={service.icon} />
                      </div>
                      <h3 className="services-item-name">{service.name}</h3>
                      <p className="services-item-description">{service.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
