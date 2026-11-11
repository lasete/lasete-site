import {
  useMemo,
  useRef,
  useEffect,
  Component,
  type ReactNode,
  type RefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Emblem } from './Brand';
import {
  endIntro,
  introFrame,
  l7Starts,
  subscribeIntro,
  L7_SLANT,
  L7_SHIFT,
} from '@/lib/intro-l7';
export type PointerState = {
  x: number;
  y: number;
  hover: number;
  rx: number;
  ry: number;
  invalidate?: () => void;
};
export type AsciiModel = {
  makeGeometry: () => THREE.BufferGeometry;
  label: string;
  fallback: ReactNode;
  fitPadding?: number;
};
// A real six-face volume, rather than an extrusion of the flat logo silhouette.
// Gaps on the side faces reproduce the three characteristic cuts of the emblem.
function makeVolume() {
  const positions: number[] = [],
    normals: number[] = [],
    seeds: number[] = [],
    glyphs: number[] = [];
  let seed = 714;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const steps = 39,
    half = 1.18,
    radius = 0.13;
  const p = new THREE.Vector3(),
    inner = new THREE.Vector3(),
    normal = new THREE.Vector3();
  for (let face = 0; face < 6; face++) {
    for (let a = 0; a < steps; a++)
      for (let b = 0; b < steps; b++) {
        const u =
          (((a + (a > 0 && a < steps - 1 ? (random() - 0.5) * 0.34 : 0)) /
            (steps - 1)) *
            2 -
            1) *
          half;
        const v =
          (((b + (b > 0 && b < steps - 1 ? (random() - 0.5) * 0.34 : 0)) /
            (steps - 1)) *
            2 -
            1) *
          half;
        if (face < 2) p.set((face === 0 ? 1 : -1) * half, u, v);
        else if (face < 4) p.set(u, (face === 2 ? 1 : -1) * half, v);
        else p.set(u, v, (face === 4 ? 1 : -1) * half);
        // The logo's upper side slits and central vertical slit remain empty air.
        const side = face < 2 || face > 3;
        const along = face < 2 ? p.z : p.x;
        if (side && Math.abs(p.y - 0.84) < 0.068 && Math.abs(along) < 0.91)
          continue;
        if (p.y > -0.96 && p.y < 0.42 && side && Math.abs(along) > 1.045)
          continue;
        inner.copy(p).clampScalar(-half + radius, half - radius);
        normal.copy(p).sub(inner).normalize();
        p.copy(inner).addScaledVector(
          normal,
          radius + (random() - 0.5) * 0.025,
        );
        const taper = 1 - 0.13 * ((half - p.y) / (2 * half));
        p.x *= taper;
        p.z *= taper;
        p.y *= 1.06;
        positions.push(p.x, p.y, p.z);
        normals.push(normal.x, normal.y, normal.z);
        seeds.push(random());
        glyphs.push(Math.floor(random() * 16));
      }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    'aNormal',
    new THREE.Float32BufferAttribute(normals, 3),
  );
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute('aGlyph', new THREE.Float32BufferAttribute(glyphs, 1));
  // Ponto de partida de cada caractere no monograma L7 da abertura.
  const intro = l7Starts(seeds.length, random);
  geometry.setAttribute('aStart', new THREE.BufferAttribute(intro.start, 3));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(intro.side, 1));
  geometry.setAttribute('aShow', new THREE.BufferAttribute(intro.show, 1));
  return geometry;
}
function glyphAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.font = '400 38px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [...'01<>/{}[]#*+=:;@'].forEach((char, i) =>
    ctx.fillText(char, i * 48 + 24, 25),
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
const vertexShader = `
attribute vec3 aNormal; attribute float aSeed; attribute float aGlyph;
attribute vec3 aStart; attribute float aSide; attribute float aShow;
uniform vec4 uHits[6]; uniform float uSize;
uniform float uMorph; uniform float uSplit; uniform float uApart; uniform float uFade;
varying float vGlyph; varying float vLight; varying float vFacing; varying float vAlpha;
void main() {
  // Abertura: uSplit 1 = monograma L7, 0 = moldura; uApart 1 = L e 7 afastados;
  // uMorph 0 = plano, 1 = volume. Em repouso (uMorph 1, uFade 1, resto 0) nada muda.
  float local = clamp(uMorph * 2.2 - aSeed * 1.2, 0.0, 1.0);
  float formed = local * local * (3.0 - 2.0 * local);
  vec3 scatter = vec3(sin(aSeed*93.0),cos(aSeed*47.0),sin(aSeed*71.0));
  vec3 origin = aStart + vec3(${L7_SLANT.toFixed(2)}, 1.0, 0.0) * (aSide * uSplit * ${L7_SHIFT.toFixed(2)});
  origin.y += aSide * uApart * 0.7;
  vec3 base = mix(origin, position, formed) + scatter * sin(local * 3.14159) * (.18 + aSeed * .3);
  vec3 surface = normalize(mix(vec3(0.0, 0.0, 1.0), aNormal, formed) + vec3(0.0, 0.0, .0001));
  vAlpha = uFade * mix(aShow, 1.0, smoothstep(.05, .45, local));
  vec3 shift = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    vec3 delta = position - uHits[i].xyz;
    float strength = exp(-dot(delta, delta) * 10.0) * uHits[i].w;
    vec3 direction = normalize(delta + aNormal * .13 + vec3(sin(aSeed*93.0),cos(aSeed*47.0),sin(aSeed*71.0))*.07);
    shift += direction * strength * (.42 + aSeed*.28);
  }
  shift = shift / max(1.0, length(shift) / .85);
  vec4 view = modelViewMatrix * vec4(base + shift, 1.0);
  vec3 n = normalize(normalMatrix * surface);
  vFacing = smoothstep(-.08, .12, dot(n, normalize(-view.xyz)));
  vLight = .56 + .44 * max(dot(n, normalize(vec3(-.35,.8,1.0))),0.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = clamp(uSize * (6.8 / -view.z), 3.0, 24.0);
  vGlyph = aGlyph;
}`;
const fragmentShader = `
uniform sampler2D uAtlas; varying float vGlyph; varying float vLight; varying float vFacing; varying float vAlpha;
void main() {
  vec2 uv = vec2((gl_PointCoord.x + floor(vGlyph))/16.0, 1.0-gl_PointCoord.y);
  float alpha = texture2D(uAtlas, uv).a * vFacing * vAlpha;
  if (alpha < .07) discard;
  gl_FragColor = vec4(vec3(vLight), alpha);
}`;
function Symbol({
  pointer,
  reduced,
  model,
}: {
  pointer: RefObject<PointerState>;
  reduced: boolean;
  model?: AsciiModel;
}) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { camera, raycaster, invalidate, size } = useThree();
  useEffect(() => {
    if (model) {
      invalidate();
      return;
    }
    camera.position.z = Math.max(
      7.1,
      7.1 / ((size.width / size.height) * 1.15),
    );
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate, model]);
  const geometry = useMemo(() => {
    const value = model ? model.makeGeometry() : makeVolume();
    value.computeBoundingBox();
    return value;
  }, [model]);
  useEffect(() => {
    if (model) {
      geometry.setDrawRange(
        0,
        Math.min(
          geometry.getAttribute('position').count,
          Math.max(2400, Math.round((size.width * size.height) / 60)),
        ),
      );
      invalidate();
    }
  }, [geometry, model, size.width, size.height, invalidate]);
  const atlas = useMemo(glyphAtlas, []);
  const uniforms = useMemo(
    () => ({
      uAtlas: { value: atlas },
      uHits: {
        value: Array.from(
          { length: 6 },
          () => new THREE.Vector4(50, 50, 50, 0),
        ),
      },
      uSize: { value: 10 },
      uMorph: { value: 1 },
      uSplit: { value: 0 },
      uApart: { value: 0 },
      uFade: { value: 1 },
    }),
    [atlas],
  );
  const math = useMemo(
    () => ({
      inverse: new THREE.Matrix4(),
      ray: new THREE.Ray(),
      bounds: model
        ? geometry.boundingBox!.clone()
        : new THREE.Box3(
            new THREE.Vector3(-1.18, -1.25, -1.18),
            new THREE.Vector3(1.18, 1.25, 1.18),
          ),
      framing: new THREE.Box3(),
      cursor: new THREE.Vector2(),
      hit: new THREE.Vector3(),
      previous: new THREE.Vector3(50, 50, 50),
      lastTrail: 0,
      index: 1,
    }),
    [geometry, model],
  );
  useEffect(() => {
    pointer.current.invalidate = invalidate;
    invalidate();
    return () => {
      delete pointer.current.invalidate;
    };
  }, [pointer, invalidate]);
  useEffect(() => {
    if (reduced) endIntro();
    invalidate();
  }, [reduced, invalidate]);
  // Pular a abertura precisa de um quadro novo para o cubo assumir a forma final.
  useEffect(() => subscribeIntro(() => invalidate()), [invalidate]);
  useEffect(
    () => () => {
      geometry.dispose();
      atlas.dispose();
    },
    [geometry, atlas],
  );
  useFrame((state, frameDelta) => {
    if (!group.current) return;
    const delta = Math.min(frameDelta, 0.05),
      p = pointer.current;
    const time = reduced ? 0 : state.clock.elapsedTime;
    const x = p.rx;
    const y = p.ry;
    // Só o cubo da hero tem abertura; os outros modelos ASCII seguem como estão.
    const intro = model ? null : introFrame(performance.now());
    // O fiber copia os uniforms para o material; valores numéricos são escritos direto nele.
    const live = material.current?.uniforms;
    if (live) {
      live.uMorph.value = intro ? intro.morph : 1;
      live.uSplit.value = intro ? intro.split : 0;
      live.uApart.value = intro ? intro.apart : 0;
      live.uFade.value = intro ? intro.fade : 1;
    }
    if (intro) {
      // O monograma começa de frente e gira até o ângulo da hero enquanto vira volume.
      group.current.rotation.x = x * intro.turn;
      group.current.rotation.y = y * intro.turn;
    } else {
      group.current.rotation.x = reduced
        ? x
        : THREE.MathUtils.damp(group.current.rotation.x, x, 15, delta);
      group.current.rotation.y = reduced
        ? y
        : THREE.MathUtils.damp(group.current.rotation.y, y, 15, delta);
    }
    group.current.updateMatrixWorld();
    let framing = false;
    if (model) {
      // Fit the rotated word, including its depth, instead of clipping it on a turn.
      const box = math.framing
        .copy(math.bounds)
        .applyMatrix4(group.current.matrixWorld);
      const halfWidth = Math.max(Math.abs(box.min.x), Math.abs(box.max.x));
      const halfHeight = Math.max(Math.abs(box.min.y), Math.abs(box.max.y));
      const tangent = Math.tan((38 * Math.PI) / 360);
      const distance =
        Math.max(
          halfHeight / tangent,
          halfWidth / ((tangent * size.width) / size.height),
        ) *
          (model.fitPadding ?? 1.16) +
        Math.max(0, box.max.z);
      camera.position.z = reduced
        ? distance
        : THREE.MathUtils.damp(camera.position.z, distance, 15, delta);
      camera.updateMatrixWorld();
      framing = Math.abs(camera.position.z - distance) > 0.001;
    }
    for (let i = 0; i < 6; i++)
      uniforms.uHits.value[i].w = reduced
        ? 0
        : uniforms.uHits.value[i].w * Math.exp(-delta * (i === 0 ? 13 : 5));
    let hitting = false;
    if (!reduced && p.hover && !intro) {
      math.cursor.set(p.x, p.y);
      raycaster.setFromCamera(math.cursor, camera);
      math.inverse.copy(group.current.matrixWorld).invert();
      math.ray.copy(raycaster.ray).applyMatrix4(math.inverse);
      if (math.ray.intersectBox(math.bounds, math.hit)) {
        hitting = true;
        uniforms.uHits.value[0].set(math.hit.x, math.hit.y, math.hit.z, 1);
        if (
          math.previous.distanceToSquared(math.hit) > 0.018 &&
          time - math.lastTrail > 0.035
        ) {
          uniforms.uHits.value[math.index].set(
            math.hit.x,
            math.hit.y,
            math.hit.z,
            0.42,
          );
          math.index = math.index === 5 ? 1 : math.index + 1;
          math.previous.copy(math.hit);
          math.lastTrail = time;
        }
      }
    }
    uniforms.uSize.value =
      10.2 *
      state.gl.getPixelRatio() *
      Math.min(1.15, Math.max(0.72, state.size.height / 720));
    if (intro) invalidate();
    if (
      !reduced &&
      ((uniforms.uHits.value[0].w > 0.001 && !hitting) ||
        uniforms.uHits.value.slice(1).some((hit) => hit.w > 0.001) ||
        Math.abs(group.current.rotation.x - x) > 0.0001 ||
        Math.abs(group.current.rotation.y - y) > 0.0001 ||
        framing)
    )
      invalidate();
  });
  return (
    <group ref={group} rotation={[pointer.current.rx, pointer.current.ry, 0]}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Sem WebGL não há abertura: o emblema estático aparece direto.
    endIntro();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function HeroScene({
  pointer,
  visible,
  reduced,
  model,
}: {
  pointer: RefObject<PointerState>;
  visible: boolean;
  reduced: boolean;
  model?: AsciiModel;
}) {
  const fallback = model?.fallback ?? (
    <div className="scene-fallback">
      <Emblem />
    </div>
  );
  return (
    <SceneBoundary fallback={fallback}>
      <Canvas
        camera={{ position: [0, 0, 7.1], fov: 38 }}
        dpr={[1, 1.35]}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        frameloop={visible ? 'demand' : 'never'}
        fallback={fallback}
        role="img"
        aria-label={
          model?.label ??
          'Volume da LASETE composto apenas por caracteres ASCII'
        }
      >
        <Symbol pointer={pointer} reduced={reduced} model={model} />
      </Canvas>
    </SceneBoundary>
  );
}
