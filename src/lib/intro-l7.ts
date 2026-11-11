// Abertura da Home: os caracteres do monograma "L7" viram o cubo da hero.
// Duas versões em avaliação, escolhidas por ?intro= na URL:
//   moldura (padrão): começa no L7; o 7 sobe e o L desce até fecharem uma moldura, que vira o cubo.
//   encaixe: o L e o 7 chegam separados, travam no L7, e o L7 vira o cubo.
// 'wait' cobre o carregamento da cena, 'play' anima, 'name' mostra "Lasete".
export type IntroStage = 'off' | 'wait' | 'play' | 'name';

export type IntroVariant = 'moldura' | 'encaixe';
// Linha do tempo de cada versão, em segundos a partir do primeiro quadro da cena.
// "join" é o movimento das letras: alinhar na moldura ou chegar e travar no L7.
const LEAD = 0.12;
const FADE = 0.35;
const TIMELINES = {
  moldura: {
    joinStart: 0.65,
    joinEnd: 1.35,
    morphStart: 1.55,
    morphEnd: 2.7,
    name: 2.6,
    end: 3.6,
  },
  encaixe: {
    joinStart: 0.25,
    joinEnd: 1.05,
    morphStart: 1.3,
    morphEnd: 2.45,
    name: 2.35,
    end: 3.35,
  },
};
let variant: IntroVariant = 'moldura';
// Sem a cena (rede lenta, erro), a tela preta não pode prender o visitante.
const WAIT_LIMIT = 12000;
const REVEAL_TIME = 900;

let stage: IntroStage = 'off';
let startedAt = 0;
let waitTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function setStage(next: IntroStage) {
  if (stage === next) return;
  stage = next;
  const root = document.documentElement;
  if (next === 'off') delete root.dataset.intro;
  else root.dataset.intro = next;
  listeners.forEach((notify) => notify());
}
function skip(event: Event) {
  // O gesto que pula a abertura não deve também rolar a página.
  if (event.type === 'wheel') event.preventDefault();
  endIntro();
}
const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

// Chamado antes do primeiro render: só carregamentos que caem direto na Home tocam a abertura.
export function armIntro() {
  if (typeof window === 'undefined' || stage !== 'off') return;
  if (window.location.pathname !== '/' || window.location.hash) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (new URLSearchParams(window.location.search).get('intro') === 'encaixe')
    variant = 'encaixe';
  setStage('wait');
  skipEvents.forEach((type) =>
    window.addEventListener(type, skip, { capture: true, passive: false }),
  );
  waitTimer = setTimeout(() => {
    if (stage === 'wait') endIntro();
  }, WAIT_LIMIT);
}
export function endIntro() {
  if (stage === 'off') return;
  skipEvents.forEach((type) =>
    window.removeEventListener(type, skip, { capture: true }),
  );
  if (waitTimer) clearTimeout(waitTimer);
  waitTimer = null;
  setStage('off');
  // Marca curta para o CSS trazer navbar, Matrix e conteúdo de volta com suavidade.
  const root = document.documentElement;
  root.dataset.introDone = '';
  setTimeout(() => delete root.dataset.introDone, REVEAL_TIME);
}
export function introStage() {
  return stage;
}
export function subscribeIntro(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

const range = (value: number, start: number, end: number) =>
  Math.min(1, Math.max(0, (value - start) / (end - start)));
const easeOutBack = (t: number) => {
  const s = 1.4;
  return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
};
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

// Estado da animação para o quadro atual; null quando a abertura não está ativa.
export function introFrame(now: number) {
  if (stage === 'off') return null;
  if (stage === 'wait') {
    startedAt = now + LEAD * 1000;
    setStage('play');
  }
  const timeline = TIMELINES[variant];
  const t = Math.max(0, (now - startedAt) / 1000);
  if (t >= timeline.end) {
    endIntro();
    return null;
  }
  if (t >= timeline.name && stage === 'play') setStage('name');
  const morph = range(t, timeline.morphStart, timeline.morphEnd);
  // 1 no início, 0 no fim; passa levemente de 0 para dar o tranco do encaixe.
  const join = 1 - easeOutBack(range(t, timeline.joinStart, timeline.joinEnd));
  return {
    fade: range(t, 0, FADE),
    // split: 1 = monograma L7, 0 = moldura. apart: 1 = L acima e 7 abaixo do monograma.
    split: variant === 'moldura' ? join : 1,
    apart: variant === 'encaixe' ? join : 0,
    morph,
    turn: easeInOut(morph),
  };
}

// Moldura final em coordenadas retas [x0, x1, y0, y1, lado]; a inclinação entra depois.
// O L é o lado esquerdo e a base; o 7 é o topo e o lado direito. lado +1 = L, -1 = 7.
const STROKES: readonly (readonly [number, number, number, number, number])[] =
  [
    [-0.95, -0.65, -0.87, 0.87, 1],
    [-0.65, 0.53, -0.87, -0.57, 1],
    [-0.53, 0.95, 0.57, 0.87, -1],
    [0.65, 0.95, -0.87, 0.57, -1],
  ];
// Inclinação dos traços e quanto cada letra desliza, na própria inclinação, entre o
// monograma (cabeça do 7 sobre a perna do L) e a moldura. O shader usa os mesmos valores.
export const L7_SLANT = 0.5;
export const L7_SHIFT = 0.51;
const SPACING = 0.05;

// Dá a cada caractere do cubo um ponto de partida na moldura do L7. Só uma parte fica visível no
// monograma (uma malha legível); o restante nasce dos traços durante a transformação.
export function l7Starts(count: number, random: () => number) {
  const grid: number[] = [];
  for (const [x0, x1, y0, y1, side] of STROKES) {
    const columns = Math.round((x1 - x0) / SPACING),
      rows = Math.round((y1 - y0) / SPACING);
    for (let column = 0; column < columns; column++)
      for (let row = 0; row < rows; row++) {
        const x =
          x0 + ((column + 0.5 + (random() - 0.5) * 0.3) / columns) * (x1 - x0);
        const y =
          y0 + ((row + 0.5 + (random() - 0.5) * 0.3) / rows) * (y1 - y0);
        grid.push(x + L7_SLANT * y, y, side);
      }
  }
  const points = grid.length / 3;
  const order = Array.from({ length: count }, (_, index) => index);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const start = new Float32Array(count * 3),
    side = new Float32Array(count),
    show = new Float32Array(count);
  order.forEach((particle, n) => {
    const point = (n < points ? n : Math.floor(random() * points)) * 3;
    start[particle * 3] = grid[point];
    start[particle * 3 + 1] = grid[point + 1];
    side[particle] = grid[point + 2];
    show[particle] = n < points ? 1 : 0;
  });
  return { start, side, show };
}
