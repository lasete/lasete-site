import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ascii404 } from '@/components/not-found/Ascii404';

/*
 * THESIS: A centered, tangible ASCII 404 leads a useful recovery, echoing the cube.
 * OWN-WORLD: Inherit neutral black and white, Geist, the public header and footer.
 * STORY: Explore the number, recognize the missing page, then choose a real destination.
 * FIRST VIEWPORT: Large interactive 3D number above the message, actions and three page suggestions.
 * FORM: The vertical composition explicitly requested for this existing error state.
 * MOTION: Local scattering with fixed orientation; demand rendering, capped DPR,
 * offscreen pause and a static fallback keep recovery fast and accessible.
 */
const destinations = [
  {
    to: '/a-liga',
    label: 'A liga',
    description: 'Conheça a LASETE e o que nos move.',
  },
  {
    to: '/membros',
    label: 'Membros',
    description: 'As pessoas que constroem a liga.',
  },
  {
    to: '/projetos',
    label: 'Projetos',
    description: 'Conhecimento que vira prática.',
  },
  {
    to: '/pesquisas',
    label: 'Pesquisas',
    description: 'Explore nossos estudos e materiais.',
  },
  {
    to: '/atividades',
    label: 'Atividades',
    description: 'Encontros, desafios e aprendizados.',
  },
];
function suggestPages() {
  const pages = [...destinations];
  for (let i = pages.length - 1; i > 0; i--) {
    const other = Math.floor(Math.random() * (i + 1));
    [pages[i], pages[other]] = [pages[other], pages[i]];
  }
  return pages.slice(0, 3);
}
export default function NotFound() {
  const { pathname, key } = useLocation();
  const suggestions = useMemo(suggestPages, [key]);
  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.append(robots);
    return () => robots.remove();
  }, []);
  return (
    <section className="not-found shell" aria-labelledby="not-found-title">
      <Ascii404 />
      <div className="not-found-copy">
        <span className="sr-only">Erro 404.</span>
        <h1 id="not-found-title">Página não encontrada.</h1>
        <p>
          O endereço pode ter mudado ou não existir. A liga continua por aqui.
        </p>
        <div className="not-found-actions">
          <Button asChild>
            <Link to="/">Voltar à Home</Link>
          </Button>
          <Link className="text-link" to="/participar#contato">
            Falar com a LASETE
          </Link>
        </div>
        <p className="not-found-path">
          <span>Endereço solicitado</span>
          <code>{pathname}</code>
        </p>
      </div>
      <nav
        className="not-found-suggestions"
        aria-labelledby="suggestions-title"
      >
        <h2 id="suggestions-title">Algumas páginas que temos</h2>
        <ul>
          {suggestions.map((page) => (
            <li key={page.to}>
              <Link to={page.to}>
                <span>
                  <strong>{page.label}</strong>
                  <span>{page.description}</span>
                </span>
                <ChevronRight size={19} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
