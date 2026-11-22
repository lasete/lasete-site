import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flag, Network, Plus } from 'lucide-react';
import type { ContentItem } from '@/lib/data/content';
import { safeImage, safeUrl } from '@/lib/utils';
import { useMediaQuery } from '@/lib/preferences';
import { Emblem } from '@/components/shared/Brand';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
function AIProjectArtwork({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  return (
    <div className="ai-project-art" aria-hidden="true">
      <div className="ai-project-signal">
        <span className="ai-project-node ai-project-node-north" />
        <span className="ai-project-node ai-project-node-east" />
        <span className="ai-project-node ai-project-node-south" />
        <span className="ai-project-node ai-project-node-west" />
        <Network size={46} strokeWidth={1.2} />
      </div>
      <div className="ai-project-label">
        <strong>{title}</strong>
        <span>{category}</span>
      </div>
    </div>
  );
}
export function ProjectPreview({ item }: { item: ContentItem }) {
  const image = item.id === 'ctf' ? '/images/ctf.webp' : item.image;
  return (
    <article className="project-preview" data-project={item.id} data-reveal>
      <Link
        to={`/projetos?projeto=${encodeURIComponent(item.id)}`}
        className={`project-preview-image ${item.postCrop || item.id === 'ctf' ? 'post-crop' : ''}`}
        aria-label={`Conhecer o projeto ${item.title}`}
      >
        {image ? (
          <img
            src={safeImage(image)}
            alt={item.title}
            loading="lazy"
            decoding="async"
          />
        ) : item.id === 'lasete-ai' ? (
          <AIProjectArtwork title={item.title} category={item.category} />
        ) : (
          <div className="project-preview-brand">
            <Emblem />
            <span>{item.title}</span>
          </div>
        )}
      </Link>
      <div className="project-preview-copy">
        <span className="meta">{item.category}</span>
        <h3>
          <Link to={`/projetos?projeto=${encodeURIComponent(item.id)}`}>
            {item.title}
          </Link>
        </h3>
        <p>{item.subtitle}</p>
        <Link
          className="text-link"
          to={`/projetos?projeto=${encodeURIComponent(item.id)}`}
        >
          Explorar projeto
        </Link>
      </div>
    </article>
  );
}
const ctfSteps = [
  {
    name: 'Reconhecimento',
    copy: 'Compreender a aplicação e identificar os pontos de entrada foi o começo do desafio.',
    tools: 'Mapeamento do ambiente e dos serviços',
    detail:
      'O CTF criado pelos membros colocou os participantes diante de uma aplicação preparada para a competição. A primeira etapa foi observar o ambiente e reunir informações para orientar a investigação.',
  },
  {
    name: 'Enumeração',
    copy: 'Investigar caminhos, serviços e o comportamento da aplicação para aprofundar a análise.',
    tools: 'Nmap · Gobuster · Dirb · ffuf',
    detail:
      'A competição envolveu enumeração e fuzzing de parâmetros. Essas etapas ajudaram os participantes a formular hipóteses sobre a aplicação e a localizar pontos para investigar.',
  },
  {
    name: 'Exploração',
    copy: 'Aplicar o raciocínio técnico aos desafios do ambiente criado para o CTF.',
    tools: 'Headers · SQL Injection · LFI · Exploit chain',
    detail:
      'Os registros da atividade incluem manipulação de headers, SQL Injection, inclusão local de arquivos e encadeamento de vulnerabilidades. Todos os desafios pertenciam à aplicação preparada para a competição.',
  },
];
function CtfDetails() {
  const [step, setStep] = useState('Reconhecimento');
  return (
    <section
      className="ctf-explorer"
      data-reveal
      aria-label="Etapas exploradas no CTF"
    >
      <div className="project-section-title">
        <h3>Por dentro do desafio</h3>
        <p>Explore as etapas descritas no registro da atividade.</p>
      </div>
      <Tabs value={step} onValueChange={setStep} className="ctf-tabs">
        <TabsList aria-label="Etapas do Capture the Flag">
          {ctfSteps.map((s) => (
            <TabsTrigger key={s.name} value={s.name}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {ctfSteps.map((s) => (
          <TabsContent key={s.name} value={s.name}>
            <h4>{s.copy}</h4>
            <p>{s.detail}</p>
            <span className="ctf-topics">{s.tools}</span>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
export function ProjectExplorer({ items }: { items: ContentItem[] }) {
  const [params, setParams] = useSearchParams();
  const horizontal = useMediaQuery('(max-width: 700px)');
  const [category, setCategory] = useState('Todos');
  const categories = [
    'Todos',
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ];
  const filtered = items.filter(
    (i) => category === 'Todos' || i.category === category,
  );
  const selected =
    filtered.find((i) => i.id === params.get('projeto'))?.id || filtered[0]?.id;
  return (
    <div className="project-explorer">
      <div className="filter-line">
        <span className="meta">Filtrar por área</span>
        <div className="filter-buttons">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={category === c ? 'active' : ''}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {selected ? (
        <Tabs
          value={selected}
          onValueChange={(id) => setParams({ projeto: id }, { replace: true })}
          className="project-workspace"
          orientation={horizontal ? 'horizontal' : 'vertical'}
        >
          <TabsList aria-label="Escolher projeto" className="project-selector">
            {filtered.map((item) => (
              <TabsTrigger value={item.id} key={item.id}>
                <span>
                  {item.id === 'ctf' ? (
                    <Flag size={20} />
                  ) : item.id === 'lasete-ai' ? (
                    <Network size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.category}</small>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {filtered.map((item) => (
            <TabsContent
              key={item.id}
              value={item.id}
              className="project-detail"
            >
              <div className="project-detail-intro">
                <div>
                  <span className="section-label">{item.category}</span>
                  <h2>{item.title}</h2>
                  <p className="project-subtitle">{item.subtitle}</p>
                  <p className="project-description">
                    {item.description ||
                      'Acompanhe as atualizações desta iniciativa pelos canais da liga.'}
                  </p>
                  <div className="project-detail-actions">
                    {safeUrl(item.url) ? (
                      <Button asChild>
                        <a
                          href={safeUrl(item.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.id === 'lasete-ai'
                            ? 'Acessar LASETE AI'
                            : 'Acessar projeto'}
                        </a>
                      </Button>
                    ) : (
                      <Button asChild variant="outline">
                        <Link to="/atividades">Ver atividades da liga</Link>
                      </Button>
                    )}
                    <Link className="text-link" to="/participar#contato">
                      Conversar sobre o projeto
                    </Link>
                  </div>
                  {item.id === 'lasete-ai' && (
                    <small className="project-source">
                      A aplicação abre em uma nova aba, no Streamlit.
                    </small>
                  )}
                </div>
                <div
                  className={`project-detail-visual ${item.postCrop || item.id === 'ctf' ? 'post-crop' : ''}`}
                >
                  {item.image || item.id === 'ctf' ? (
                    <img
                      src={safeImage(
                        item.id === 'ctf' ? '/images/ctf.webp' : item.image,
                      )}
                      alt={
                        item.id === 'ctf'
                          ? 'Cartaz do projeto Capture the Flag da LASETE'
                          : item.title
                      }
                      loading="lazy"
                    />
                  ) : item.id === 'lasete-ai' ? (
                    <AIProjectArtwork
                      title={item.title}
                      category={item.category}
                    />
                  ) : (
                    <div className="project-detail-brand">
                      <Emblem />
                      <span>{item.title}</span>
                      <small>{item.category}</small>
                    </div>
                  )}
                </div>
              </div>
              {item.id === 'ctf' && <CtfDetails />}
              {item.id === 'lasete-ai' && (
                <div className="project-footnote" data-reveal>
                  <span>Sobre a iniciativa</span>
                  <p>
                    A LASETE AI faz parte das experiências da liga com
                    tecnologias emergentes. Você pode acessar a ferramenta ou
                    falar com a equipe para conhecer o projeto.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="empty-filter">
          Nenhum projeto nesta área. Selecione outro filtro.
        </p>
      )}
    </div>
  );
}
