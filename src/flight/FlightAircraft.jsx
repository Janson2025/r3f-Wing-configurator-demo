import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Quaternion, Matrix4, MathUtils, Object3D } from 'three';
import { TwinStar } from '../model/twinstar/TwinStar';
import Pilot from '../model/pilot/Pilot';
import PilotBoundary from '../model/pilot/PilotBoundary';
import { useAnimationHub } from '../animation/AnimationHub';
import { useFlight } from './FlightContext';
import { FLIGHT_CONFIG as c } from './flightConfig';
import useFlightInput from './useFlightInput';
import { getCorridorScale, constrainOffsets, moveToward } from './flightDynamics';
import { flightPath, flightPathLength as length } from './flightPath';
import { corridorGraceSeconds, corridorRadius, crossesRing, flightRings } from './courseRules';
import { coordinatedTurnRate, fuelFlow } from '../aircraft/performance/calculatePerformance';
import { saveBest, referenceDuration } from './replay/records';
const samples=Array.from({length:1001},(_,i)=>flightPath.getPoint(i/1000));
const up=new Vector3(0,1,0);
const forward=new Vector3(0,0,1);
const clamp=MathUtils.clamp;
const STEP = 1 / 60;
function project(position,previous){
  // Local search avoids snapping from runway start to its overlapping finish.
  let best=previous, distance=Infinity;
  for(let i=Math.max(0,previous-20);i<=Math.min(1000,previous+40);i++){
    const d=samples[i].distanceToSquared(position); if(d<distance){best=i;distance=d;}
  }
  return {index:best,deviation:Math.sqrt(distance)};
}
export default function FlightAircraft(){
 const {aircraftRef,simulationTime,status,performance:p,autoPathFollowing:auto,setProgress,setTelemetry,completeFlight,failFlight}=useFlight();
 const hub=useAnimationHub();
 const read=useFlightInput(status==='flying');
 const state=useRef({time:0,accumulator:0,distance:0, outsideTime:0, collectedRings:0, ended:false, speed:c.initialSpeed,throttle:c.initialThrottle,fuel:p.startingFuel,lateral:0,vertical:0,roll:0,pitch:0,yaw:0,heading:0,ui:0,recordTime:0,frames:[],index:0,checkpoint:0,mode:auto, mixed:false,initialized:false,exhausted:false,configuration:{...hub.morphs.current}});
 const t=useMemo(()=>({pitchAxis:new Vector3(1,0,0),center:new Vector3(),tangent:new Vector3(),right:new Vector3(),vertical:new Vector3(),target:new Vector3(),matrix:new Matrix4(),q:new Quaternion(),rollQ:new Quaternion(),pitchQ:new Quaternion(),yawQ:new Quaternion(),direction:new Vector3(),last:new Vector3(), previousRotation:new Quaternion(), pose:new Object3D(), ringScratch:new Vector3(), ahead:new Vector3(),cross:new Vector3()}),[]);
 useFrame((_,delta)=>{
  const aircraft = aircraftRef.current;
  const s = state.current;
  if (!aircraft || status !== 'flying' || s.ended) return;

  const a = t.pose;
  if (!s.initialized) {
    a.position.copy(samples[0]);
    t.last.copy(a.position);
    s.frames.push({time:0,position:a.position.toArray(),quaternion:a.quaternion.toArray(),progress:0});
    s.initialized = true;
  }
  s.accumulator+=Math.min(delta,.1);
  const input=read();
  while (s.accumulator >= STEP) {
   const dt = STEP;
   s.accumulator -= dt;
   s.time += dt;
   t.last.copy(a.position);
   t.previousRotation.copy(a.quaternion);
   const oldProgress=s.distance/length;
   const ground=a.position.y<=.1;
   s.throttle=clamp(s.throttle+input.throttle*c.throttleChangeRate*dt,0,1);
   const flow=s.exhausted?0:fuelFlow(s.throttle);s.fuel=Math.max(0,s.fuel-flow*dt/3600);
   if(s.fuel<=0)s.exhausted=true;
   const minimum=ground?0:p.minSpeed;
   const target=s.exhausted?0:input.brake?minimum:MathUtils.lerp(minimum,p.maxSpeed,s.throttle);
   s.speed=moveToward(s.speed,target,(input.brake?(ground?p.brakeDeceleration:p.deceleration*1.5):target>s.speed?p.acceleration:p.deceleration)*dt);
   const smooth=1-Math.exp(-p.controlResponse*dt);
   s.roll=MathUtils.lerp(s.roll,input.roll*c.maxSteeringBank,smooth);
   s.pitch=MathUtils.lerp(s.pitch,input.pitch*c.maxSteeringPitch,smooth);
   s.yaw=MathUtils.lerp(s.yaw,input.yaw*c.maxRudderAngle,smooth);
   let progress=oldProgress,deviation=0,bank=s.roll,finished=false,reason=null;
   let rejoinedGuidance = false;
   if (s.mode !== auto) {
    s.mixed = true;
    const nearest = project(a.position, s.index);
    s.index = nearest.index;
    // Keep manual control while outside the radius so engaging guidance
    // cannot bypass the recovery timer.
    if (!auto || nearest.deviation <= c.maxLateralOffset) {
      s.mode = auto;
      t.direction.copy(forward).applyQuaternion(a.quaternion);
      s.heading = Math.atan2(t.direction.x, t.direction.z);
      if (auto) {
        rejoinedGuidance = true;
        s.distance = s.index / 1000 * length;
        flightPath.getPoint(s.distance / length, t.center);
        flightPath.getTangent(s.distance / length, t.tangent);
        t.right.crossVectors(t.tangent, up).normalize();
        t.vertical.crossVectors(t.right, t.tangent).normalize();
        t.direction.copy(a.position).sub(t.center);
        s.lateral = t.direction.dot(t.right);
        s.vertical = t.direction.dot(t.vertical);
      }
    }
   }
   if(s.exhausted){t.direction.copy(forward).applyQuaternion(a.quaternion);t.direction.y=-.18;t.direction.normalize();a.position.addScaledVector(t.direction,Math.max(s.speed,8)*dt);t.matrix.lookAt(t.target.copy(a.position).add(t.direction),a.position,up);t.q.setFromRotationMatrix(t.matrix);a.quaternion.slerp(t.q,smooth);if(a.position.y<=0){a.position.y=0;reason='Fuel exhausted — forced descent';}}
   else if(s.mode){
    s.distance=Math.min(length,s.distance+s.speed*dt);progress=s.distance/length;
    flightPath.getPoint(progress,t.center);flightPath.getTangent(progress,t.tangent).normalize();
    t.right.crossVectors(t.tangent,up).normalize();t.vertical.crossVectors(t.right,t.tangent).normalize();
    const scale=getCorridorScale(progress,t.center.y);
    s.lateral+=(Math.sin(s.roll)/Math.sin(c.maxSteeringBank)+input.yaw*c.rudderEffectiveness)*p.lateralSpeed*scale*dt;
    s.vertical+=clamp(s.speed*Math.sin(s.pitch),-p.verticalSpeed,p.verticalSpeed)*scale*dt;
    const offset=constrainOffsets(s.lateral,s.vertical,scale);s.lateral=offset.lateral;s.vertical=Math.max(offset.vertical,-Math.max(0,t.center.y)/Math.max(.001,t.vertical.y));
    a.position.copy(t.center).addScaledVector(t.right,s.lateral).addScaledVector(t.vertical,s.vertical);
    deviation=Math.hypot(s.lateral,s.vertical);
    flightPath.getTangent(Math.min(1,progress+.008),t.ahead);t.cross.crossVectors(t.tangent,t.ahead);
    bank=clamp(Math.atan2(t.cross.y,t.tangent.dot(t.ahead))*c.bankSensitivity+s.roll,-c.maxBankAngle,c.maxBankAngle)*scale;
    t.matrix.lookAt(t.target.copy(a.position).add(t.tangent),a.position,up);t.q.setFromRotationMatrix(t.matrix);
    t.pitchQ.setFromAxisAngle(t.pitchAxis,-s.pitch*scale);t.rollQ.setFromAxisAngle(forward,bank);t.q.multiply(t.pitchQ).multiply(t.rollQ);a.quaternion.slerp(t.q,1-Math.exp(-c.rotationResponse*dt));
    s.index=Math.min(999,Math.floor(progress*1000));s.checkpoint=Math.max(s.checkpoint,Math.min(9,Math.floor(progress*10)));finished=progress>=1;
   }else{
    // Manual flight integrates heading and velocity; no path position snapping.
    s.heading -= (coordinatedTurnRate(s.roll, s.speed) + input.yaw * .15) * dt;
    const pitch=ground&&s.speed<p.minSpeed?Math.min(0,s.pitch):s.pitch;
    t.direction.set(Math.sin(s.heading)*Math.cos(pitch),Math.sin(pitch),Math.cos(s.heading)*Math.cos(pitch));
    a.position.addScaledVector(t.direction,s.speed*dt);
    if(a.position.y<0){if(oldProgress>.12&&oldProgress<.85)reason='Ground collision';a.position.y=0;}
    t.matrix.lookAt(t.target.copy(a.position).add(t.direction),a.position,up);t.q.setFromRotationMatrix(t.matrix);t.rollQ.setFromAxisAngle(forward,s.roll);t.q.multiply(t.rollQ);a.quaternion.slerp(t.q,smooth);
    const nearest=project(a.position,s.index);s.index=nearest.index;deviation=nearest.deviation;progress=s.index/1000;if(s.checkpoint<9 && progress>=(s.checkpoint+1)/10 && deviation<corridorRadius)s.checkpoint++;s.distance=progress*length;
    finished=s.checkpoint>=9&&s.index>=995&&a.position.distanceTo(samples[1000])<15&&a.position.y<5;
   }
   if (s.exhausted) deviation = project(a.position, s.index).deviation;
   const wasOutside = s.outsideTime > 0;
   s.outsideTime = deviation > corridorRadius ? s.outsideTime + dt : 0;
   const corridorTimeLeft = s.outsideTime > 0
     ? Math.max(0, corridorGraceSeconds - s.outsideTime - 1e-9)
     : null;
   if (!reason && corridorTimeLeft === 0) reason = 'Disqualified — outside the flight corridor';

   const previousRings = s.collectedRings;
   if (!s.exhausted && !reason && !rejoinedGuidance) {
    for (const [index, ring] of flightRings.entries()) {
      const bit = 1 << index;
      if (!(s.collectedRings & bit) && crossesRing(t.last, a.position, ring, t.ringScratch)) {
        s.collectedRings |= bit;
      }
    }
   }

   s.ui+=dt;s.recordTime+=dt;
   if(s.recordTime>=.05||finished){s.frames.push({time:s.time,position:a.position.toArray(),quaternion:a.quaternion.toArray(),progress});s.recordTime=0;}
   if(s.ui>=.1||finished||reason||previousRings!==s.collectedRings||wasOutside !== (s.outsideTime > 0)){setProgress(finished?1:progress);setTelemetry({speed:s.speed,throttle:s.throttle,altitude:a.position.y,lateralOffset:s.lateral,verticalOffset:s.vertical,pitch:MathUtils.radToDeg(s.pitch),roll:MathUtils.radToDeg(bank),yaw:MathUtils.radToDeg(s.yaw),verticalSpeed:(a.position.y-t.last.y)/dt,lateralSpeed:0,braking:input.brake,elapsedTime:s.time,fuelRemaining:s.fuel,fuelCapacity:p.startingFuel,fuelFlow:flow,pathDeviation:deviation,corridorTimeLeft,collectedRings:s.collectedRings});s.ui=0;}
   if (reason || finished) {
    s.ended = true;
    if (reason) failFlight(reason);
    else {
      if (!s.mixed && s.time < referenceDuration) {
        saveBest(s.mode ? 'assisted' : 'manual', {
          duration: s.time, configuration: s.configuration, frames: s.frames,
        });
      }
      completeFlight();
    }
    break;
   }
  }

  // Keep simulation and replay samples fixed-step while rendering between ticks.
  const alpha = s.ended ? 1 : s.accumulator / STEP;
  aircraft.position.copy(t.last).lerp(a.position, alpha);
  aircraft.quaternion.copy(t.previousRotation).slerp(a.quaternion, alpha);
  simulationTime.current = Math.max(0, s.time - (1 - alpha) * STEP);
 },-2);
 return <group ref={aircraftRef} position={[0,0,-60]}><TwinStar scale={1}/><PilotBoundary><Suspense fallback={null}><Pilot seated/></Suspense></PilotBoundary></group>;
}
