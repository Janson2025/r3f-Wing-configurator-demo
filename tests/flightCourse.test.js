import assert from 'node:assert/strict';
import test from 'node:test';
import { Vector3 } from 'three';
import { crossesRing, flightRings } from '../src/flight/courseRules.js';

test('a forward segment through each ring opening earns the crossing', () => {
  for (const ring of flightRings) {
    const start = ring.center.clone().addScaledVector(ring.normal, -2);
    const end = ring.center.clone().addScaledVector(ring.normal, 2);
    const scratch = new Vector3();

    assert.equal(crossesRing(start, end, ring, scratch), true);
    assert.equal(crossesRing(end, start, ring, scratch), false);
    assert.equal(crossesRing(start, start, ring, scratch), false);
  }
});

test('crossing the plane outside the opening does not count', () => {
  const ring = flightRings[0];
  const edge = new Vector3().crossVectors(ring.normal, new Vector3(0, 1, 0))
    .setLength(ring.radius + 1).add(ring.center);
  const start = edge.clone().addScaledVector(ring.normal, -2);
  const end = edge.clone().addScaledVector(ring.normal, 2);

  assert.equal(crossesRing(start, end, ring, new Vector3()), false);
});
