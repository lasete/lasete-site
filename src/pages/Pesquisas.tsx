import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePublished } from '@/lib/content';
import { matchesResearch } from '@/lib/research-search';
import { ContentCard, EmptyState, PageIntro } from '@/components/Shared';

export default function Pesquisas() {
  const items = usePublished('research');
  const [query, setQuery] = useState('');
  const results = items.filter((item) => matchesResearch(item, query));
  return (
    <div className="research-page">
      <PageIntro
        ambient
        label="Pesquisas"
        title="Boas perguntas abrem caminhos."
        description="Pesquisa acadêmica e aprofundamento técnico para explorar as relações entre segurança, tecnologia e seus impactos reais."
      />
      <section className="shell research-results">
        <div className="section-heading" data-reveal>
          <div>
            <span className="section-label">Pesquisas e materiais</span>
            <h2>Investigações e aprendizados da liga.</h2>
          </div>
          {items.length > 0 && (
            <label className="research-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                aria-label="Buscar pesquisas"
                placeholder="Buscar por título, tema ou autor"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          )}
        </div>
        {items.length > 0 && (
          <p className="sr-only research-search-status" role="status">
            {results.length === 1
              ? '1 pesquisa'
              : `${results.length} pesquisas`}
          </p>
        )}
        {!items.length ? (
          <EmptyState
            title="Um espaço para nossas pesquisas."
            description="Os trabalhos e as publicações disponibilizados pela LASETE serão reunidos aqui. Acompanhe os canais da liga ou converse com a equipe para saber mais."
          />
        ) : results.length ? (
          <div className="project-grid">
            {results.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="research-no-results">
            <h3>Nenhuma pesquisa encontrada</h3>
            <p>Tente outro título, tema ou nome de autor.</p>
            <button type="button" onClick={() => setQuery('')}>
              Limpar busca
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
