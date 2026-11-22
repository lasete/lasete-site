import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from 'react';
import { useReducedMotion } from './preferences';
// Estado do ponteiro compartilhado entre a interação e as cenas ASCII (cubo e 404).
export type PointerState = {
  x: number;
  y: number;
  hover: number;
  rx: number;
  ry: number;
  invalidate?: () => void;
};

export function useAsciiInteraction(
  initialRotation: readonly [number, number] = [0.34, Math.PI / 4],
  rotatable = true,
) {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({
    x: 0,
    y: 0,
    hover: 0,
    rx: initialRotation[0],
    ry: initialRotation[1],
  });
  const drag = useRef<{
    x: number;
    y: number;
    rx: number;
    ry: number;
  } | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
    },
    [],
  );
  const [visible, setVisible] = useState(true);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(element);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const reset = () => {
    pointer.current.rx = initialRotation[0];
    pointer.current.ry = initialRotation[1];
    pointer.current.hover = 0;
    pointer.current.invalidate?.();
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    if (event.pointerType === 'touch' && rotatable && !reduced) {
      // Keep a short tap alive long enough for the demand-driven renderer to register a hit.
      releaseTimer.current = setTimeout(() => {
        pointer.current.hover = 0;
        pointer.current.invalidate?.();
      }, 180);
    } else pointer.current.hover = 0;
    pointer.current.invalidate?.();
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const events = {
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        !rotatable ||
        !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(
          event.key,
        )
      )
        return;
      event.preventDefault();
      if (event.key === 'Home') reset();
      if (event.key === 'ArrowLeft') pointer.current.ry -= 0.16;
      if (event.key === 'ArrowRight') pointer.current.ry += 0.16;
      if (event.key === 'ArrowUp') pointer.current.rx -= 0.16;
      if (event.key === 'ArrowDown') pointer.current.rx += 0.16;
      pointer.current.invalidate?.();
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current.x =
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.current.y =
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      pointer.current.hover =
        reduced || (event.pointerType === 'touch' && !rotatable) ? 0 : 1;
      pointer.current.invalidate?.();
      if (drag.current) {
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        pointer.current.ry = drag.current.ry + dx * 0.007;
        pointer.current.rx = Math.max(
          -1.1,
          Math.min(1.1, drag.current.rx + dy * 0.005),
        );
        pointer.current.invalidate?.();
      }
    },
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (!rotatable || event.button !== 0 || !event.isPrimary) return;
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current.x =
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.current.y =
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      pointer.current.hover = reduced ? 0 : 1;
      pointer.current.invalidate?.();
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        rx: pointer.current.rx,
        ry: pointer.current.ry,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    },
    onPointerUp: release,
    onPointerCancel: release,
    onPointerLeave: () => {
      if (drag.current) return;
      pointer.current.hover = 0;
      pointer.current.invalidate?.();
    },
  };
  return { ref, pointer, visible, reduced, dragging, reset, events };
}
