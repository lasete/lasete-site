import { Link } from 'react-router-dom';
import { Mail, FileText, LockKeyhole } from 'lucide-react';
import { Instagram, Linkedin } from '@/components/shared/SocialIcons';
import { useContent } from '@/lib/data/content';
import { safeUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ContentStatus } from '@/components/shared/ContentState';

export default function Participar() {
  const { data, loading, loadError } = useContent();
  const s = data.settings;
  // O status do seletivo e os links vêm do banco: sem eles, nada é afirmado.
  const ready = !loading && !loadError;
  return (
    <>
      <header id="contato" className="shell participate-intro">
        <div>
          <span className="section-label">Participar e contato</span>
          <h1>Vamos conversar.</h1>
          <p>
            Quer fazer parte da liga, propor uma atividade ou saber mais sobre o
            que estamos construindo? Fale com a LASETE.
          </p>
          <a className="text-link" href="#seletivo">
            Consultar processo seletivo
          </a>
        </div>
        <div className="contact-links" aria-label="Canais de contato">
          {s.email && (
            <a href={`mailto:${s.email}`}>
              <Mail size={23} strokeWidth={1.5} />
              <div>
                <span>E-mail</span>
                <small>{s.email}</small>
              </div>
            </a>
          )}
          {safeUrl(s.instagram) && (
            <a href={safeUrl(s.instagram)} target="_blank" rel="noreferrer">
              <Instagram size={23} />
              <div>
                <span>Instagram</span>
                <small>Atividades, registros e novidades</small>
              </div>
            </a>
          )}
          {safeUrl(s.linkedin) && (
            <a href={safeUrl(s.linkedin)} target="_blank" rel="noreferrer">
              <Linkedin size={23} />
              <div>
                <span>LinkedIn</span>
                <small>Conexões e iniciativas da liga</small>
              </div>
            </a>
          )}
        </div>
      </header>
      {ready ? (
        <>
          <section
            id="seletivo"
            data-reveal
            className={`selection-banner shell ${s.selectionOpen ? 'selection-open' : 'selection-closed'}`}
            aria-labelledby="selection-heading"
          >
            <div className="selection-top">
              <span className="selection-label">
                <span className="status-dot" />
                Processo seletivo
              </span>
              {s.selectionOpen ? (
                <span>Venha fazer parte.</span>
              ) : (
                <LockKeyhole size={23} strokeWidth={1.5} />
              )}
            </div>
            <h2 id="selection-heading">
              {s.selectionOpen ? (
                <>
                  INSCRIÇÕES
                  <br />
                  <span>ABERTAS.</span>
                </>
              ) : (
                <>
                  SELETIVO
                  <br />
                  <span>FECHADO.</span>
                </>
              )}
            </h2>
            <div className="selection-bottom">
              <p>
                {s.selectionOpen
                  ? 'Venha aprender, pesquisar e construir com a LASETE. Confira o edital e participe do processo seletivo.'
                  : 'As inscrições estão encerradas. Conheça o edital e acompanhe nossos canais para saber quando a próxima oportunidade chegar.'}
              </p>
              <div className="selection-actions">
                <Button asChild variant="outline">
                  <a
                    href={safeUrl(s.editalUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText size={17} />
                    Ler edital
                  </a>
                </Button>
                <Button asChild>
                  <a href={safeUrl(s.formUrl)} target="_blank" rel="noreferrer">
                    {s.selectionOpen ? 'Inscreva-se' : 'Consultar formulário'}
                  </a>
                </Button>
              </div>
            </div>
          </section>
          <section className="shell participation-details" data-reveal>
            <h2>Antes de participar</h2>
            <div>
              <p>{s.selectionNote}</p>
              <p>
                Ficou com alguma dúvida? Entre em contato pelos canais acima.
                Você também pode conhecer as pessoas, as iniciativas e as
                atividades da LASETE pelo site.
              </p>
              <Link className="text-link" to="/a-liga">
                Conheça a LASETE
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section id="seletivo" className="shell">
          <ContentStatus shape="block" />
        </section>
      )}
    </>
  );
}
