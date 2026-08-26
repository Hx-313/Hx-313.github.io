export default function HeroContent() {
  return (
    <div className="hero-content" data-hero-enter>
      <p className="hero-kicker">Hafiz Ali Abdullah <span>·</span> Full-Stack Software Engineer</p>
      
      <h1 id="hero-title" className="hero-title">
        <span>A mindset</span>
        <strong className="beyond">Beyond</strong>
        <span>ordinary.</span>
      </h1>
      
      <p className="hero-description">
        I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward.
      </p>

      <div className="hero-cta-group">
        <div className="system-access-status">
          SYSTEM ACCESS <span className="access-dot" aria-hidden="true">•</span> <span className="access-online">ONLINE</span>
        </div>
        
        <a className="btn-command-center" href="#command-center">
          <span>ENTER COMMAND CENTER</span>
          <span className="btn-arrow" aria-hidden="true">&gt;&gt;</span>
        </a>

        <a className="btn-explore-work" href="#work">
          <span>EXPLORE WORK</span>
          <span className="btn-arrow" aria-hidden="true">&gt;&gt;</span>
        </a>
      </div>
    </div>
  );
}
