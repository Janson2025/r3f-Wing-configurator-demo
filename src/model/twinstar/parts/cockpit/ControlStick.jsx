// src/model/twinstar/parts/cockpit/ControlStick.jsx

export default function ControlStick({ nodes }) {
  return (
    <group
      name="Armature"
      position={[0.827, -0.604, 3.154]}
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