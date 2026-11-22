import { lazy, Suspense } from 'react';
import { useAsciiInteraction } from '@/lib/ascii-interaction';
import { useMediaQuery } from '@/lib/preferences';
import { Ascii404Fallback } from './Ascii404Fallback';
const ErrorScene = lazy(() => import('./ErrorScene'));
const initialRotation = [0.06, -0.12] as const;
export function Ascii404() {
  const interaction = useAsciiInteraction(initialRotation, false);
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  return (
    <div className="ascii-404">
      <div
        ref={interaction.ref}
        className="ascii-404-object"
        role="img"
        aria-label="404 em três dimensões feito de caracteres ASCII"
        {...interaction.events}
      >
        <Suspense fallback={<Ascii404Fallback />}>
          <ErrorScene
            pointer={interaction.pointer}
            visible={interaction.visible}
            reduced={interaction.reduced}
          />
        </Suspense>
      </div>
      {finePointer && !interaction.reduced && (
        <p className="ascii-404-hint">
          Passe o mouse para dispersar os caracteres.
        </p>
      )}
    </div>
  );
}
