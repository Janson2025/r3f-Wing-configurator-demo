// src/flight/FlightAircraft.jsx

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  Vector3,
  Quaternion,
  Matrix4,
  MathUtils,
} from "three";

import { TwinStar } from "../model/twinstar/TwinStar";

import { useFlight } from "./FlightContext";
import { FLIGHT_CONFIG as config } from "./flightConfig";
import useFlightInput from "./useFlightInput";

import {
  calculateSpeed,
  updateThrottle,
  updateControlSurface,
  constrainOffsets,
  getCorridorScale,
} from "./flightDynamics";

import {
  flightPath,
  flightPathLength,
} from "./flightPath";

function createFlightState() {
  return {
    distance: 0,
    elapsedTime: 0,

    speed: config.initialSpeed,
    throttle: config.initialThrottle,

    lateralOffset: 0,
    verticalOffset: 0,

    lateralVelocity: 0,
    verticalVelocity: 0,

    // Virtual control surface positions
    controls: {
      pitch: 0,
      roll: 0,
      yaw: 0,
    },

    // Aircraft rotation
    pitch: 0,
    bank: 0,
    yaw: 0,

    uiTimer: 0,
    initialized: false,
  };
}

export default function FlightAircraft() {
  const {
    aircraftRef,
    status,
    setProgress,
    setTelemetry,
    completeFlight,
  } = useFlight();

  const readInput = useFlightInput(
    status === "flying"
  );

  const flight = useRef(createFlightState());

  const temp = useMemo(
    () => ({
      pathPosition: new Vector3(),
      position: new Vector3(),

      tangent: new Vector3(),
      aheadTangent: new Vector3(),

      right: new Vector3(),
      up: new Vector3(),

      worldUp: new Vector3(0, 1, 0),

      target: new Vector3(),
      cross: new Vector3(),

      pitchAxis: new Vector3(1, 0, 0),
      yawAxis: new Vector3(0, 1, 0),
      bankAxis: new Vector3(0, 0, 1),

      rotationMatrix: new Matrix4(),

      targetRotation: new Quaternion(),

      pitchRotation: new Quaternion(),
      yawRotation: new Quaternion(),
      bankRotation: new Quaternion(),
    }),
    []
  );

  useFrame((_, delta) => {
    const aircraft = aircraftRef.current;

    if (!aircraft || status !== "flying") {
      return;
    }

    const state = flight.current;
    const dt = Math.min(delta, 0.05);

    if (dt <= 0) return;

    state.elapsedTime += dt;

    // ---------------------------------------
    // 1. Read flight controls
    // ---------------------------------------

    const input = readInput();

    state.controls.pitch = updateControlSurface(
      state.controls.pitch,
      input.pitch,
      dt
    );

    state.controls.roll = updateControlSurface(
      state.controls.roll,
      input.roll,
      dt
    );

    state.controls.yaw = updateControlSurface(
      state.controls.yaw,
      input.yaw,
      dt
    );

    // ---------------------------------------
    // 2. Update throttle
    // ---------------------------------------

    state.throttle = updateThrottle(
      state.throttle,
      input.throttle,
      dt
    );

    // Determine whether we are on the runway.
    const previousProgress =
      state.distance / flightPathLength;

    const previousPosition =
      flightPath.getPoint(previousProgress);

    const onGround =
      previousPosition.y <= 0.1;

    // ---------------------------------------
    // 3. Update aircraft speed
    // ---------------------------------------

    state.speed = calculateSpeed(
      state.speed,
      state.throttle,
      input.brake,
      onGround,
      dt
    );

    // ---------------------------------------
    // 4. Progress along flight path
    // ---------------------------------------

    state.distance = Math.min(
      state.distance + state.speed * dt,
      flightPathLength
    );

    const progress =
      state.distance / flightPathLength;

    temp.pathPosition.copy(
      flightPath.getPoint(progress)
    );

    flightPath.getTangent(
      progress,
      temp.tangent
    );

    temp.tangent.normalize();

    // ---------------------------------------
    // 5. Construct local movement axes
    // ---------------------------------------

    // Model uses +Z forward and -X right.
    temp.right
      .crossVectors(
        temp.tangent,
        temp.worldUp
      )
      .normalize();

    temp.up
      .crossVectors(
        temp.right,
        temp.tangent
      )
      .normalize();

    // ---------------------------------------
    // 6. Calculate corridor constraints
    // ---------------------------------------

    const corridorScale = getCorridorScale(
      progress,
      temp.pathPosition.y
    );

    // ---------------------------------------
    // 7. Calculate manual control angles
    // ---------------------------------------

    const manualBank =
      state.controls.roll *
      config.maxSteeringBank *
      corridorScale;

    const manualPitch =
      state.controls.pitch *
      config.maxSteeringPitch *
      corridorScale;

    const manualYaw =
      state.controls.yaw *
      config.maxRudderAngle *
      corridorScale;

    const speedRatio = MathUtils.clamp(
      state.speed / config.maxSpeed,
      0,
      1
    );

    // ---------------------------------------
    // 8. Calculate maneuvering velocities
    // ---------------------------------------

    // Bank creates lateral movement relative
    // to the automatically guided flight path.
    const rollMovement =
      Math.sin(manualBank) /
      Math.sin(config.maxSteeringBank);

    const rudderMovement =
      state.controls.yaw *
      config.rudderEffectiveness *
      corridorScale;

    const targetLateralVelocity =
      MathUtils.clamp(
        rollMovement + rudderMovement,
        -1,
        1
      ) *
      config.lateralSpeed *
      speedRatio *
      corridorScale;

    // Pitch determines climbing and descending.
    const targetVerticalVelocity =
      MathUtils.clamp(
        state.speed * Math.sin(manualPitch),
        -config.verticalSpeed,
        config.verticalSpeed
      ) * corridorScale;

    const movementSmoothing =
      1 - Math.exp(
        -config.movementResponse * dt
      );

    state.lateralVelocity = MathUtils.lerp(
      state.lateralVelocity,
      targetLateralVelocity,
      movementSmoothing
    );

    state.verticalVelocity = MathUtils.lerp(
      state.verticalVelocity,
      targetVerticalVelocity,
      movementSmoothing
    );

    // ---------------------------------------
    // 9. Update position offsets
    // ---------------------------------------

    const previousLateral =
      state.lateralOffset;

    const previousVertical =
      state.verticalOffset;

    state.lateralOffset +=
      state.lateralVelocity * dt;

    state.verticalOffset +=
      state.verticalVelocity * dt;

    const constrained = constrainOffsets(
      state.lateralOffset,
      state.verticalOffset,
      corridorScale
    );

    state.lateralOffset =
      constrained.lateral;

    state.verticalOffset =
      constrained.vertical;

    // ---------------------------------------
    // 10. Apply ground safety
    // ---------------------------------------

    // Limit downward offset without exceeding
    // the original corridor boundary.
    const minimumVerticalOffset =
      -Math.max(0, temp.pathPosition.y) /
      Math.max(temp.up.y, 0.001);

    state.verticalOffset = Math.max(
      state.verticalOffset,
      minimumVerticalOffset
    );

    // Remove outward velocity at the boundary.
    state.lateralVelocity =
      (state.lateralOffset - previousLateral) / dt;

    state.verticalVelocity =
      (state.verticalOffset - previousVertical) / dt;

    // ---------------------------------------
    // 11. Calculate world position
    // ---------------------------------------

    temp.position
      .copy(temp.pathPosition)
      .addScaledVector(
        temp.right,
        state.lateralOffset
      )
      .addScaledVector(
        temp.up,
        state.verticalOffset
      );

    aircraft.position.copy(temp.position);

    // ---------------------------------------
    // 12. Base flight path orientation
    // ---------------------------------------

    temp.target
      .copy(temp.position)
      .add(temp.tangent);

    temp.rotationMatrix.lookAt(
      temp.target,
      temp.position,
      temp.worldUp
    );

    temp.targetRotation.setFromRotationMatrix(
      temp.rotationMatrix
    );

    // ---------------------------------------
    // 13. Automatic curve banking
    // ---------------------------------------

    const aheadProgress = Math.min(
      progress + 0.008,
      1
    );

    flightPath.getTangent(
      aheadProgress,
      temp.aheadTangent
    );

    temp.aheadTangent.normalize();

    temp.cross.crossVectors(
      temp.tangent,
      temp.aheadTangent
    );

    const turnAngle = Math.atan2(
      temp.cross.y,
      temp.tangent.dot(temp.aheadTangent)
    );

    const pathBank =
      -turnAngle * config.bankSensitivity;

    const targetBank = MathUtils.clamp(
      pathBank * corridorScale + manualBank,
      -config.maxBankAngle,
      config.maxBankAngle
    );

    // ---------------------------------------
    // 14. Manual heading and pitch
    // ---------------------------------------

    // Face approximately toward the actual
    // direction of movement.
    const movementYaw = -Math.atan2(
      state.lateralVelocity,
      Math.max(state.speed, 1)
    );

    const targetYaw =
      movementYaw - manualYaw;

    // Positive pitch means nose upward.
    const targetPitch = manualPitch;

    const rotationSmoothing =
      1 - Math.exp(
        -config.rotationResponse * dt
      );

    state.bank = MathUtils.lerp(
      state.bank,
      targetBank,
      rotationSmoothing
    );

    state.pitch = MathUtils.lerp(
      state.pitch,
      targetPitch,
      rotationSmoothing
    );

    state.yaw = MathUtils.lerp(
      state.yaw,
      targetYaw,
      rotationSmoothing
    );

    // ---------------------------------------
    // 15. Apply aircraft rotations
    // ---------------------------------------

    temp.yawRotation.setFromAxisAngle(
      temp.yawAxis,
      state.yaw
    );

    temp.pitchRotation.setFromAxisAngle(
      temp.pitchAxis,
      -state.pitch
    );

    temp.bankRotation.setFromAxisAngle(
      temp.bankAxis,
      state.bank
    );

    temp.targetRotation
      .multiply(temp.yawRotation)
      .multiply(temp.pitchRotation)
      .multiply(temp.bankRotation);

    if (!state.initialized) {
      aircraft.quaternion.copy(
        temp.targetRotation
      );

      state.initialized = true;
    } else {
      aircraft.quaternion.slerp(
        temp.targetRotation,
        rotationSmoothing
      );
    }

    // ---------------------------------------
    // 16. Publish flight telemetry
    // ---------------------------------------

    state.uiTimer += dt;

    if (
      state.uiTimer >= 0.1 ||
      progress >= 1
    ) {
      setProgress(progress);

      setTelemetry({
        speed: state.speed,
        throttle: state.throttle,

        altitude: Math.max(
          0,
          temp.position.y
        ),

        lateralOffset: state.lateralOffset,
        verticalOffset: state.verticalOffset,

        lateralSpeed: state.lateralVelocity,
        verticalSpeed: state.verticalVelocity,

        pitch: MathUtils.radToDeg(state.pitch),
        roll: MathUtils.radToDeg(state.bank),
        yaw: MathUtils.radToDeg(state.yaw),

        braking: input.brake,
        elapsedTime: state.elapsedTime,
      });

      state.uiTimer = 0;
    }

    // ---------------------------------------
    // 17. Complete the flight
    // ---------------------------------------

    if (progress >= 1) {
      completeFlight();
    }
  }, -2);

  return (
    <group
      ref={aircraftRef}
      position={[0, 0, -60]}
    >
      <TwinStar scale={1} />
    </group>
  );
}