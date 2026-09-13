export default function HeroVisual() {
  return (
    <aside className="hero-visual" data-hero-enter aria-label="Architecture map for a connected mobile system">
      <div className="hero-system-card">
        <div className="hero-system-card__header">
          <span>Build map</span>
          <span>01 / 03</span>
        </div>

        <div className="hero-system-flow" aria-label="Flutter or native app connects to a Node.js API and operational tools">
          <div className="hero-system-node hero-system-node--app">
            <span className="hero-system-node__index">01</span>
            <strong>Flutter / Native</strong>
            <small>Mobile experience</small>
          </div>
          <span className="hero-system-connector" aria-hidden="true">→</span>
          <div className="hero-system-node hero-system-node--api">
            <span className="hero-system-node__index">02</span>
            <strong>Node.js API</strong>
            <small>Business logic</small>
          </div>
          <span className="hero-system-connector" aria-hidden="true">→</span>
          <div className="hero-system-node hero-system-node--ops">
            <span className="hero-system-node__index">03</span>
            <strong>Data + Ops</strong>
            <small>Systems that run</small>
          </div>
        </div>

        <div className="hero-system-card__footer">
          <span>One connected build</span>
          <span>Interface · API · Workflow</span>
        </div>
      </div>

      <figure className="hero-portrait">
        <img
          src="/assets/hafiz-ali-abdullah.png"
          alt="Hafiz Ali Abdullah, mobile application developer"
          width="942"
          height="1680"
          fetchPriority="high"
        />
      </figure>
      <div className="hero-visual-stamp" aria-hidden="true">HX / 313</div>
    </aside>
  );
}
