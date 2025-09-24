// src/model/twinstar/parts/hinges/RearDoor.jsx
import HingeControl from "../../../../ui/HingeControl";
import { useAnimationHub } from "../../../../animation/AnimationHub";
import { HINGE_UI } from "./hingeUiConfig";

export default function RearDoor({ nodes, materials }) {
  const hub = useAnimationHub();
  const ui = HINGE_UI.rearDoor;
  return (
    <>
      {/* Keep the window as-is (it will still rotate via Animator) */}
      <mesh
        name="left_rear_door_window"
        geometry={nodes.left_rear_door_window.geometry}
        material={materials.window}
        position={[0.21, 2.876, -1.334]}
      />

      {/* Attach the control to the main door group if you prefer */}
      <group name="rear_side_door" position={[0.21, 2.876, -1.334]}>
        <mesh name="rear_side_door_1" geometry={nodes.rear_side_door_1.geometry} material={materials["body white"]} />
        <mesh name="rear_side_door_2" geometry={nodes.rear_side_door_2.geometry} material={materials["body black"]} />
        <HingeControl
          onClick={hub.toggleRearWindow}
          selected={hub.rearWindowHinge.open}
          offset={ui.offset}
          size={ui.size}
          distanceFactor={ui.distanceFactor}
          ariaLabel="Toggle rear door"
        />
      </group>

      <mesh name="right_rear_window" geometry={nodes.right_rear_window.geometry} material={materials.window} />
    </>
  );
}
