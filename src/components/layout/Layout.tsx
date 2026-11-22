import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/preferences';
import { useScrollReveal } from '@/lib/motion';
import { introStage, subscribeIntro } from '../hero/intro-l7';
import { Matrix } from '@/components/effects/Matrix';
import { Footer } from './Footer';
import { Header } from './Header';
import { navItems } from './navigation';

gsap.registerPlugin(ScrollTrigger);
// Estrutura comum a todas as páginas públicas: cabeçalho, fundo, conteúdo e rodapé.
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
  // A página não rola enquanto a abertura da Home está na tela.
  useEffect(() => {
    const sync = () => {
      if (introStage() === 'off') lenisRef.current?.start();
      else lenisRef.current?.stop();
    };
    sync();
    return subscribeIntro(sync);
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
