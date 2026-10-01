import Layout from './Layout.jsx';
import HomePage from '../modules/home/presentation/HomePage.jsx';
import AboutPage from '../pages/about/AboutPage.jsx';
import ContactPage from '../pages/contact/ContactPage.jsx';
import ProjectsPage from '../pages/projects/ProjectsPage.jsx';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage.jsx';
import NotFound from '../pages/not-found/NotFound.jsx';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage initialExperienceState="intro" /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'projects', element: <ProjectsPage theme="dark" setTheme={() => {}} onNavigate={() => {}} /> },
      {
        path: 'projects/:slug',
        element: <ProjectDetailPage />,
        getStaticPaths: () => [
          '/projects/dietify',
          '/projects/wos',
          '/projects/speak-and-translate',
          '/projects/expenseflow',
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default function App() {
  return null;
}
