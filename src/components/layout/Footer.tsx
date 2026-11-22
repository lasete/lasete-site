import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useContent } from '@/lib/data/content';
import { safeUrl } from '@/lib/utils';
import { Brand } from '@/components/shared/Brand';
import { Instagram, Linkedin } from '@/components/shared/SocialIcons';

// Rodapé: identidade da liga, contato e copyright.
export function Footer() {
  const { data } = useContent();
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-identity">
            <Link to="/" aria-label="LASETE — início">
              <Brand />
            </Link>
          </div>
          <div className="footer-league">
            <p>Liga Acadêmica de Segurança e Tecnologias Emergentes</p>
            <span>São Luís, Maranhão</span>
          </div>
          <div className="footer-contact">
            <span className="section-label">Contato</span>
            {data.settings.email && (
              <a href={`mailto:${data.settings.email}`}>
                {data.settings.email}
              </a>
            )}
            <div className="footer-social">
              {safeUrl(data.settings.instagram) && (
                <a
                  href={safeUrl(data.settings.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram da LASETE"
                >
                  <Instagram size={20} />
                </a>
              )}
              {safeUrl(data.settings.linkedin) && (
                <a
                  href={safeUrl(data.settings.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn da LASETE"
                >
                  <Linkedin size={20} />
                </a>
              )}
              <button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia(
                      '(prefers-reduced-motion: reduce)',
                    ).matches
                      ? 'instant'
                      : 'smooth',
                  })
                }
                aria-label="Voltar ao topo"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LASETE</span>
        </div>
      </div>
    </footer>
  );
}
