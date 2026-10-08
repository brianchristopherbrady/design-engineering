import { BrowserRouter } from 'react-router';
import { basePath } from './paths';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes';

/**
 * Router updates are synchronous (`useTransitions={false}`) because the directory search box is a
 * controlled input bound to the URL; React requires controlled input updates to be synchronous.
 */
export function App() {
  return (
    <BrowserRouter basename={basePath} useTransitions={false}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
