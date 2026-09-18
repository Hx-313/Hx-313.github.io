import HolographicGlobe from '../hero/HolographicGlobe.jsx';
import { COMMAND_CENTER_TEXT } from '../../../../core/constants/command-center/commandCenterText.js';

export default function SystemCore({ project }) {
  return (
    <section className="system-core system-core--shared-globe" aria-label={COMMAND_CENTER_TEXT.systemCore.aria}>
      <div className="system-core__topline"><span>{COMMAND_CENTER_TEXT.systemCore.selectedWork}</span><span>{project?.name ?? COMMAND_CENTER_TEXT.systemCore.defaultProject} / 01</span></div>
      <div className="system-core__globe">
        <HolographicGlobe className="holographic-stage-wrapper--dashboard" />
      </div>
    </section>
  );
}
