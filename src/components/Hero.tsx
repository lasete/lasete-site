/* THESIS: a marca é o único elemento da abertura; o conteúdo começa depois.
OWN-WORLD: preto neutro, caracteres brancos, espaço e tipografia de proporção normal.
STORY: explorar o símbolo, depois conhecer as pessoas e o trabalho da liga.
FIRST VIEWPORT: navbar e um volume cúbico ASCII central, sem textos sobrepostos, com Matrix discreta ao fundo.
FORM: composição explicitamente pedida na revisão; sem sorteio de direção. */
import { lazy, Suspense, useRef } from 'react';
import { useAsciiInteraction } from '@/lib/ascii-interaction';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Emblem } from './Brand';
const HeroScene = lazy(() => import('./HeroScene'));
gsap.registerPlugin(useGSAP, ScrollTrigger);
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const interaction = useAsciiInteraction();
  const { pointer, visible, reduced, dragging } = interaction;
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
      <a className="hero-scroll" href="#conheca">
        <span className="scroll-mark" aria-hidden="true">
          <span />
        </span>
        <span>Explore a LASETE</span>
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
