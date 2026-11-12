/* THESIS: a marca é o único elemento da abertura; o conteúdo começa depois.
OWN-WORLD: preto neutro, caracteres brancos, espaço e tipografia de proporção normal.
STORY: explorar o símbolo, depois conhecer as pessoas e o trabalho da liga.
FIRST VIEWPORT: navbar e um volume cúbico ASCII central, sem textos sobrepostos, com Matrix discreta ao fundo.
FORM: composição explicitamente pedida na revisão; sem sorteio de direção. */
import { lazy, Suspense, useRef, useState } from 'react';
import { introStage } from '@/lib/intro-l7';
import { useAsciiInteraction } from '@/lib/ascii-interaction';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { Emblem } from './Brand';
const HeroScene = lazy(() => import('./HeroScene'));
gsap.registerPlugin(useGSAP, ScrollTrigger);
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const interaction = useAsciiInteraction();
  const { pointer, visible, reduced, dragging } = interaction;
  // O nome só existe no DOM em carregamentos que tocam a abertura; o CSS controla quando aparece.
  const [hadIntro] = useState(() => introStage() !== 'off');
  useGSAP(
    () => {
      if (reduced) return;
      gsap.to('.hero-object', {
        y: -56,
        opacity: 0.35,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.15,
        },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );
  return (
    <section
      ref={root}
      className="hero"
      aria-label="LASETE em ASCII"
      data-matrix="hero"
    >
      <div
        ref={interaction.ref}
        className={`hero-object ${dragging ? 'is-dragging' : ''}`}
        tabIndex={0}
        role="group"
        aria-label="Símbolo 3D interativo da LASETE"
        aria-describedby="symbol-instructions"
        {...interaction.events}
      >
        <Suspense
          fallback={
            <div className="scene-fallback">
              <Emblem />
            </div>
          }
        >
          <HeroScene pointer={pointer} visible={visible} reduced={reduced} />
        </Suspense>
      </div>
      {hadIntro && (
        <p className="hero-intro-name" aria-hidden="true">
          Lasete
        </p>
      )}
      <span className="hero-touch-hint" aria-hidden="true">
        Toque para dispersar · arraste para girar
      </span>
      <a className="hero-scroll" href="#conheca">
        <span>Explore a LASETE</span>
        <ArrowDown size={16} aria-hidden="true" />
      </a>
      <p id="symbol-instructions" className="sr-only">
        Passe o mouse para dispersar os caracteres e arraste para girar. Com o
        teclado, use as setas para girar e Home para restaurar. No celular,
        toque para dispersar, arraste para os lados para girar e deslize para
        cima para conhecer a liga.
      </p>
    </section>
  );
}
