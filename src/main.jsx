import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './app/App.jsx';
import './shared/theme/global.css';

export const createRoot = ViteReactSSG({ routes });
