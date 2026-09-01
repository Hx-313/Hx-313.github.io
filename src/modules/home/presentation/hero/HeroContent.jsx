export default function HeroContent() {
  return (
    <div className="hero-content">
      <p className="hero-kicker" data-hero-enter>
        Hafiz Ali Abdullah <span>·</span> Full-Stack Software Engineer
      </p>
      
      <h1 id="hero-title" className="hero-title" data-hero-enter>
        <span>A mindset</span>
        <strong className="beyond">Beyond</strong>
        <span>ordinary.</span>
      </h1>
      
      <p className="hero-description" data-hero-enter>
        I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward.
      </p>

      <div className="hero-cta-group" data-hero-enter>
        <div className="system-access-status">
          SYSTEM ACCESS <span className="access-dot" aria-hidden="true">•</span> <span className="access-online">ONLINE</span>
        </div>
        
        <a className="btn-command-center" href="#problem">
          <span>EXPLORE THE SYSTEM</span>
          <span className="btn-arrow" aria-hidden="true">&gt;&gt;</span>
        </a>

        <a className="btn-explore-work" href="#systems">
          <span>VIEW SYSTEMS</span>
          <span className="btn-arrow" aria-hidden="true">&gt;&gt;</span>
        </a>
      </div>
    </div>
  );
}
