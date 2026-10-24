import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/preferences';

export function NetworkInterlude() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let previousFrame = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const slices = 64;
    const strands = 17;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(elapsed);
    };

    const draw = (time: number) => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);

      const span = width * 1.04;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(height * 0.46, 66);
      const rotation = reducedMotion ? 0 : (time / 8500) * Math.PI * 2;
      const positions = Array.from({ length: slices }, (_, slice) =>
        Array.from({ length: strands }, (_, strand) => {
          const progress = slice / (slices - 1);
          const axisX = (progress - 0.5) * span;
          const axisScreenX = centerX + axisX;
          const axisScreenY = centerY;
          const distance = pointer.active
            ? Math.hypot(axisScreenX - pointer.x, axisScreenY - pointer.y)
            : Infinity;
          const influence = Math.max(0, 1 - distance / 150);
          const phase =
            (strand / strands) * Math.PI * 2 +
            progress * Math.PI * 4 +
            rotation +
            Math.sin(slice * 0.37 + strand * 1.9) * 0.035 +
            influence * Math.sin(strand * 0.9 + progress * 5) * 0.16;
          const depth = Math.cos(phase);

          return {
            x: centerX + axisX + depth * radius * 0.18,
            y: centerY + Math.sin(phase) * radius,
            depth,
            influence,
          };
        }),
      );

      context.lineWidth = 0.75;
      for (let slice = 0; slice < slices; slice += 1) {
        for (let strand = 0; strand < strands; strand += 1) {
          const point = positions[slice][strand];
          const nextStrand = (strand + 1) % strands;

          context.fillStyle = `rgba(210, 225, 174, ${0.22 + (point.depth + 1) * 0.09 + point.influence * 0.28})`;
          context.beginPath();
          context.arc(
            point.x,
            point.y,
            (point.depth > 0.55 ? 1.25 : 0.85) + point.influence * 0.55,
            0,
            Math.PI * 2,
          );
          context.fill();

          if (slice < slices - 1) {
            const next = positions[slice + 1][strand];
            const alpha = 0.045 + (point.depth + 1) * 0.027 + point.influence * 0.11;
            context.strokeStyle = `rgba(151, 179, 113, ${alpha})`;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }

          if (slice % 3 === 0) {
            const next = positions[slice][nextStrand];
            const alpha = 0.035 + (point.depth + 1) * 0.018 + point.influence * 0.08;
            context.strokeStyle = `rgba(151, 179, 113, ${alpha})`;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }
        }
      }

    };

    const animate = (timestamp: number) => {
      if (previousFrame) elapsed += timestamp - previousFrame;
      previousFrame = timestamp;
      draw(elapsed);
      if (!reducedMotion && visible && !document.hidden)
        frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
    };

    const start = () => {
      if (!reducedMotion && visible && !document.hidden && !frame)
        frame = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = event.type !== 'pointerleave';
      if (reducedMotion && visible && !document.hidden && !frame) {
        frame = requestAnimationFrame(() => {
          draw(elapsed);
          frame = 0;
        });
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerleave', updatePointer);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('pointerleave', updatePointer);
      stop();
    };
  }, [reducedMotion]);

  return (
    <div className="network-interlude" aria-hidden="true">
      <canvas ref={canvasRef} className="network-interlude-canvas" />
    </div>
  );
}