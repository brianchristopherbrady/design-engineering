import { BrowserRouter } from 'react-router';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes';

/**
 * Router updates are synchronous (`useTransitions={false}`) because the catalog search box is a
 * controlled input bound to the URL; React requires controlled input updates to be synchronous.
 */
export function App() {
  return (
    <BrowserRouter useTransitions={false}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
