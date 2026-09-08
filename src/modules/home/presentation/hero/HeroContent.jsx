export default function HeroContent() {
  return (
    <div className="hero-content">
      <p className="hero-kicker" data-hero-enter>
        Hafiz Ali Abdullah <span>·</span> Mobile Application Developer
      </p>
      
      <h1 id="hero-title" className="hero-title hero-title--hook" data-hero-enter>
        <span>YOUR IDEA DESERVES MORE</span>
        <strong className="beyond">THAN AN APP THAT WORKS.</strong>
      </h1>
      
      <p className="hero-description" data-hero-enter>
        From first idea to launch, I design and build mobile apps for startups and businesses that want to give their users a better everyday experience.
      </p>

      <div className="hero-actions" data-hero-enter>
        <a className="btn-command-center" href="#contact">
          <span>Let’s talk</span>
          <span className="btn-arrow" aria-hidden="true">↗</span>
        </a>
        <a className="btn-explore-work" href="#systems">
          <span>View apps</span>
          <span className="btn-arrow" aria-hidden="true">↓</span>
        </a>
      </div>

      <p className="hero-proof" data-hero-enter>
        <span>2+ years building</span>
        <span>15+ apps shipped</span>
        <span>100k+ downloads</span>
      </p>
    </div>
  );
}
