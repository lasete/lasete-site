import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/shared/PageIntro';
import { SectionHeading } from '@/components/shared/SectionHeading';

export default function Liga() {
  return (
    <>
      <PageIntro
        ambient
        label="A liga"
        title="A curiosidade encontra seu lugar."
        description="Uma iniciativa de estudantes da Escola de Tecnologia da UNDB para aprender, pesquisar e explorar novas possibilidades em segurança e tecnologias emergentes."
      />
      <section className="about-statement shell">
        <div className="about-photo">
          <img
            src="/images/a-liga.webp"
            alt="Integrantes da LASETE reunidos em uma atividade da liga"
            loading="lazy"
          />
        </div>
        <div className="about-copy">
          <span className="section-label">A gente acredita na troca.</span>
          <h2>
            Aprender junto
            <br />
            faz diferença.
          </h2>
          <p>
            A LASETE integra estudantes que compartilham o interesse pela
            cibersegurança e pelas inovações tecnológicas. Um espaço de
            aprofundamento técnico, pesquisa científica e construção coletiva.
          </p>
          <p>
            Aqui, uma pergunta pode virar um grupo de estudo. Um encontro pode
            virar um projeto. E o que aprendemos pode ir mais longe quando é
            compartilhado.
          </p>
          <Link className="text-link" to="/membros">
            Conheça as pessoas
          </Link>
        </div>
      </section>
      <section className="shell section-space">
        <SectionHeading
          label="Nossa forma de fazer"
          title="Três frentes. A mesma vontade de ir além."
        />
        <div className="principle-rows">
          {[
            {
              symbol: '—',
              title: 'Ensino',
              copy: 'Aulas internas, oficinas e grupos de estudo que aproximam fundamentos e prática.',
              to: '/atividades?aba=ensino',
            },
            {
              symbol: '+',
              title: 'Pesquisa',
              copy: 'Investigação acadêmica e aprofundamento técnico nas áreas de segurança e tecnologias emergentes.',
              to: '/pesquisas',
            },
            {
              symbol: '◉',
              title: 'Extensão',
              copy: 'Organização e participação em eventos para levar o conhecimento à comunidade.',
              to: '/atividades',
            },
          ].map((p) => (
            <Link to={p.to} key={p.title} data-reveal>
              <span className="principle-symbol" aria-hidden="true">
                {p.symbol}
              </span>
              <h3>{p.title}</h3>
              <p>{p.copy}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="manifesto">
        <div className="shell">
          <span className="section-label">
            Da sala de aula para novas possibilidades.
          </span>
          <h2>
            Investigar com curiosidade.
            <br />
            Construir com responsabilidade.
            <br />
            <span>Compartilhar para transformar.</span>
          </h2>
          <p>Segurança, ética e colaboração fazem parte dessa conversa.</p>
        </div>
      </section>
    </>
  );
}
