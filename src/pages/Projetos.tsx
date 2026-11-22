import { usePublished } from '@/lib/data/content';
import { EmptyState } from '@/components/shared/ContentState';
import { PageIntro } from '@/components/shared/PageIntro';
import { ProjectExplorer } from '@/components/sections/Projects';

export default function Projetos() {
  const items = usePublished('project');
  return (
    <>
      <PageIntro
        ambient
        label="Projetos"
        title="Conhecimento em construção."
        description="Explore as iniciativas da LASETE. Conheça cada projeto, veja o que foi experimentado e encontre um caminho para continuar a conversa."
      />
      <section className="shell project-page">
        {items.length ? (
          <ProjectExplorer items={items} />
        ) : (
          <EmptyState
            title="Novas ideias encontram espaço aqui."
            description="Os projetos disponibilizados pela liga aparecerão neste catálogo."
          />
        )}
      </section>
    </>
  );
}
