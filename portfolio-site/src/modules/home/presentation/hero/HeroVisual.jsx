export default function HeroVisual() {
  return (
    <div className="hero-visual" data-hero-enter aria-label="Product interface visual">
      <div className="visual-orbit visual-orbit--one" /><div className="visual-orbit visual-orbit--two" />
      <div className="product-frame">
        <div className="product-topline"><span>LIVE PRODUCT SYSTEM</span><span>01 / 04</span></div>
        <div className="product-screen">
          <span className="screen-label">ORDER FLOW</span>
          <strong>Simple ideas.<br />Serious momentum.</strong>
          <div className="screen-bar"><span /></div>
          <div className="screen-meta"><span>BUILD</span><span>SHIP</span><span>GROW</span></div>
        </div>
        <div className="product-footer"><span>Flutter</span><span>SaaS</span><span>2026</span></div>
      </div>
      <span className="visual-caption">Built for the next move.</span>
    </div>
  );
}
