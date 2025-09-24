// src/model/twinstar/parts/hinges/NoseHatch.jsx
import HingeControl from "../../../../ui/HingeControl";
import { useAnimationHub } from "../../../../animation/AnimationHub";
import { HINGE_UI } from "./hingeUiConfig";

export default function NoseHatch({ nodes, materials }) {
  const hub = useAnimationHub();
  const ui = HINGE_UI.nose;
  return (
    <group name="nose_Empty" position={[0.192, 0.956, 6.857]} rotation={[0.122, 0, 0]}>
      <mesh name="nose_hatch" geometry={nodes.nose_hatch.geometry} rotation={[-0.122, 0, 0]} material={materials["body.001"]} />
      <HingeControl
        onClick={hub.toggleNoseHatch}
        selected={hub.noseHatchHinge.open}
        offset={ui.offset}
        size={ui.size}
        distanceFactor={ui.distanceFactor}
        ariaLabel="Toggle nose hatch"
      />
    </group>
  );
}
