// src/model/twinstar/parts/hinges/RearDoor.jsx

import HingeControl from "../../../../ui/HingeControl";
import { useAnimationHub } from "../../../../animation/AnimationHub";
import { HINGE_UI } from "./hingeUiConfig";

export default function RearDoor({ nodes, materials }) {
  const hub = useAnimationHub();
  const ui = HINGE_UI.rearDoor;

  return (
    <>
      <mesh
        name="left_rear_door_window"
        geometry={nodes.left_rear_door_window.geometry}
        material={materials.window}
        position={[0.21, 2.876, -1.334]}
      />

      <group
        name="rear_side_door"
        position={[0.21, 2.876, -1.334]}
      >
        <mesh
          name="rear_side_door_1"
          geometry={nodes.rear_side_door_1.geometry}
          material={materials["body black"]}
        />

        <mesh
          name="rear_side_door_2"
          geometry={nodes.rear_side_door_2.geometry}
          material={materials["body white"]}
        />

        <HingeControl
          onClick={hub.toggleRearWindow}
          selected={hub.rearWindowHinge.open}
          offset={ui.offset}
          size={ui.size}
          distanceFactor={ui.distanceFactor}
          ariaLabel="Toggle rear door"
        />
      </group>

      <mesh
        name="right_rear_window"
        geometry={nodes.right_rear_window.geometry}
        material={materials.window}
      />
    </>
  );
}