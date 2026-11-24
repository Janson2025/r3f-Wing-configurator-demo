// src/flight/flightPath.js

import {
  Vector3,
  CatmullRomCurve3,
  CurvePath,
  LineCurve3,
} from "three";

export function createFlightPath() {
  const path = new CurvePath();

  // Straight takeoff roll.
  path.add(
    new LineCurve3(
      new Vector3(0, 0, -60),
      new Vector3(0, 0, 60)
    )
  );

  // Airborne portion of the circuit.
  const airbornePath = new CatmullRomCurve3(
    [
      new Vector3(0, 0, 60),
      new Vector3(0, 12, 160),
      new Vector3(0, 50, 280),

      new Vector3(100, 85, 400),
      new Vector3(260, 100, 400),
      new Vector3(400, 100, 280),

      new Vector3(440, 100, 60),
      new Vector3(440, 95, -180),

      new Vector3(300, 75, -360),
      new Vector3(120, 50, -400),

      new Vector3(0, 18, -300),
      new Vector3(0, 4, -180),
      new Vector3(0, 0, -120),
    ],
    false,
    "centripetal"
  );

  airbornePath.arcLengthDivisions = 2000;
  airbornePath.updateArcLengths();

  path.add(airbornePath);

  // Straight landing roll.
  path.add(
    new LineCurve3(
      new Vector3(0, 0, -120),
      new Vector3(0, 0, -60)
    )
  );

  return path;
}

export const flightPath = createFlightPath();

export const flightPathLength = flightPath.getLength();