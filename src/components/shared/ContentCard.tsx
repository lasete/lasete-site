import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ContentItem } from '@/lib/data/content';
import { safeImage, safeUrl } from '@/lib/utils';

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
