import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { NotFoundPage } from './pages/NotFoundPage';
import { OverviewPage } from './pages/OverviewPage';
import { AppShell } from './shell/AppShell';

// The overview ships in the main bundle; the other sections load on demand.
const FoundationsIndexPage = lazy(() => import('./pages/FoundationsIndexPage').then((module) => ({ default: module.FoundationsIndexPage })));
const FoundationPage = lazy(() => import('./pages/FoundationPage').then((module) => ({ default: module.FoundationPage })));
const ComponentsIndexPage = lazy(() => import('./pages/ComponentsIndexPage').then((module) => ({ default: module.ComponentsIndexPage })));
const ComponentPage = lazy(() => import('./pages/ComponentPage').then((module) => ({ default: module.ComponentPage })));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage').then((module) => ({ default: module.PlaygroundPage })));
const PatternsIndexPage = lazy(() => import('./pages/PatternsIndexPage').then((module) => ({ default: module.PatternsIndexPage })));
const PatternPage = lazy(() => import('./pages/PatternPage').then((module) => ({ default: module.PatternPage })));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="foundations" element={<FoundationsIndexPage />} />
        <Route path="foundations/:topicId" element={<FoundationPage />} />
        <Route path="components" element={<ComponentsIndexPage />} />
        <Route path="components/:componentId" element={<ComponentPage />} />
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="patterns" element={<PatternsIndexPage />} />
        <Route path="patterns/:patternId" element={<PatternPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
