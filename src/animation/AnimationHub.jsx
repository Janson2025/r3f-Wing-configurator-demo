// src/animation/AnimationHub.jsx

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

function useHinge(
  initial = 0,
  target = Math.PI / 2,
  speed = 4
) {
  const [open, setOpen] = useState(false);
  const angle = useRef(initial);

  const step = (dt) => {
    const goal = open ? target : 0;
    const diff = goal - angle.current;

    const delta =
      Math.sign(diff) *
      Math.min(Math.abs(diff), speed * dt);

    angle.current += delta;

    return angle.current;
  };

  return {
    open,
    setOpen,
    toggle: () => setOpen((value) => !value),
    angle,
    step,
    target,
  };
}

const AnimationCtx = createContext(null);

export const useAnimationHub = () =>
  useContext(AnimationCtx);

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

    // New aircraft components
    frontEngine: null,
    controlStick: null,
    controlStickBone: null,
    controlPanelSlider: null,

    wings: {
      left: null,
      right: null,
    },
  });

  const cockpitHinge = useHinge();
  const rearWindowHinge = useHinge();
  const noseHatchHinge = useHinge();

  // Mutable data for the frame-based Animator.
  const morphs = useRef({});

  // Reactive data for React UI components.
  const [morphNames, setMorphNames] = useState([]);
  const [morphValues, setMorphValues] = useState({});
  const [isAircraftReady, setIsAircraftReady] =
    useState(false);

  const defaultMorphs = useRef({});

  const registerMorphTargets = useCallback(
    (leftWing, rightWing) => {
      if (!leftWing || !rightWing) {
        setMorphNames([]);
        setIsAircraftReady(false);
        return;
      }

      const leftDictionary =
        leftWing.morphTargetDictionary ?? {};

      const rightDictionary =
        rightWing.morphTargetDictionary ?? {};

      // Only include morphs supported by both wings.
      const names = Object.keys(leftDictionary).filter(
        (name) => name in rightDictionary
      );

      const defaults = Object.fromEntries(
        names.map((name) => [
          name,
          leftWing.morphTargetInfluences?.[
            leftDictionary[name]
          ] ?? 0,
        ])
      );

      defaultMorphs.current = defaults;

      const values = Object.fromEntries(
        names.map((name) => [
          name,
          morphs.current[name] ?? defaults[name],
        ])
      );

      morphs.current = values;

      setMorphNames(names);
      setMorphValues(values);
      setIsAircraftReady(true);
    },
    []
  );

  const setMorphValue = useCallback((name, value) => {
    if (!(name in morphs.current)) return;

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return;

    const safeValue = Math.min(
      1,
      Math.max(0, numericValue)
    );

    morphs.current[name] = safeValue;

    setMorphValues((previous) => ({
      ...previous,
      [name]: safeValue,
    }));
  }, []);

  const resetMorphValues = useCallback(() => {
    const values = { ...defaultMorphs.current };

    morphs.current = values;
    setMorphValues(values);
  }, []);

  const api = useMemo(
    () => ({
      refs,
      isInteracting,
      isAircraftReady,

      morphs,
      morphNames,
      morphValues,

      registerMorphTargets,
      setMorphValue,
      resetMorphValues,

      cockpitHinge,
      rearWindowHinge,
      noseHatchHinge,

      toggleCockpit: () => cockpitHinge.toggle(),

      toggleRearWindow: () =>
        rearWindowHinge.toggle(),

      toggleNoseHatch: () => noseHatchHinge.toggle(),
    }),
    [
      cockpitHinge,
      rearWindowHinge,
      noseHatchHinge,
      morphNames,
      morphValues,
      isAircraftReady,
      registerMorphTargets,
      setMorphValue,
      resetMorphValues,
    ]
  );

  return (
    <AnimationCtx.Provider value={api}>
      {children}
    </AnimationCtx.Provider>
  );
}