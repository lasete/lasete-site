import { useEffect, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/preferences';
const smooth = (start: number, end: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
// One persistent rain field. Page regions only mask its intensity; they never restart it.
export function Matrix({
  route,
  intensity = 1,
  fullPage = false,
  immersiveIntro = false,
}: {
  route: string;
  intensity?: number;
  fullPage?: boolean;
  immersiveIntro?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const zones = useRef<HTMLElement[]>([]);
  const wake = useRef<(() => void) | null>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const refresh = () => {
      zones.current = Array.from(
        document.querySelectorAll<HTMLElement>('[data-matrix]'),
      );
      wake.current?.();
    };
    refresh();
    // Lazy routes can commit their ambient region after this layout effect.
    const observer = new MutationObserver((records) => {
      if (
        records.some((record) =>
          [...record.addedNodes, ...record.removedNodes].some(
            (node) =>
              node instanceof Element &&
              (node.matches('[data-matrix]') ||
                !!node.querySelector('[data-matrix]')),
          ),
        )
      )
        refresh();
    });
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [route]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const field = document.createElement('canvas'),
      rain = field.getContext('2d');
    if (!rain) return;
    let raf = 0,
      last = 0,
      painted = false;
    let drops: number[] = [];
    const resize = () => {
      const width = Math.round(window.innerWidth),
        height = Math.round(window.innerHeight);
      canvas.width = field.width = width;
      canvas.height = field.height = height;
      drops = Array.from(
        { length: Math.ceil(width / 30) },
        () => (Math.random() * height) / 18,
      );
      rain.fillStyle = '#000000';
      rain.fillRect(0, 0, width, height);
      if (fullPage || immersiveIntro) {
        rain.font = '13px monospace';
        drops.forEach((y, i) => {
          for (let tail = 0; tail < 8; tail++) {
            rain.fillStyle = `rgba(220,220,220,${0.48 * (1 - tail / 8)})`;
            rain.fillText(
              Math.random() > 0.5 ? '1' : '0',
              i * 30,
              (y - tail) * 18,
            );
          }
        });
      }
      painted = false;
    };
    const profile = () => {
      const hero = zones.current
        .find((zone) => zone.dataset.matrix === 'hero')
        ?.getBoundingClientRect();
      const continuation = zones.current
        .find((zone) => zone.dataset.matrix === 'continuation')
        ?.getBoundingClientRect();
      const intros = zones.current
        .filter((zone) => zone.dataset.matrix === 'intro')
        .map((zone) => {
          const bounds = zone.getBoundingClientRect();
          const next = zone.nextElementSibling?.getBoundingClientRect();
          const end =
            immersiveIntro && next
              ? Math.min(
                  next.bottom,
                  next.top + Math.min(520, window.innerHeight * 0.65),
                )
              : bounds.bottom;
          return { top: bounds.top, bottom: end };
        });
      return (y: number) => {
        let alpha = fullPage ? 0.72 * smooth(60, 120, y) : 0;
        if (hero) {
          const bottom = continuation?.bottom ?? hero.bottom;
          if (y >= hero.top && y <= bottom) {
            const lower = smooth(hero.bottom - 180, hero.bottom + 220, y);
            alpha =
              (0.76 - 0.54 * lower) *
              smooth(hero.top + 76, hero.top + 180, y) *
              (1 - smooth(bottom - 180, bottom, y));
          }
        }
        for (const intro of intros) {
          const intensity =
            (immersiveIntro ? 0.8 : 0.32) *
            smooth(
              intro.top + (immersiveIntro ? 12 : 76),
              intro.top + (immersiveIntro ? 96 : 176),
              y,
            ) *
            (1 -
              smooth(
                intro.bottom - (immersiveIntro ? 280 : 140),
                intro.bottom + (immersiveIntro ? 0 : 20),
                y,
              ));
          alpha = Math.max(alpha, intensity);
        }
        return alpha;
      };
    };
    const draw = (time: number) => {
      raf = 0;
      if (document.hidden) return;
      const alphaAt = profile();
      const samples = Array.from({ length: 33 }, (_, i) =>
        Math.min(1, alphaAt((canvas.height * i) / 32) * intensity),
      );
      if (!samples.some((alpha) => alpha > 0.002)) {
        if (painted) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          painted = false;
        }
        return;
      }
      raf = requestAnimationFrame(draw);
      if (time - last < 65) return;
      last = time;
      rain.fillStyle = 'rgba(0,0,0,.12)';
      rain.fillRect(0, 0, field.width, field.height);
      rain.font =
        fullPage || immersiveIntro ? '13px monospace' : '12px monospace';
      drops.forEach((y, i) => {
        rain.fillStyle =
          fullPage || immersiveIntro
            ? i % 6 === 0
              ? 'rgba(240,240,240,.7)'
              : 'rgba(195,195,195,.46)'
            : i % 6 === 0
              ? 'rgba(230,230,230,.38)'
              : 'rgba(170,170,170,.24)';
        rain.fillText(Math.random() > 0.5 ? '1' : '0', i * 30, y * 18);
        drops[i] =
          y * 18 > field.height && Math.random() > 0.975
            ? -Math.random() * 20
            : y + 0.28;
      });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(field, 0, 0);
      const mask = ctx.createLinearGradient(0, 0, 0, canvas.height);
      samples.forEach((alpha, i) =>
        mask.addColorStop(i / 32, `rgba(255,255,255,${alpha})`),
      );
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = mask;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      painted = true;
    };
    const start = () => {
      if (!document.hidden && !raf) raf = requestAnimationFrame(draw);
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else start();
    };
    const onResize = () => {
      resize();
      start();
    };
    resize();
    wake.current = start;
    start();
    window.addEventListener('scroll', start, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(raf);
      wake.current = null;
      window.removeEventListener('scroll', start);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [reduced, intensity, fullPage, immersiveIntro]);
  return reduced ? null : (
    <canvas ref={ref} className="matrix-canvas" aria-hidden="true" />
  );
}
