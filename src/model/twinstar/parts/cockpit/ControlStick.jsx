// src/model/twinstar/parts/cockpit/ControlStick.jsx

import { useAnimationHub } from "../../../../animation/AnimationHub";

export default function ControlStick({ nodes }) {
  const { alignment } = useAnimationHub();
  return (
    <group
      name="Armature"
      position={alignment.controlStickPosition}
      userData={{ name: "Armature" }}
    >
      <primitive object={nodes.Bone} />

      <skinnedMesh
        name="control_stick"
        geometry={nodes.control_stick.geometry}
        material={nodes.control_stick.material}
        skeleton={nodes.control_stick.skeleton}
        userData={{ name: "control_stick" }}
      />
    </group>
  );
}