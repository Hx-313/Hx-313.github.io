import { useEffect, useState } from 'react';

import HomePage from '../modules/home/presentation/HomePage.jsx';
import ProjectsPage from '../pages/projects/ProjectsPage.jsx';

function isProjectsRoute() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return (
    hash === '#/projects' ||
    hash === '#projects-gallery' ||
    path === '/projects' ||
    path.endsWith('/projects.html')
  );
}

export default function App() {
  const [route, setRoute] = useState(isProjectsRoute() ? 'projects' : 'home');

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(isProjectsRoute() ? 'projects' : 'home');
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleBackToHome = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    window.location.hash = '#projects';
    setRoute('home');
  };

  if (route === 'projects') {
    return <ProjectsPage onBackToHome={handleBackToHome} />;
  }

  return <HomePage />;
}
