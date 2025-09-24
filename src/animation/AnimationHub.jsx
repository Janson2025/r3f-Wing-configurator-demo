// src/animation/AnimationHub.jsx
import React, { createContext, useContext, useMemo, useRef, useState } from "react";

function useHinge(initial = 0, target = Math.PI / 2, speed = 4) {
  const [open, setOpen] = useState(false);
  const angle = useRef(initial);
  const step = (dt) => {
    const goal = open ? target : 0;
    const diff = goal - angle.current;
    const delta = Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
    angle.current += delta;
    return angle.current;
  };
  return { open, setOpen, toggle: () => setOpen((v) => !v), angle, step, target };
}

const AnimationCtx = createContext(null);
export const useAnimationHub = () => useContext(AnimationCtx);

export default function AnimationHub({ children }) {
  const isInteracting = useRef(false);
  const refs = useRef({
    planeBody: null,
    leftProp: null,
    rightProp: null,
    cockpitCase: null,
    leftRearDoorWindow: null,
    rearSideDoor: null,
    noseHatch: null,
    noseHatchPivot: null,
    wings: { left: null, right: null },
  });

  const cockpitHinge = useHinge(0, Math.PI / 2, 4);    // X axis (Animator applies axis)
  const rearWindowHinge = useHinge(0, Math.PI / 2, 4); // Y axis
  const noseHatchHinge = useHinge(0, Math.PI / 2, 4);  // Y axis

  const morphs = useRef({});
  const setMorphValue = (name, value) => { morphs.current[name] = value; };

  // IMPORTANT: include .open flags so context value changes -> consumers re-render
  const api = useMemo(() => ({
    refs,
    isInteracting,
    morphs,
    cockpitHinge,
    rearWindowHinge,
    noseHatchHinge,
    toggleCockpit: () => cockpitHinge.toggle(),
    toggleRearWindow: () => rearWindowHinge.toggle(),
    toggleNoseHatch: () => noseHatchHinge.toggle(),
    setMorphValue,
  }), [cockpitHinge.open, rearWindowHinge.open, noseHatchHinge.open]);

  return <AnimationCtx.Provider value={api}>{children}</AnimationCtx.Provider>;
}
