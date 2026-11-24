// src/model/twinstar/parts/cockpit/ControlPanel.jsx

import { useAnimationHub } from "../../../../animation/AnimationHub";

export default function ControlPanel({
  nodes,
  materials,
}) {
  const { alignment } = useAnimationHub();
  return (
    <group position={alignment.controlPanelPosition}>
      <mesh
        name="control_pannel"
        geometry={nodes.control_pannel.geometry}
        material={materials.console}
      />

      <mesh
        name="control_pannel_adjusting_slider"
        geometry={
          nodes.control_pannel_adjusting_slider.geometry
        }
        material={materials.console}
      />
    </group>
  );
}