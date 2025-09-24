// src/model/twinstar/parts/hinges/CockpitDoor.jsx
import HingeControl from "../../../../ui/HingeControl";
import { useAnimationHub } from "../../../../animation/AnimationHub";
import { HINGE_UI } from "./hingeUiConfig";

export default function CockpitDoor({ nodes, materials }) {
  const hub = useAnimationHub();
  const ui = HINGE_UI.cockpit;
  return (
    <mesh name="cockpit_window_case" geometry={nodes.cockpit_window_case.geometry} material={materials.body} position={[0, 1.413, 4.123]}>
      <mesh name="cockpit_window" geometry={nodes.cockpit_window.geometry} material={materials.window} />
      <HingeControl
        onClick={hub.toggleCockpit}
        selected={hub.cockpitHinge.open}
        offset={ui.offset}
        size={ui.size}
        distanceFactor={ui.distanceFactor}
        ariaLabel="Toggle cockpit window"
      />
    </mesh>
  );
}
