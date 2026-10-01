import { Outlet } from 'react-router-dom';
import CosmicBackground from '../modules/home/presentation/CosmicBackground.jsx';
import SiteHeader from '../modules/home/presentation/header/SiteHeader.jsx';
import SiteFooter from '../modules/footer/presentation/SiteFooter.jsx';
import { useTheme } from '../shared/theme/useTheme.js';

export default function Layout() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="home-page">
      <CosmicBackground />
      <div className="site-experience is-ready">
        <SiteHeader theme={theme} setTheme={setTheme} />
        <main id="top">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
