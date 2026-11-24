import { useLayoutEffect, useMemo } from 'react';
import { MathUtils, Quaternion, Vector3 } from 'three';
import { flightRings } from '../../flight/courseRules';

const { clamp, degToRad, radToDeg, lerp } = MathUtils;
const right = new Vector3(1, 0, 0);
const up = new Vector3(0, 1, 0);
const forward = new Vector3(0, 0, 1);
const randomBetween = (min, max) => lerp(min, max, Math.random());

export function usePilotMotion(vrm) {
  const motion = useMemo(() => {
    const names = ['hips', 'leftUpperLeg', 'rightUpperLeg', 'head'];
    const [hips, leftLeg, rightLeg, head] = names.map(name =>
      vrm.humanoid.getNormalizedBoneNode(name)
    );
    const bones = [hips, leftLeg, rightLeg, head].filter(Boolean);
    const animatedRotations = bones.map(() => new Quaternion());
    const offset = new Quaternion();
    const inverseHeadRotation = new Quaternion();
    const origin = new Vector3();
    const heading = new Vector3();
    const direction = new Vector3();
    let applied = false;
    let time = 0;
    let nextBlink = randomBetween(1.5, 4);
    let lookStart = 0;
    let lookDuration = 0.2;
    let nextLook = randomBetween(0.5, 1.5);
    let fromYaw = 0, fromPitch = 0, toYaw = 0, toPitch = 0;
    let eyeYaw = 0, eyePitch = 0, headYaw = 0, headPitch = 0;

    function restorePose() {
      if (!applied) return;
      bones.forEach((bone, index) => bone.quaternion.copy(animatedRotations[index]));
      applied = false;
    }

    function applyPose(dt, alignment, seated, aircraft, collectedRings) {
      bones.forEach((bone, index) => animatedRotations[index].copy(bone.quaternion));
      applied = true;
      time += dt;

      if (seated) {
        const recline = degToRad(alignment.seatRecline);
        const spread = degToRad(alignment.legSpread);
        hips?.rotateX(-recline);
        leftLeg?.quaternion.premultiply(offset.setFromAxisAngle(up, spread));
        rightLeg?.quaternion.premultiply(offset.setFromAxisAngle(up, -spread));
        // Recline the torso without lifting the knees with it.
        leftLeg?.quaternion.premultiply(offset.setFromAxisAngle(right, recline));
        rightLeg?.quaternion.premultiply(offset.setFromAxisAngle(right, recline));
      }
      head?.rotateX(-degToRad(alignment.headTilt));

      let ring = null;
      if (aircraft && head) {
        head.getWorldPosition(origin);
        heading.copy(forward).applyQuaternion(aircraft.quaternion);
        let nearest = Infinity;
        for (const [index, candidate] of flightRings.entries()) {
          if (collectedRings & (1 << index)) continue;
          direction.copy(candidate.center).sub(origin);
          const distance = direction.lengthSq();
          if (distance < nearest && direction.dot(heading) > 0) {
            nearest = distance;
            ring = candidate;
          }
        }
      }

      let pitch = 0;
      let yaw = 0;
      if (ring) {
        head.getWorldQuaternion(inverseHeadRotation).invert();
        direction.copy(ring.center).sub(origin).applyQuaternion(inverseHeadRotation);
        yaw = Math.atan2(direction.x, direction.z);
        pitch = -Math.atan2(direction.y, Math.hypot(direction.x, direction.z));
      }

      headYaw = MathUtils.damp(headYaw, clamp(yaw, -0.65, 0.65), 5, dt);
      headPitch = MathUtils.damp(headPitch, clamp(pitch, -0.28, 0.28), 5, dt);
      head?.rotateY(headYaw);
      head?.rotateX(headPitch);

      if (time >= nextLook) {
        lookStart = time;
        lookDuration = randomBetween(0.12, 0.32);
        fromYaw = eyeYaw;
        fromPitch = eyePitch;
        toYaw = randomBetween(-3.4, 3.4);
        toPitch = randomBetween(-2, 2);
        nextLook = time + lookDuration + randomBetween(0.6, 2.8);
      }
      const progress = clamp((time - lookStart) / lookDuration, 0, 1);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      eyeYaw = lerp(fromYaw, toYaw, eased);
      eyePitch = lerp(fromPitch, toPitch, eased);
      if (vrm.lookAt) {
        vrm.lookAt.yaw = clamp(radToDeg(ring ? yaw - headYaw : 0) + eyeYaw, -18, 18);
        vrm.lookAt.pitch = clamp(radToDeg(ring ? pitch - headPitch : 0) + eyePitch, -12, 12);
      }

      const blinkProgress = (time - nextBlink) / 0.16;
      if (blinkProgress >= 1) nextBlink = time + randomBetween(1.8, 4.8);
      const blinking = blinkProgress > 0 && blinkProgress < 1
        ? Math.sin(Math.PI * blinkProgress)
        : 0;
      vrm.expressionManager?.setValue('blink', blinking);
    }

    return { restorePose, applyPose };
  }, [vrm]);

  useLayoutEffect(() => () => {
    motion.restorePose();
    vrm.lookAt?.reset();
    vrm.expressionManager?.setValue('blink', 0);
  }, [motion, vrm]);

  return motion;
}
