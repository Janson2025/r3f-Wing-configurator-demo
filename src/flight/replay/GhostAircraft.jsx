import { useMemo,useRef,useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { MeshBasicMaterial,Vector3,Quaternion,Matrix4 } from 'three';
import { useFlight } from '../FlightContext';
import { flightPath,flightPathLength } from '../flightPath';
import { loadBest, referenceSpeed } from './records';
export default function GhostAircraft(){
 const {showGhostAircraft,autoPathFollowing,status,simulationTime}=useFlight();
 const {scene}=useGLTF(`${import.meta.env.BASE_URL}models/diamond-da42-twin-star3.glb`);
 const group=useRef();const record=useRef(loadBest(autoPathFollowing?'assisted':'manual'));
 const {clone,material}=useMemo(()=>{const clone=SkeletonUtils.clone(scene);const material=new MeshBasicMaterial({color:'#75d9ff',transparent:true,opacity:.27,depthWrite:false});clone.traverse(o=>{if(o.isMesh){o.material=material;o.castShadow=false;o.receiveShadow=false;if(o.morphTargetDictionary){for(const [name,i] of Object.entries(o.morphTargetDictionary))o.morphTargetInfluences[i]=record.current?.configuration?.[name]??o.morphTargetInfluences[i];}}});return {clone,material};},[scene]);
 useEffect(()=>()=>material.dispose(),[material]);
 const t=useMemo(()=>({a:new Vector3(),b:new Vector3(),q:new Quaternion(),m:new Matrix4(),up:new Vector3(0,1,0)}),[]);
 useFrame((_,delta)=>{if(!group.current)return;const r=record.current;const time=simulationTime.current;if(r){const frames=r.frames;let low=0,high=frames.length-1;while(high-low>1){const mid=(low+high)>>1;if(frames[mid].time<=time)low=mid;else high=mid;}const a=frames[low],b=frames[high],f=Math.max(0,Math.min(1,(time-a.time)/Math.max(.001,b.time-a.time)));group.current.position.fromArray(a.position).lerp(t.a.fromArray(b.position),f);group.current.quaternion.fromArray(a.quaternion).slerp(t.q.fromArray(b.quaternion),f);}else{const progress=Math.min(1,time*referenceSpeed/flightPathLength);group.current.position.copy(flightPath.getPoint(progress));flightPath.getTangent(progress,t.a);t.m.lookAt(t.b.copy(group.current.position).add(t.a),group.current.position,t.up);group.current.quaternion.setFromRotationMatrix(t.m);}},-1);
 return <group ref={group} visible={showGhostAircraft}><primitive object={clone} dispose={null}/></group>;
}
