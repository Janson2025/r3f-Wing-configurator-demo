// src/App.jsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import { Suspense } from "react";

import AnimationHub, { useAnimationHub } from "./animation/AnimationHub";
import Animator from "./animation/Animator";
import { TwinStar } from "./model/twinstar/TwinStar";
import UserControls from "./ui/UserControls";
import DebugAxes from "./animation/debug/DebugAxes";
import { setAxisMap } from "./animation/axisMap";

// ✅ Set the axis map ONCE at module scope (not inside a component)
setAxisMap({ y: "z", z: "y" });

function ControlsPauser() {
  const hub = useAnimationHub();
  return (
    <OrbitControls
      enableDamping
      onStart={() => (hub.isInteracting.current = true)}
      onEnd={() => (hub.isInteracting.current = false)}
    />
  );
}

export default function App() {
  return (
    <AnimationHub>
      <Canvas
        camera={{ position: [21, 21, 21], fov: 45 }}
        // Crisper Html/SVG buttons & overall scene
        dpr={[1.5, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#22222f"]} />
        <ambientLight intensity={0.6} />
        <Environment preset="sunset" />

        {/* Must be inside Canvas */}
        <ControlsPauser />
        <Animator />

        <Suspense fallback={null}>
          <Center>
            <TwinStar scale={1.0} rotation={[0, Math.PI / 8, 0]} />
            <DebugAxes size={1.2} visible />
          </Center>
        </Suspense>
      </Canvas>

      {/* Pure DOM UI (no R3F hooks) can live outside Canvas */}
      <UserControls />
    </AnimationHub>
  );
}
