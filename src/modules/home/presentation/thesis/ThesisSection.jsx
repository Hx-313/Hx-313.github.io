import './thesis.css';

export default function ThesisSection() {
  return (
    <section id="problem" className="thesis-section" aria-labelledby="thesis-heading" data-section="thesis">
      <span id="client-story" className="section-anchor-compat" aria-hidden="true" />
      <div className="thesis-container">
        <div className="thesis-topline">
          <span>01 / The working thesis</span>
          <span>App → system → outcome</span>
        </div>

        <div className="thesis-grid">
          <div className="thesis-lead">
            <p className="thesis-eyebrow">The product is not only the screen.</p>
            <h2 id="thesis-heading">It is the app, the API, the data, and the workflow working together.</h2>
          </div>

          <div className="thesis-copy">
            <p>
              Getting a prototype is easier than ever. Shipping reliable software is still difficult — it has to survive real users, real data, changing requirements, and the pressure of daily use.
            </p>
            <p>
              I build complete mobile systems: the application people use, the Node.js services behind it, and the dashboards and integrations that keep the product running.
            </p>
            <p>
              My work includes 15+ shipped applications and a complete restaurant ordering and POS system built for Webticians. My contribution covered mobile development, backend services, system connections, and UI/UX direction.
            </p>
          </div>
        </div>

        <div className="thesis-proof">
          <div>
            <span className="thesis-proof__label">Featured proof</span>
            <h3>OnlineOrder.pk / WOS</h3>
          </div>
          <p>Restaurant ordering and POS infrastructure built for Webticians — connecting a customer web experience, admin tools, terminals, and backend workflows.</p>
          <a href="#work">See the system in context <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
