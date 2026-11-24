// src/flight/FlightCamera.jsx

import { useMemo, useRef } from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  Vector3,
  Quaternion,
  MathUtils,
} from "three";

import { useFlight } from "./FlightContext";
import { FLIGHT_CONFIG } from "./flightConfig";

export default function FlightCamera() {
  const { camera } = useThree();

  const {
    aircraftRef,
    cameraMode,
  } = useFlight();

  const previousMode = useRef(null);

  const temp = useMemo(
    () => ({
      worldPosition: new Vector3(),
      worldRotation: new Quaternion(),

      headingRotation: new Quaternion(),
      forward: new Vector3(),
      worldUp: new Vector3(0, 1, 0),

      desiredPosition: new Vector3(),
      desiredTarget: new Vector3(),

      desiredUp: new Vector3(),
    }),
    []
  );

  useFrame((_, delta) => {
    const aircraft = aircraftRef.current;

    if (!aircraft) return;

    aircraft.updateWorldMatrix(true, false);

    aircraft.getWorldPosition(
      temp.worldPosition
    );

    aircraft.getWorldQuaternion(
      temp.worldRotation
    );

    const settings =
      FLIGHT_CONFIG.camera[cameraMode];

    if (!settings) return;

    // Extract horizontal heading.
    temp.forward
      .set(0, 0, 1)
      .applyQuaternion(temp.worldRotation);

    const heading = Math.atan2(
      temp.forward.x,
      temp.forward.z
    );

    temp.headingRotation.setFromAxisAngle(
      temp.worldUp,
      heading
    );

    // Cockpit follows every aircraft rotation.
    // External camera follows heading only.
    const rotation =
      cameraMode === "cockpit"
        ? temp.worldRotation
        : temp.headingRotation;

    temp.desiredPosition
      .fromArray(settings.position)
      .applyQuaternion(rotation)
      .add(temp.worldPosition);

    temp.desiredTarget
      .fromArray(settings.target)
      .applyQuaternion(rotation)
      .add(temp.worldPosition);

    temp.desiredUp.set(0, 1, 0);

    if (cameraMode === "cockpit") {
      temp.desiredUp.applyQuaternion(
        temp.worldRotation
      );
    }

    const switched =
      previousMode.current !== cameraMode;

    const smoothing =
      1 -
      Math.exp(
        -FLIGHT_CONFIG.camera.response *
        Math.min(delta, 0.05)
      );

    if (switched || cameraMode === "cockpit") {
      camera.position.copy(
        temp.desiredPosition
      );
    } else {
      camera.position.lerp(
        temp.desiredPosition,
        smoothing
      );
    }

    camera.up.copy(temp.desiredUp);

    // Always focus on the aircraft's current position,
    // avoiding framing lag during rapid maneuvers.
    camera.lookAt(temp.desiredTarget);

    const nextFov = switched
      ? settings.fov
      : MathUtils.lerp(
          camera.fov,
          settings.fov,
          smoothing
        );

    if (
      Math.abs(camera.fov - nextFov) > 0.001
    ) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }

    previousMode.current = cameraMode;
  }, -1);

  return null;
}