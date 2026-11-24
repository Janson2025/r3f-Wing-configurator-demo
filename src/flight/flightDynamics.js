// src/flight/flightDynamics.js

import { MathUtils } from "three";
import { FLIGHT_CONFIG as config } from "./flightConfig";

export function moveToward(current, target, maxDelta) {
  const difference = target - current;

  return (
    current +
    Math.sign(difference) *
      Math.min(Math.abs(difference), maxDelta)
  );
}

// -----------------------------------------
// Throttle
// -----------------------------------------

export function updateThrottle(
  currentThrottle,
  input,
  dt
) {
  return MathUtils.clamp(
    currentThrottle +
      input * config.throttleChangeRate * dt,
    0,
    1
  );
}

// -----------------------------------------
// Speed
// -----------------------------------------

export function calculateSpeed(
  currentSpeed,
  throttle,
  braking,
  onGround,
  dt
) {
  const minimumSpeed = onGround
    ? 0
    : config.minSpeed;

  // Simplified equilibrium speed based on throttle.
  let targetSpeed = MathUtils.lerp(
    minimumSpeed,
    config.maxSpeed,
    throttle
  );

  if (braking) {
    targetSpeed = minimumSpeed;
  }

  const changeRate = braking
    ? config.brakeDeceleration
    : targetSpeed > currentSpeed
      ? config.acceleration
      : config.deceleration;

  const speed = moveToward(
    currentSpeed,
    targetSpeed,
    changeRate * dt
  );

  return MathUtils.clamp(
    speed,
    minimumSpeed,
    config.maxSpeed
  );
}

// -----------------------------------------
// Virtual control surfaces
// -----------------------------------------

export function updateControlSurface(
  current,
  target,
  dt
) {
  const response =
    target === 0
      ? config.controlReturnResponse
      : config.controlResponse;

  const smoothing =
    1 - Math.exp(-response * dt);

  return MathUtils.lerp(
    current,
    target,
    smoothing
  );
}

// -----------------------------------------
// Flight corridor
// -----------------------------------------

export function getCorridorScale(progress, altitude) {
  const takeoff = MathUtils.smoothstep(
    progress,
    0.04,
    0.17
  );

  const landing = 1 - MathUtils.smoothstep(
    progress,
    0.82,
    0.98
  );

  const altitudeScale = MathUtils.smoothstep(
    altitude,
    2,
    25
  );

  return Math.min(
    takeoff,
    landing,
    altitudeScale
  );
}

export function constrainOffsets(
  lateral,
  vertical,
  corridorScale
) {
  const maxLateral =
    config.maxLateralOffset * corridorScale;

  const maxVertical =
    config.maxVerticalOffset * corridorScale;

  if (
    maxLateral <= 0.001 ||
    maxVertical <= 0.001
  ) {
    return {
      lateral: 0,
      vertical: 0,
    };
  }

  const magnitude = Math.hypot(
    lateral / maxLateral,
    vertical / maxVertical
  );

  if (magnitude > 1) {
    lateral /= magnitude;
    vertical /= magnitude;
  }

  return {
    lateral,
    vertical,
  };
}