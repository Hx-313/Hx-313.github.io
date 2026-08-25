export default function HeroContent() {
  return (
    <div className="hero-content">
      <p className="hero-kicker" data-hero-enter>Hafiz Ali Abdullah <span>·</span> Full-Stack Software Engineer</p>
      <h1 id="hero-title" data-hero-enter>
        <span>A mindset</span><strong data-beyond>Beyond</strong><span>ordinary.</span>
      </h1>
      <p className="hero-description" data-hero-enter>I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward.</p>
      <div className="hero-actions" data-hero-enter>
        <a className="hero-button hero-button--primary" href="#work">Explore the work <span aria-hidden="true">↗</span></a>
        <a className="hero-button hero-button--ghost" href="mailto:aliabdullahva313@gmail.com">Start a conversation</a>
      </div>
    </div>
  );
}
