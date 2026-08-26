export default function SystemOverviewCard() {
  return (
    <aside className="telemetry-column" aria-label="System Overview Telemetry">
      <div className="overview-header">
        <span>SYSTEM OVERVIEW •</span>
      </div>

      <div className="metrics-grid">
        <span className="label">ACTIVE NODES</span>
        <span className="val">08</span>
        
        <span className="label">SYSTEMS</span>
        <span className="val">14</span>
        
        <span className="label">DEPLOYMENTS</span>
        <span className="val">12</span>
        
        <span className="label">INTEGRATIONS</span>
        <span className="val">26</span>
        
        <span className="label">UPTIME</span>
        <span className="val">99.98%</span>
        
        <span className="label">RESPONSE TIME</span>
        <span className="val">42ms</span>
      </div>

      <div className="metrics-status-bar">
        <span>CLUSTER STATUS</span>
        <span className="status-normal">ALL SERVICES NORMAL</span>
      </div>
    </aside>
  );
}
