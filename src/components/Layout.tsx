import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useReducedMotion, useMediaQuery } from '@/lib/preferences';
import { Menu, ArrowUp } from 'lucide-react';
import { Instagram, Linkedin } from './SocialIcons';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { navItems, useContent } from '@/lib/content';
import { safeUrl } from '@/lib/utils';
import { useScrollReveal } from '@/lib/motion';
import { usePointerHighlight } from '@/lib/pointer-highlight';
import { Brand } from './Brand';
import { Matrix } from './Matrix';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
gsap.registerPlugin(ScrollTrigger);
function Header() {
  usePointerHighlight('.site-header');
  const { data } = useContent();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 1171px)');
  const brandLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (desktop) setOpen(false);
  }, [desktop]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <Link ref={brandLink} to="/" aria-label="LASETE — início">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Principal">
          {navItems.map((item) => (
            <NavLink key={item.to} end={item.to === '/'} to={item.to}>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Button asChild size="sm" className="ai-nav">
            <a
              href={safeUrl(data.settings.aiUrl)}
              target="_blank"
              rel="noreferrer"
            >
              LASETE AI
            </a>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="menu-trigger" aria-label="Abrir menu">
                <Menu size={24} />
              </button>
            </DialogTrigger>
            <DialogContent
              className="mobile-navigation"
              onCloseAutoFocus={(event) => {
                if (desktop) {
                  event.preventDefault();
                  brandLink.current?.focus();
                }
              }}
            >
              <DialogTitle className="sr-only">Explore a LASETE</DialogTitle>
              <DialogDescription className="sr-only">
                Navegue pelas páginas da liga.
              </DialogDescription>
              <Brand />
              <div className="mobile-menu-intro">
                <span>Navegue pela LASETE</span>
              </div>
              <motion.nav
                initial={reduced ? false : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.18 }}
                aria-label="Navegação móvel"
              >
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </motion.nav>
              <a
                className="mobile-contact"
                href={`mailto:${data.settings.email}`}
              >
                {data.settings.email}
              </a>
              <p>
                Liga Acadêmica de Segurança
                <br />e Tecnologias Emergentes
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  const { data } = useContent();
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-identity">
            <Link to="/" aria-label="LASETE — início">
              <Brand />
            </Link>
            <p>
              Liga Acadêmica de Segurança
              <br />e Tecnologias Emergentes.
            </p>
            <span>São Luís, Maranhão</span>
          </div>
          <nav aria-label="Rodapé">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="footer-contact">
            <span className="section-label">Contato</span>
            <a href={`mailto:${data.settings.email}`}>{data.settings.email}</a>
            <div className="footer-social">
              <a
                href={safeUrl(data.settings.instagram)}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram da LASETE"
              >
                <Instagram size={20} />
              </a>
              <a
                href={safeUrl(data.settings.linkedin)}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn da LASETE"
              >
                <Linkedin size={20} />
              </a>
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
          <span>© {new Date().getFullYear()} LASETE </span>
          <span>Ensino, pesquisa e extensão.</span>
        </div>
      </div>
    </footer>
  );
}
export function Layout() {
  const { pathname, hash } = useLocation();
  const main = useRef<HTMLElement>(null);
  useScrollReveal(main, pathname);
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;
    const lenis = new Lenis({
      lerp: 0.24,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    lenisRef.current = lenis;
    const update = (t: number) => lenis.raf(t * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);
  useEffect(() => {
    if (!hash) {
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    const current = navItems.find((n) => n.to === pathname);
    document.title = `${current?.label || 'Página não encontrada'} · LASETE`;
    const timeout = window.setTimeout(() => {
      if (hash)
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({ behavior: 'instant' });
      ScrollTrigger.refresh();
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <Header />
      <Matrix
        route={pathname}
        fullPage={['/a-liga', '/membros', '/participar'].includes(pathname)}
        immersiveIntro={['/projetos', '/pesquisas', '/atividades'].includes(
          pathname,
        )}
      />
      <main ref={main} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
