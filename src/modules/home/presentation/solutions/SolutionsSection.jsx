import './solutions.css';

const solutionPaths = Object.freeze([
  {
    number: '01',
    title: 'Event applications',
    description: 'Registration, schedules, notifications, maps, and the operational tools that keep a live event moving.',
    tags: 'Mobile · API · Admin',
  },
  {
    number: '02',
    title: 'University & education',
    description: 'Student-facing apps and connected workflows for campuses, programs, alumni, and institutional teams.',
    tags: 'Flutter · Native · Backend',
  },
  {
    number: '03',
    title: 'Government & civic systems',
    description: 'Clear public-service interfaces backed by dependable data flows, roles, approvals, and reporting.',
    tags: 'Systems · Integrations · Data',
  },
  {
    number: '04',
    title: 'Startup MVPs',
    description: 'A focused path from product idea to a usable mobile experience with the backend needed to learn quickly.',
    tags: 'Product · Flutter · Node.js',
  },
  {
    number: '05',
    title: 'Business operations',
    description: 'Internal apps, dashboards, and workflow automation that make a growing operation easier to run.',
    tags: 'Dashboards · APIs · Workflows',
  },
  {
    number: '06',
    title: 'Restaurant & commerce',
    description: 'Ordering, terminals, admin, and customer experiences connected into one practical operating system.',
    tags: 'POS · Mobile · SaaS',
  },
]);

export default function SolutionsSection() {
  return (
    <section id="solutions" className="solutions-section" aria-labelledby="solutions-heading" data-section="solutions">
      <div className="solutions-container">
        <header className="solutions-header">
          <div>
            <p className="solutions-kicker">Services in domains</p>
            <h2 id="solutions-heading">Bring the workflow. I’ll build the system around it.</h2>
          </div>
          <p className="solutions-intro">The same technical range can serve a university farewell, a government event, a new startup, or a business that needs its own operational app.</p>
        </header>

        <div className="solutions-grid" role="list">
          {solutionPaths.map((solution) => (
            <article key={solution.number} className="solution-card" role="listitem">
              <span className="solution-card__number">{solution.number}</span>
              <h3>{solution.title}</h3>
              <p>{solution.description}</p>
              <span className="solution-card__tags">{solution.tags}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
