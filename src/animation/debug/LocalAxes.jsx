// debug/LocalAxes.jsx
import { useEffect, useRef } from "react";
import { Line } from "@react-three/drei";

export default function LocalAxes({ target, size = 1.2, visible = true }) {
  const g = useRef();
  useEffect(() => {
    if (!g.current || !target) return;
    // follow the target's transform
    g.current.position.copy(target.position);
    g.current.quaternion.copy(target.quaternion);
  }, [target]);

  if (!visible || !target) return null;
  return (
    <group ref={g}>
      <Line points={[[0,0,0],[size,0,0]]} color="red"   transparent opacity={0.9} depthTest={false} />
      <Line points={[[0,0,0],[0,size,0]]} color="yellow" transparent opacity={0.9} depthTest={false} />
      <Line points={[[0,0,0],[0,0,size]]} color="blue"  transparent opacity={0.9} depthTest={false} />
    </group>
  );
}
