// src/model/twinstar/parts/wings/left/LeftWing.jsx
import LeftEngine from "./LeftEngine";

export default function LeftWing({ nodes, materials }) {
  return (
    <mesh
      name="left_wing"
      geometry={nodes.left_wing.geometry}
      material={materials["white propellor.001"]}
      morphTargetDictionary={nodes.left_wing.morphTargetDictionary}
      morphTargetInfluences={nodes.left_wing.morphTargetInfluences}
      rotation={[-Math.PI, 0, 0]}
      scale={-1}
    >
      <LeftEngine nodes={nodes} materials={materials} />
    </mesh>
  );
}
