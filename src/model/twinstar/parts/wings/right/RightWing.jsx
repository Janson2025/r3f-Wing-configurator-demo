// src/model/twinstar/parts/wings/right/RightWing.jsx
import RightEngine from "./RightEngine";

export default function RightWing({ nodes, materials }) {
  return (
    <mesh
      name="right_wing"
      geometry={nodes.right_wing.geometry}
      material={materials["white propellor.001"]}
      morphTargetDictionary={nodes.right_wing.morphTargetDictionary}
      morphTargetInfluences={nodes.right_wing.morphTargetInfluences}
    >
      <RightEngine nodes={nodes} materials={materials} />
    </mesh>
  );
}
