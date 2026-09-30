import { Link } from 'react-router-dom';
import SEO from '../../shared/seo/SEO.jsx';
import './not-found.css';

export default function NotFound() {
  return (
    <>
      <SEO title="404 - Page Not Found" description="The requested page could not be found." />
      <div className="not-found-container" style={{ padding: '120px 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '32px', color: 'var(--ithx-text-secondary)' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" style={{ padding: '12px 24px', background: 'var(--ithx-interactive-blue)', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: '500' }}>
          Return to home
        </Link>
      </div>
    </>
  );
}
