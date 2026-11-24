import { useLayoutEffect, useMemo, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader, FBXLoader } from 'three-stdlib';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { AnimationMixer, Quaternion, Vector3, MathUtils } from 'three';
import { useAnimationHub } from '../../animation/AnimationHub';
import { useFlight } from '../../flight/FlightContext';
import { PILOT_CONFIG as c } from './pilotConfig';
import { retargetMixamo } from './retargetMixamo';
import { usePilotMotion } from './usePilotMotion';

const base=import.meta.env.BASE_URL;
const animationUrls = ['Idle', 'Piloting'].map(name => `${base}animations/${name}.fbx`);
const configureLoader=loader=>loader.register(parser=>new VRMLoaderPlugin(parser));
export default function Pilot({ seated=false }) {
  const { mode, status, aircraftRef, telemetry } = useFlight();
  const hub=useAnimationHub();
  const { alignment } = hub;
  const { userData }=useLoader(GLTFLoader,`${base}models/Sariah.vrm`,configureLoader);
  const [idle, piloting] = useLoader(FBXLoader, animationUrls);
  const vrm=userData.vrm;
  const mixer=useMemo(()=>new AnimationMixer(vrm.scene),[vrm]);
  const clips = useMemo(() => [retargetMixamo(idle, vrm), retargetMixamo(piloting, vrm)], [idle, piloting, vrm]);
  const clip = clips[seated ? 1 : 0];
  const motion = usePilotMotion(vrm);
  const binding = useRef(null);
  const sliderAttachment = useRef(null);
  const t=useMemo(()=>({ hand:new Vector3(), grip:new Vector3(),  direction:new Vector3(), restDirection:new Vector3(), q:new Quaternion() }),[]);
  useLayoutEffect(() => {
    const action = mixer.clipAction(clip);
    action.reset().play();
    return () => {
      motion.restorePose();
      action.stop();
      mixer.uncacheClip(clip);
    };
  }, [mixer, clip, motion]);

  useLayoutEffect(() => () => {
    const stick = binding.current;
    if (stick) stick.bone.quaternion.copy(stick.restQ);
    binding.current = null;

    const attachment = sliderAttachment.current;
    if (attachment) {
      const { slider, mount, position, rotation, scale } = attachment;
      mount.add(slider);
      slider.position.copy(position);
      slider.quaternion.copy(rotation);
      slider.scale.copy(scale);
      sliderAttachment.current = null;
    }
  }, [seated, alignment]);

  useFrame((_,delta)=>{
    if (mode === 'flight' && status !== 'flying') return;
    const dt=Math.min(delta,.05);
    motion.restorePose();
    mixer.update(dt);
    motion.applyPose(
      dt, alignment, seated, mode === 'flight' ? aircraftRef.current : null, telemetry.collectedRings
    );
    vrm.update(dt);
    vrm.scene.updateWorldMatrix(true, true);
    if(!seated) return;
    const {planeBody,controlStickBone:bone,controlPanelSlider:slider}=hub.refs.current;
    const sliderHand = vrm.humanoid.getRawBoneNode(c.sliderHand);
    if (slider?.parent && sliderHand && !sliderAttachment.current) {
      sliderAttachment.current = {
        slider,
        mount: slider.parent,
        position: slider.position.clone(),
        rotation: slider.quaternion.clone(),
        scale: slider.scale.clone(),
      };
      // Keep the slider's mounted pose on pickup, then inherit the hand's motion.
      sliderHand.attach(slider);
    }

    const stickHand = vrm.humanoid.getRawBoneNode(c.stickHand);
    if (!planeBody || !bone || !stickHand) return;
    planeBody.updateWorldMatrix(true, true);
    if (binding.current?.bone !== bone) {
      const previous = binding.current;
      if (previous) previous.bone.quaternion.copy(previous.restQ);
      const grip = new Vector3(...c.stickGrip)
        .add(new Vector3(...alignment.controlStickPosition))
        .sub(new Vector3(...c.controlStickPosition));
      planeBody.localToWorld(grip);
      const restGrip=bone.parent.worldToLocal(grip);
      binding.current = { bone, restQ: bone.quaternion.clone(), restGrip };
    }
    const b=binding.current;
    bone.parent.worldToLocal(stickHand.getWorldPosition(t.hand));
    t.grip.copy(t.hand).add(new Vector3(...c.stickHandOffset));
    t.restDirection.copy(b.restGrip).sub(bone.position).normalize();
    t.direction.copy(t.grip).sub(bone.position).normalize();
    t.q.setFromUnitVectors(t.restDirection,t.direction);
    const angle=2*Math.acos(MathUtils.clamp(t.q.w,-1,1));
    if(angle>c.stickMaxAngle) t.q.slerp(new Quaternion(),1-c.stickMaxAngle/angle);
    bone.quaternion.copy(t.q.multiply(b.restQ));
  },0); // after flight transform and camera; before render
  return <group position={seated ? alignment.seatedPosition : alignment.standingPosition} rotation={[0,seated?c.seatedYaw:c.standingYaw,0]} scale={alignment.scale}><primitive object={vrm.scene} dispose={null}/></group>;
}
