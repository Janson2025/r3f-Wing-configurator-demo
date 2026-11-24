// src/model/twinstar/parts/wings/left/LeftWing.jsx

import { useMemo } from "react";
import LeftEngine from "./LeftEngine";

export default function LeftWing({ nodes, materials }) {
  const wing = nodes.left_wing;

  const influences = useMemo(
    () => [...wing.morphTargetInfluences],
    [wing]
  );

  return (
    <mesh
      name="left_wing"
      geometry={wing.geometry}
      material={materials["white propellor.001"]}
      morphTargetDictionary={wing.morphTargetDictionary}
      morphTargetInfluences={influences}
      rotation={[-Math.PI, 0, 0]}
      scale={-1}
      userData={wing.userData}
    >
      <LeftEngine nodes={nodes} materials={materials} />
    </mesh>
  );
}