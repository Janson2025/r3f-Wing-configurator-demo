// src/animation/Animator.jsx

import { useFrame } from "@react-three/fiber";

import { useAnimationHub } from "./AnimationHub";
import { setRot } from "./axisMap";

import { useFlight } from "../flight/FlightContext";
import { FLIGHT_CONFIG } from "../flight/flightConfig";

export default function Animator() {
  const hub = useAnimationHub();

  const {
    mode,
    status,
    telemetry,
  } = useFlight();

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    const {
      leftProp,
      rightProp,

      cockpitCase,
      leftRearDoorWindow,
      rearSideDoor,
      noseHatchPivot,

      wings,
    } = hub.refs.current;

    // -----------------------------------------
    // Propellers
    // -----------------------------------------

    const enginesRunning =
      mode === "flight" &&
      status === "flying";

    if (enginesRunning) {
      const idleSpeed = 5;

      const maximumSpeed =
        FLIGHT_CONFIG.propellerSpeed;

      const spinSpeed =
        idleSpeed +
        (maximumSpeed - idleSpeed) *
          telemetry.throttle;

      const spin = spinSpeed * dt;

      if (leftProp) {
        leftProp.rotation.z -= spin;
      }

      if (rightProp) {
        rightProp.rotation.z += spin;
      }
    }

    // -----------------------------------------
    // Cockpit hinge
    // -----------------------------------------

    if (cockpitCase) {
      const angle =
        hub.cockpitHinge.step(dt);

      setRot(
        cockpitCase,
        "x",
        angle
      );
    }

    // -----------------------------------------
    // Rear door hinge
    // -----------------------------------------

    if (leftRearDoorWindow || rearSideDoor) {
      const angle =
        hub.rearWindowHinge.step(dt);

      if (leftRearDoorWindow) {
        setRot(
          leftRearDoorWindow,
          "y",
          angle
        );
      }

      if (rearSideDoor) {
        setRot(
          rearSideDoor,
          "y",
          angle
        );
      }
    }

    // -----------------------------------------
    // Nose hatch hinge
    // -----------------------------------------

    if (noseHatchPivot) {
      const angle =
        hub.noseHatchHinge.step(dt);

      setRot(
        noseHatchPivot,
        "y",
        angle
      );
    }

    // -----------------------------------------
    // Wing morph targets
    // -----------------------------------------

    const morphs = hub.morphs.current;

    const names = Object.keys(morphs);

    if (wings.left && wings.right) {
      const leftDictionary =
        wings.left.morphTargetDictionary;

      const rightDictionary =
        wings.right.morphTargetDictionary;

      const leftInfluences =
        wings.left.morphTargetInfluences;

      const rightInfluences =
        wings.right.morphTargetInfluences;

      for (const name of names) {
        const value = morphs[name] ?? 0;

        if (
          leftDictionary &&
          leftInfluences &&
          name in leftDictionary
        ) {
          leftInfluences[
            leftDictionary[name]
          ] = value;
        }

        if (
          rightDictionary &&
          rightInfluences &&
          name in rightDictionary
        ) {
          rightInfluences[
            rightDictionary[name]
          ] = value;
        }
      }
    }
  });

  return null;
}