const lines = ['Ideas need structure.', 'Products need momentum.', 'Momentum needs conviction.'];

export default function GlitchIntro({ visible }) {
  return (
    <div className={`glitch-intro ${visible ? 'glitch-intro--active' : ''}`} data-glitch-intro aria-hidden={!visible}>
      <div className="glitch-lines">
        {lines.map((line, index) => <p key={line} className="glitch-line" style={{ '--line-index': index }}>{line}</p>)}
      </div>
      <div className="glitch-word" aria-hidden="true">BEYOND</div>
    </div>
  );
}
