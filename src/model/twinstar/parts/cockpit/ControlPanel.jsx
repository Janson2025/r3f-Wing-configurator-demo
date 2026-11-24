// src/model/twinstar/parts/cockpit/ControlPanel.jsx

export default function ControlPanel({
  nodes,
  materials,
}) {
  return (
    <>
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
    </>
  );
}