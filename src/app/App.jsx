import { Routes, Route } from 'react-router-dom';
import Layout from './Layout.jsx';
import HomePage from '../modules/home/presentation/HomePage.jsx';
import AboutPage from '../pages/about/AboutPage.jsx';
import ContactPage from '../pages/contact/ContactPage.jsx';
import ProjectsPage from '../pages/projects/ProjectsPage.jsx';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage initialExperienceState="intro" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage theme="dark" setTheme={() => {}} onNavigate={() => {}} />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
      </Route>
    </Routes>
  );
}
