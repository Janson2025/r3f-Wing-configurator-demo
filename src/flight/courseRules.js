import { Vector3 } from 'three';
import { flightPath } from './flightPath.js';

export const corridorRadius = 55;
export const corridorGraceSeconds = 4;
export const ringBonus = 100;

const up = new Vector3(0, 1, 0);

export const flightRings = [
  { progress: 0.19, side: 14, height: 3 },
  { progress: 0.42, side: -18, height: 6 },
  { progress: 0.68, side: 16, height: -5 },
].map(({ progress, side, height }) => {
  const normal = flightPath.getTangent(progress).normalize();
  const right = new Vector3().crossVectors(normal, up).normalize();
  const vertical = new Vector3().crossVectors(right, normal);
  const center = flightPath.getPoint(progress)
    .addScaledVector(right, side)
    .addScaledVector(vertical, height);
  return { center, normal, radius: 12 };
});

export function crossesRing(start, end, { center, normal, radius }, scratch) {
  const from = scratch.copy(start).sub(center).dot(normal);
  const to = scratch.copy(end).sub(center).dot(normal);
  if (from >= 0 || to < 0) return false;

  return scratch.copy(start).lerp(end, -from / (to - from))
    .distanceToSquared(center) <= radius ** 2;
}
