// src/model/twinstar/parts/wings/right/RightWing.jsx

import { useMemo } from "react";
import RightEngine from "./RightEngine";

export default function RightWing({ nodes, materials }) {
  const wing = nodes.right_wing;

  const influences = useMemo(
    () => [...wing.morphTargetInfluences],
    [wing]
  );

  return (
    <mesh
      name="right_wing"
      geometry={wing.geometry}
      material={materials["white propellor.001"]}
      morphTargetDictionary={wing.morphTargetDictionary}
      morphTargetInfluences={influences}
      userData={wing.userData}
    >
      <RightEngine nodes={nodes} materials={materials} />
    </mesh>
  );
}