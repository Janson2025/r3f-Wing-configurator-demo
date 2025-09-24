// Central axis remapper so animation code can use logical x/y/z
// and we map to whatever the current model actually uses.

let MAP = { x: "x", y: "y", z: "z" }; // default: no remap

export function setAxisMap(newMap) {
  // e.g. setAxisMap({ y: "z", z: "y" }) to swap Y<->Z
  MAP = { ...MAP, ...newMap };
}

export function axisKey(axis /* 'x' | 'y' | 'z' */) {
  return MAP[axis];
}

export function getPos(obj /* {position} OR THREE.Object3D */, axis) {
  const k = axisKey(axis);
  const pos = obj.position ?? obj; // allow raw Vector3
  return pos[k];
}

export function setPos(obj /* THREE.Object3D */, axis, value) {
  obj.position[axisKey(axis)] = value;
}

export function getRot(obj /* THREE.Object3D */, axis) {
  return obj.rotation[axisKey(axis)];
}

export function setRot(obj /* THREE.Object3D */, axis, value) {
  obj.rotation[axisKey(axis)] = value;
}
