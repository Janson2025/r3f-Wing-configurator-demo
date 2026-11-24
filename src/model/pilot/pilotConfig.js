// Aircraft local coordinates: +Z nose, +Y up, +X pilot (left) seat.
export const PILOT_CONFIG = {
  scale: 2.125,
  standingPosition: [3.25, -1.99, 4.5],
  standingYaw: -Math.PI / 9,
  seatedPosition: [0.875, -0.775, 2.475],
  seatedYaw: 0,
  seatRecline: 10,
  legSpread: 0,
  headTilt: 25,
  controlStickPosition: [0.6, -0.5, 3.8],
  controlPanelPosition: [0, 0, -0.1],
  stickHand: 'leftHand',
  sliderHand: 'rightHand',
  stickGrip: [0.663, 0.854, 3.796],
  stickMaxAngle: 0.45,
  // Offset for matching the animated hand to the stick.
  stickHandOffset: [0, 0, 0],
};
