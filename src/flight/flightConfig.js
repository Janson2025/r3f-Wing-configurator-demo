// src/flight/flightConfig.js

import { MathUtils } from "three";

export const FLIGHT_CONFIG = {
  // Aircraft speed
  initialSpeed: 30,
  minSpeed: 12,
  maxSpeed: 65,

  acceleration: 8,
  deceleration: 10,
  brakeDeceleration: 22,

  // Throttle
  initialThrottle: 0.55,
  throttleChangeRate: 0.35,

  // Virtual control stick and rudder
  controlResponse: 3.5,
  controlReturnResponse: 4.5,

  maxBankAngle: MathUtils.degToRad(40),
  maxSteeringBank: MathUtils.degToRad(25),
  maxSteeringPitch: MathUtils.degToRad(18),
  maxRudderAngle: MathUtils.degToRad(10),

  rudderEffectiveness: 0.25,

  // Automatic flight guidance
  bankSensitivity: 12,
  rotationResponse: 5,

  // Flight corridor
  maxLateralOffset: 45,
  maxVerticalOffset: 30,

  lateralSpeed: 18,
  verticalSpeed: 12,
  movementResponse: 3,

  // Propellers
  propellerSpeed: 30,

  // Environment
  showTrack: true,
  showGround: true,

  // Windows
  windows: {
    exteriorOpacity: 0.28,
    cockpitOpacity: 0.08,
  },

  // Cameras
  camera: {
    response: 5,

    external: {
      position: [0, 15, -38],
      target: [0, 3, 0],
      fov: 50,
    },

    cockpit: {
      position: [0.827, 1.65, 3.0],
      target: [0.827, 1.65, 30],
      fov: 75,
    },
  },
};