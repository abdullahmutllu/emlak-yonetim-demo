import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Activities from './pages/Activities';
import Market from './pages/Market';
import AiSearch from './pages/AiSearch';
import Security from './pages/Security';

const MapPage = lazy(() => import('./pages/MapPage'));

function MapFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
      Harita yükleniyor…
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'gayrimenkuller', element: <Properties /> },
      { path: 'kiracilar', element: <Tenants /> },
      {
        path: 'harita',
        element: (
          <Suspense fallback={<MapFallback />}>
            <MapPage />
          </Suspense>
        ),
      },
      { path: 'faaliyetler', element: <Activities /> },
      { path: 'pazar-arastirma', element: <Market /> },
      { path: 'ai-arama', element: <AiSearch /> },
      { path: 'guvenlik', element: <Security /> },
    ],
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
