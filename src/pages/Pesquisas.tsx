import { usePublished } from '@/lib/content';
import {
  ContentCard,
  EmptyState,
  PageIntro,
  SectionHeading,
} from '@/components/Shared';

export default function Pesquisas() {
  const items = usePublished('research');
  return (
    <div className="research-page">
      <PageIntro
        ambient
        label="Pesquisas"
        title="Boas perguntas abrem caminhos."
        description="Pesquisa acadêmica e aprofundamento técnico para explorar as relações entre segurança, tecnologia e seus impactos reais."
      />
      <section className="shell research-results">
        <SectionHeading
          label="Pesquisas e materiais"
          title="Investigações e aprendizados da liga."
        />
        {items.length ? (
          <div className="project-grid">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Um espaço para nossas pesquisas."
            description="Os trabalhos e as publicações disponibilizados pela LASETE serão reunidos aqui. Acompanhe os canais da liga ou converse com a equipe para saber mais."
          />
        )}
      </section>
    </div>
  );
}
