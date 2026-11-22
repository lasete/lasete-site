import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '@/lib/data/content';

// Estado do carregamento do conteúdo: um esqueleto com o formato do que vai chegar (cartões,
// ou um bloco único) enquanto o banco responde, ou o aviso de falha com nova tentativa.
// `quiet` não mostra nada durante o carregamento. Com o conteúdo pronto, não renderiza nada.
export function ContentStatus({
  quiet = false,
  shape = 'cards',
}: {
  quiet?: boolean;
  shape?: 'cards' | 'block';
}) {
  const { loading, loadError, reload } = useContent();
  if (loading)
    return quiet ? null : (
      <div
        className={`content-skeleton ${shape === 'cards' ? 'activity-grid' : 'content-skeleton-block'}`}
        role="status"
        aria-busy="true"
      >
        <span className="sr-only">Carregando conteúdo…</span>
        {(shape === 'cards' ? [0, 1, 2] : [0]).map((index) => (
          <div className="skeleton-card" aria-hidden="true" key={index}>
            <div className="skeleton skeleton-image" />
            {shape === 'cards' && (
              <>
                <div className="skeleton skeleton-line skeleton-meta" />
                <div className="skeleton skeleton-line skeleton-title" />
                <div className="skeleton skeleton-line" />
              </>
            )}
          </div>
        ))}
      </div>
    );
  if (!loadError) return null;
  return (
    <div className="content-status content-status-error" role="alert">
      <p>{loadError}</p>
      <button type="button" onClick={reload}>
        Tentar novamente
      </button>
    </div>
  );
}
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { loading, loadError } = useContent();
  // "Ainda não há nada" só vale depois que o banco respondeu.
  if (loading || loadError) return <ContentStatus />;
  return (
    <div className="empty-state">
      <FileText size={26} strokeWidth={1.5} />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link className="text-link" to="/participar">
        Fale com a liga
      </Link>
    </div>
  );
}
