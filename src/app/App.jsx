import { useEffect, useState } from 'react';

import HomePage from '../modules/home/presentation/HomePage.jsx';
import ProjectsPage from '../pages/projects/ProjectsPage.jsx';
import { useTheme } from '../shared/theme/useTheme.js';

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
  const [targetSection, setTargetSection] = useState(null);
  const [initialExperienceState, setInitialExperienceState] = useState(isProjectsRoute() ? 'ready' : 'intro');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleLocationChange = () => {
      const isProjects = isProjectsRoute();
      setRoute(isProjects ? 'projects' : 'home');
      if (!isProjects) {
        setInitialExperienceState('ready');
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleNavigate = (e, href, id) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const targetHash = href || '#top';
    window.location.hash = targetHash;
    setTargetSection(targetHash);
    setInitialExperienceState('ready');
    setRoute('home');
    setTimeout(() => {
      const target = document.querySelector(targetHash);
      if (target) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }, 60);
  };

  if (route === 'projects') {
    return (
      <ProjectsPage
        theme={theme}
        setTheme={setTheme}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <HomePage
      initialExperienceState={initialExperienceState}
      targetSection={targetSection}
    />
  );
}
