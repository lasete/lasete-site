import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ContentProvider } from './lib/content';
import { Layout } from './components/Layout';
import NotFound from './pages/NotFound';
const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/Admin'));
const Liga = lazy(() => import('./pages/Liga'));
const Membros = lazy(() => import('./pages/Membros'));
const Projetos = lazy(() => import('./pages/Projetos'));
const Pesquisas = lazy(() => import('./pages/Pesquisas'));
const Atividades = lazy(() => import('./pages/Atividades'));
const Participar = lazy(() => import('./pages/Participar'));
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="a-liga" element={<Liga />} />
                <Route path="membros" element={<Membros />} />
                <Route path="projetos" element={<Projetos />} />
                <Route path="pesquisas" element={<Pesquisas />} />
                <Route path="atividades" element={<Atividades />} />
                <Route path="participar" element={<Participar />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
