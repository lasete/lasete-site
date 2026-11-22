import { type RefObject } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import HeroScene, { type AsciiModel } from '@/components/hero/HeroScene';
import type { PointerState } from '@/lib/ascii-interaction';
import { Ascii404Fallback } from './Ascii404Fallback';

// This method exists in Three r186; the pinned DefinitelyTyped addon omits it.
declare module 'three/addons/math/MeshSurfaceSampler.js' {
  interface MeshSurfaceSampler {
    setRandomGenerator(random: () => number): this;
  }
}

function four() {
  const shape = new THREE.Shape();
  shape.moveTo(0.22, -1.35);
  shape.lineTo(0.22, -0.58);
  shape.lineTo(-1.02, -0.58);
  shape.lineTo(-1.02, -0.1);
  shape.lineTo(0.12, 1.35);
  shape.lineTo(0.78, 1.35);
  shape.lineTo(0.78, -0.1);
  shape.lineTo(1.08, -0.1);
  shape.lineTo(1.08, -0.58);
  shape.lineTo(0.78, -0.58);
  shape.lineTo(0.78, -1.35);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.45, -0.1);
  hole.lineTo(0.22, -0.1);
  hole.lineTo(0.22, 0.76);
  hole.closePath();
  shape.holes.push(hole);
  return shape;
}
function zero() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 0.99, 1.35, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 0.46, 0.84, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  return shape;
}
function makeErrorVolume() {
  let seed = 404;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const options = {
    depth: 0.6,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 28,
    steps: 1,
  };
  const shapes = [four(), zero()];
  const surfaces = shapes.map(
    (shape) => new THREE.ExtrudeGeometry(shape, options),
  );
  const material = new THREE.MeshBasicMaterial();
  const samplers = surfaces.map((surface) =>
    new MeshSurfaceSampler(new THREE.Mesh(surface, material))
      .setRandomGenerator(random)
      .build(),
  );
  const positions: number[] = [],
    normals: number[] = [],
    seeds: number[] = [],
    glyphs: number[] = [];
  const point = new THREE.Vector3(),
    normal = new THREE.Vector3();
  // Interleaving digits keeps all three present when the mobile particle budget is lower.
  for (let i = 0; i < 8400; i++) {
    const digit = i % 3;
    samplers[digit === 1 ? 1 : 0].sample(point, normal);
    positions.push(point.x + (digit - 1) * 2.63, point.y, point.z - 0.3);
    normals.push(normal.x, normal.y, normal.z);
    seeds.push(random());
    glyphs.push(Math.floor(random() * 16));
  }
  surfaces.forEach((surface) => surface.dispose());
  material.dispose();
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
  geometry.center();
  return geometry;
}
const model: AsciiModel = {
  makeGeometry: makeErrorVolume,
  fitPadding: 1.03,
  label: 'Número 404 em três dimensões composto apenas por caracteres ASCII',
  fallback: <Ascii404Fallback />,
};
export default function ErrorScene(props: {
  pointer: RefObject<PointerState>;
  visible: boolean;
  reduced: boolean;
}) {
  return <HeroScene {...props} model={model} />;
}
