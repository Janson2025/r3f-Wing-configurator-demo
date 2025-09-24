// debug/DebugAxes.jsx
import React from "react";
import { Line } from "@react-three/drei";

export default function DebugAxes({ size = 1.5, visible = true }) {
  if (!visible) return null;
  return (
    <group>
      {/* X axis: red */}
      <Line points={[[0,0,0],[size,0,0]]} color="red" lineWidth={2} transparent opacity={0.9} depthTest={false} />
      {/* Y axis: yellow */}
      <Line points={[[0,0,0],[0,size,0]]} color="yellow" lineWidth={2} transparent opacity={0.9} depthTest={false} />
      {/* Z axis: blue */}
      <Line points={[[0,0,0],[0,0,size]]} color="blue" lineWidth={2} transparent opacity={0.9} depthTest={false} />
    </group>
  );
}
