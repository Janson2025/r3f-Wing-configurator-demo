// src/animation/Animator.jsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimationHub } from "./AnimationHub";
import { getPos, setPos, getRot, setRot } from "./axisMap";

export default function Animator() {
  const hub = useAnimationHub();
  const elapsed = useRef(0);

  // capture baselines for both position and rotation
  const base = useRef({
    pos: null,                // THREE.Vector3 clone
    rot: { x: 0, y: 0, z: 0 } // raw Euler components at baseline
  });

  useFrame((_, dt) => {
    elapsed.current += dt;

    const {
      planeBody,
      leftProp,
      rightProp,
      cockpitCase,
      leftRearDoorWindow,
      rearSideDoor,     // ← whole door group ("rear_side_door")
      noseHatchPivot,   // ← local pivot group ("nose_Empty")
      wings,
    } = hub.refs.current;

    // Baseline capture (once)
    if (planeBody && !base.current.pos) {
      base.current.pos = planeBody.position.clone();
      base.current.rot.x = planeBody.rotation.x;
      base.current.rot.y = planeBody.rotation.y;
      base.current.rot.z = planeBody.rotation.z;
    }

    // Propellers
    if (leftProp && rightProp) {
      const spin = 20 * dt;
      leftProp.rotation.z -= spin;
      rightProp.rotation.z += spin;
    }

    // --------- Rumble (Z-only) & Waggle (Y-only) with axis remap ---------
    if (!hub.isInteracting.current && planeBody && base.current.pos) {
      const t = elapsed.current;

      // Rumble: only Z translation
      setPos(planeBody, "x", getPos(base.current.pos, "x"));
      setPos(planeBody, "y", getPos(base.current.pos, "y"));
      const baseZ = getPos(base.current.pos, "z");
      const rumbleAmp = 0.02;
      setPos(planeBody, "z", baseZ + Math.sin(t * 16.3) * rumbleAmp);

      // Waggle: only Y rotation
      const period = 6.0;
      const phase = t % period;
      const baseY = base.current.rot.y;
      if (phase < 1.5) {
        const wig = 0.06 * Math.sin(phase * Math.PI * 3);
        setRot(planeBody, "y", baseY + wig);
      } else {
        const curY = getRot(planeBody, "y");
        setRot(planeBody, "y", curY + (baseY - curY) * 0.1);
      }
    } else if (planeBody && base.current.pos) {
      // While interacting: converge back to baseline (no rumble/waggle)
      setPos(planeBody, "x", getPos(base.current.pos, "x"));
      setPos(planeBody, "y", getPos(base.current.pos, "y"));
      const curZ = getPos(planeBody, "z");
      const baseZ = getPos(base.current.pos, "z");
      setPos(planeBody, "z", curZ + (baseZ - curZ) * 0.2);

      const curY = getRot(planeBody, "y");
      const baseY = base.current.rot.y;
      setRot(planeBody, "y", curY + (baseY - curY) * 0.2);
    }

    // ---------------- Hinges (call step() once per hinge) ----------------
    // Cockpit door: X axis; target is -90° (set in AnimationHub's useHinge)
    if (cockpitCase) {
      const aCockpit = hub.cockpitHinge.step(dt);
      setRot(cockpitCase, "x", aCockpit);
    }

    // Rear door: Y axis; apply to BOTH window and door group
    if (leftRearDoorWindow || rearSideDoor) {
      const aRear = hub.rearWindowHinge.step(dt);
      if (leftRearDoorWindow) setRot(leftRearDoorWindow, "y", aRear);
      if (rearSideDoor) setRot(rearSideDoor, "y", aRear);
    }

    // Nose hatch: rotate the local pivot group (nose_Empty) around Y
    if (noseHatchPivot) {
      const aNose = hub.noseHatchHinge.step(dt);
      setRot(noseHatchPivot, "y", aNose);
    }

    // Morph targets (unchanged)
    const names = Object.keys(hub.morphs.current);
    if (names.length && wings.left && wings.right) {
      const L = wings.left.morphTargetDictionary;
      const R = wings.right.morphTargetDictionary;
      const Li = wings.left.morphTargetInfluences;
      const Ri = wings.right.morphTargetInfluences;
      for (const name of names) {
        const v = hub.morphs.current[name] ?? 0;
        if (L && name in L) Li[L[name]] = v;
        if (R && name in R) Ri[R[name]] = v;
      }
    }
  });

  return null;
}
