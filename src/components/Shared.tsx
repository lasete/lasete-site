import { useId, useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent, type ContentItem } from '@/lib/content';
import { safeUrl } from '@/lib/utils';
export function PageIntro({
  label,
  title,
  description,
  ambient = false,
}: {
  ambient?: boolean;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <header
      className="page-intro shell"
      data-matrix={ambient ? 'intro' : undefined}
    >
      <span className="section-label">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
export function SectionHeading({
  label,
  title,
  link,
  to,
}: {
  label?: string;
  title: string;
  link?: string;
  to?: string;
}) {
  return (
    <div className="section-heading" data-reveal>
      <div>
        {label && <span className="section-label">{label}</span>}
        <h2>{title}</h2>
      </div>
      {link && to && (
        <Link className="text-link" to={to}>
          {link}
        </Link>
      )}
    </div>
  );
}
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
export function ContentCard({ item }: { item: ContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <article
      data-reveal
      className={`content-card ${expanded ? 'is-expanded' : ''} ${item.type === 'media' ? 'media-card' : ''}`}
    >
      {item.image && (
        <div className={`card-image ${item.postCrop ? 'post-crop' : ''}`}>
          <img
            src={safeImage(item.image)}
            alt={item.title}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <div className="card-copy">
        <span className="meta">
          {item.category}
          {item.date &&
            ` · ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(item.date + 'T12:00:00'))}`}
        </span>
        {item.author && (
          <span className="content-author">Por {item.author}</span>
        )}
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <button
          className="card-expand"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={id}
        >
          {expanded ? 'Fechar relato' : 'Ler sobre'}
          <span className="sr-only"> {item.title}</span>
          <ChevronDown size={16} />
        </button>
        <div id={id} hidden={!expanded} className="card-expanded">
          <p>
            {item.description || 'Acompanhe os canais da liga para saber mais.'}
          </p>
          {safeUrl(item.url) && (
            <a
              className="text-link"
              href={safeUrl(item.url)}
              target="_blank"
              rel="noreferrer"
            >
              {item.type === 'activity' || item.type === 'media'
                ? 'Ver no Instagram'
                : 'Acessar material'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
export function safeImage(src: string) {
  return src.startsWith('data:image/') || src.startsWith('/images/')
    ? src
    : safeUrl(src);
}
