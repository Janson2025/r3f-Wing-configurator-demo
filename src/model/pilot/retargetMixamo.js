import { AnimationClip, Quaternion, QuaternionKeyframeTrack, VectorKeyframeTrack, Vector3 } from 'three';

const names = { Hips:'hips', Spine:'spine', Spine1:'chest', Spine2:'upperChest', Neck:'neck', Head:'head', LeftShoulder:'leftShoulder', RightShoulder:'rightShoulder', LeftArm:'leftUpperArm', RightArm:'rightUpperArm', LeftForeArm:'leftLowerArm', RightForeArm:'rightLowerArm', LeftHand:'leftHand', RightHand:'rightHand', LeftUpLeg:'leftUpperLeg', RightUpLeg:'rightUpperLeg', LeftLeg:'leftLowerLeg', RightLeg:'rightLowerLeg', LeftFoot:'leftFoot', RightFoot:'rightFoot', LeftToeBase:'leftToes', RightToeBase:'rightToes' };
for (const side of ['Left','Right']) for (const finger of ['Thumb','Index','Middle','Ring','Pinky']) for (let i=1;i<=3;i++) {
  const joint = finger === 'Thumb' ? ['Metacarpal','Proximal','Distal'][i-1] : ['Proximal','Intermediate','Distal'][i-1];
  names[`${side}Hand${finger}${i}`] = `${side.toLowerCase()}${finger === 'Pinky' ? 'Little' : finger}${joint}`;
}
const clean = name => name.replace(/^.*:/,'').replace(/^mixamorig\d*/, '');
export function retargetMixamo(source, vrm) {
  const clip = source.animations[0];
  if (!clip) throw new Error('FBX contains no animation clip');
  source.updateMatrixWorld(true);
  vrm.humanoid.resetNormalizedPose();
  vrm.scene.updateMatrixWorld(true);
  const bones = new Map();
  source.traverse(o => { if(o.isBone) bones.set(clean(o.name),o); });
  const hips = bones.get('Hips');
  const targetHips = vrm.humanoid.getNormalizedBoneNode('hips');
  const sourceHeight = Math.abs(hips?.getWorldPosition(new Vector3()).y || 100);
  const localHips = targetHips && vrm.scene.worldToLocal(targetHips.getWorldPosition(new Vector3()));
  const targetHeight = Math.abs(localHips?.y || 0.9);
  const scale = targetHeight / sourceHeight;
  const tracks=[];
  for(const track of clip.tracks) {
    const split=track.name.lastIndexOf('.');
    const key=clean(track.name.slice(0,split));
    const property=track.name.slice(split+1);
    const bone=bones.get(key);
    const target=names[key] && vrm.humanoid.getNormalizedBoneNode(names[key]);
    if(!bone || !names[key] || !target) continue;
    if(property==='quaternion') {
      const restInverse=bone.getWorldQuaternion(new Quaternion()).invert();
      const parentRest=bone.parent.getWorldQuaternion(new Quaternion());
      const values=Array.from(track.values);
      const q=new Quaternion();
      for(let i=0;i<values.length;i+=4) q.fromArray(values,i).premultiply(parentRest).multiply(restInverse).normalize().toArray(values,i);
      tracks.push(new QuaternionKeyframeTrack(`${target.name}.quaternion`,track.times,values));
    } else if(property==='position' && key==='Hips') {
      // Keep vertical sitting/breathing motion; eliminate root drift in the aircraft.
      const values=Array.from(track.values);
      for(let i=0;i<values.length;i+=3) {
        values[i]=target.position.x;
        values[i+1]=target.position.y+(values[i+1]-bone.position.y)*scale;
        values[i+2]=target.position.z;
      }
      tracks.push(new VectorKeyframeTrack(`${target.name}.position`,track.times,values));
    }
  }
  if(!tracks.length) throw new Error('No compatible humanoid animation tracks found');
  return new AnimationClip(clip.name,clip.duration,tracks);
}
