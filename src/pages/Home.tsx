/* THESIS: uma abertura dedicada ao símbolo, seguida por conteúdo institucional real.
OWN-WORLD: preto, branco, Geist, fotografia da liga e navegação textual.
STORY: conhecer a proposta, explorar iniciativas, encontrar pessoas e entrar em contato.
FIRST VIEWPORT: somente volume ASCII e navbar; apresentação inicia abaixo da dobra.
FORM: composição definida pela revisão do responsável, com conteúdo em seções próprias. */
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useReducedMotion } from '@/lib/preferences';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Mail, Network } from 'lucide-react';
import { useContent, usePublished } from '@/lib/content';
import { safeUrl } from '@/lib/utils';
import { Hero } from '@/components/Hero';
import { NetworkInterlude } from '@/components/NetworkInterlude';
import { SectionHeading, ContentCard, safeImage } from '@/components/Shared';
import { ProjectPreview } from '@/components/Projects';
import { Button } from '@/components/ui/button';
export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      if (reduced) return;
      const media = gsap.matchMedia();
      media.add('(min-width: 701px)', () => {
        gsap.fromTo(
          '.home-intro-photo',
          { y: 24 },
          {
            y: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: '.home-intro',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.2,
            },
          },
        );
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );
  const { data } = useContent();
  const projects = usePublished('project'),
    activities = usePublished('activity'),
    studies = usePublished('research'),
    media = usePublished('media'),
    notices = usePublished('notice'),
    people = usePublished('member');
  const team = people.filter((p) => p.group === 'Diretoria').slice(0, 4);
  const s = data.settings;
  return (
    <div ref={root} className="home-page">
      <Hero />
      <section
        id="conheca"
        className="shell home-intro section-space"
        data-matrix="continuation"
      >
        <div className="home-intro-copy" data-reveal>
          <span className="section-label">LASETE</span>
          <h1>Segurança e tecnologia se constroem em comunidade.</h1>
          <p>
            Somos a Liga Acadêmica de Segurança e Tecnologias Emergentes da UNDB. Um encontro de estudantes que transformam o interesse por
            tecnologia em estudo, projetos e experiências compartilhadas.
          </p>
          <div className="inline-actions">
            <Button asChild>
              <Link to="/a-liga">Explore a liga</Link>
            </Button>
            <Link className="text-link" to="/membros">
              Conheça nossa equipe
            </Link>
          </div>
        </div>
        <figure className="home-intro-photo">
          <div className="home-intro-image">
            <img
              src="/images/liga-home.webp"
              alt="A comunidade da LASETE reunida em uma atividade na UNDB"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            Conhecimento que se constrói junto.
          </figcaption>
        </figure>
        <div className="home-pillars">
          {[
            {
              name: 'Ensino',
              copy: 'Aulas, oficinas e grupos de estudo para conectar fundamentos e prática.',
              to: '/atividades?aba=ensino',
            },
            {
              name: 'Pesquisa',
              copy: 'Aprofundamento técnico para investigar segurança e tecnologias emergentes.',
              to: '/pesquisas',
            },
            {
              name: 'Extensão',
              copy: 'Encontros e eventos que levam o conhecimento para além da liga.',
              to: '/atividades',
            },
          ].map((p) => (
            <Link to={p.to} key={p.name} data-reveal>
              <h2>{p.name}</h2>
              <p>{p.copy}</p>
            </Link>
          ))}
        </div>
      </section>
      <NetworkInterlude />
      <section className="shell section-space home-activities">
        <SectionHeading
          label="Atividades"
          title="A liga acontece aqui."
          link="Todas as atividades"
          to="/atividades"
        />
        <div className="activity-grid">
          {activities.slice(0, 3).map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <section className="section-surface">
        <div className="shell section-space">
          <SectionHeading
            label="Projetos"
            title="Do estudo à prática."
            link="Explorar projetos"
            to="/projetos"
          />
          <div className="home-projects home-projects-split">
            {projects.slice(0, 2).map((item) => (
              <ProjectPreview item={item} key={item.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="shell home-knowledge">
        <div className="home-studies" data-reveal>
          <span className="section-label">Estudos e materiais</span>
          <h2>O que a gente aprende também circula.</h2>
          <p>
            Segurança da informação, inteligência artificial e privacidade nos
            materiais compartilhados pela liga.
          </p>
          <div className="study-links">
            {studies.slice(0, 3).map((item) => (
              <Link key={item.id} to="/pesquisas">
                <span>{item.category.split(' · ').at(-1)}</span>
                <h3>{item.title}</h3>
              </Link>
            ))}
          </div>
          <Link className="text-link" to="/pesquisas">
            Conhecer estudos e materiais
          </Link>
        </div>
        <div className="home-ai" data-reveal>
          <Network size={30} strokeWidth={1.3} />
          <span className="section-label">Uma iniciativa da LASETE</span>
          <h2>LASETE AI</h2>
          <p>
            Conheça nossa experiência com inteligência artificial e explore a
            ferramenta desenvolvida pela liga.
          </p>
          <Button asChild>
            <a href={safeUrl(s.aiUrl)} target="_blank" rel="noreferrer">
              Explorar LASETE AI
            </a>
          </Button>
          <small>Disponível no Streamlit.</small>
        </div>
      </section>
      <section className="shell section-space home-people">
        <SectionHeading
          label="Nossa equipe"
          title="Uma liga feita por pessoas."
          link="Conhecer todos os membros"
          to="/membros"
        />
        <div className="people-preview">
          {team.map((person) => (
            <Link to="/membros" key={person.id} data-reveal>
              {person.image ? (
                <img
                  src={safeImage(person.image)}
                  alt={person.title}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="people-preview-initial">{person.title[0]}</div>
              )}
              <h3>{person.title}</h3>
              <p>{person.role}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="section-surface">
        <div className="shell section-space home-updates">
          <div>
            <SectionHeading
              label="LASETE na mídia"
              title="Além dos nossos encontros."
              link="Ver registros e participações"
              to="/atividades?aba=midia"
            />
            <div className="media-preview-list">
              {media.slice(0, 2).map((item) => (
                <Link to="/atividades?aba=midia" key={item.id} data-reveal>
                  {item.image && (
                    <div
                      className={`media-preview-image ${item.postCrop ? 'post-crop' : ''}`}
                    >
                      <img src={safeImage(item.image)} alt="" loading="lazy" />
                    </div>
                  )}
                  <div>
                    <span className="meta">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <aside className="home-notices" data-reveal>
            <h2>Fique por dentro</h2>
            {notices.slice(0, 3).map((item) => (
              <div key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                {safeUrl(item.url) && (
                  <a
                    className="text-link"
                    href={safeUrl(item.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Consultar informação
                  </a>
                )}
              </div>
            ))}
            <Link className="text-link" to="/atividades?aba=comunicados">
              Todos os comunicados
            </Link>
          </aside>
        </div>
      </section>
      <section className="shell home-connect" data-reveal>
        <div>
          <span className="selection-pill">
            {s.selectionOpen
              ? 'Inscrições abertas'
              : 'Seletivo fechado no momento'}
          </span>
          <h2>Tem espaço para uma conversa.</h2>
          <p>
            Quer fazer parte, propor uma atividade ou conhecer melhor a liga?
            Encontre o edital, o formulário e nossos canais em um só lugar.
          </p>
          <Button asChild>
            <Link to="/participar">Participar e contato</Link>
          </Button>
        </div>
        <div className="home-connect-contact">
          <Mail size={24} strokeWidth={1.5} />
          <span>Fale com a LASETE</span>
          <a href={`mailto:${s.email}`}>{s.email}</a>
          <p>
            Acompanhe também o{' '}
            <a href={safeUrl(s.instagram)} target="_blank" rel="noreferrer">
              Instagram
            </a>{' '}
            e o{' '}
            <a href={safeUrl(s.linkedin)} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
