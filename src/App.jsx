// src/App.jsx

import {
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useThree,
} from "@react-three/fiber";

import {
  OrbitControls,
  Environment,
} from "@react-three/drei";

import AnimationHub, {
  useAnimationHub,
} from "./animation/AnimationHub";

import Animator from "./animation/Animator";
import FlightClouds from "./scene/environment/FlightClouds";

import { TwinStar } from "./model/twinstar/TwinStar";

import UserControls from "./ui/UserControls";
import FlightControls from "./ui/FlightControls";

import DebugAxes from "./animation/debug/DebugAxes";

import { setAxisMap } from "./animation/axisMap";

import FlightProvider, {
  useFlight,
} from "./flight/FlightContext";

import FlightAircraft from "./flight/FlightAircraft";
import FlightCamera from "./flight/FlightCamera";
import FlightTrack from "./flight/FlightTrack";
import FlightCourse from "./flight/FlightCourse";
import HingeControl from "./ui/HingeControl";
import Pilot from "./model/pilot/Pilot";
import PilotBoundary from "./model/pilot/PilotBoundary";
import FlightClock from "./ui/FlightClock";
import AircraftStatus from "./ui/AircraftStatus";
import GhostAircraft from "./flight/replay/GhostAircraft";

// ---------------------------------------------
// Scene configuration
// ---------------------------------------------

const SCENE_CONFIG = {
  environmentEnabled: false,
  environmentPreset: "city",
  environmentBackground: true,
  environmentBlurriness: 0.5,
  environmentIntensity: 1.0,

  debugAxesVisible: false,
};

setAxisMap({ y: "z", z: "y" });

// ---------------------------------------------
// Configuration camera
// ---------------------------------------------

function ConfiguratorCamera() {
  const hub = useAnimationHub();
  const { camera } = useThree();

  useLayoutEffect(() => {
    // Restore the original camera when leaving flight.
    camera.position.set(35, 24, 38);

    camera.up.set(0, 1, 0);
    camera.fov = 45;

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    hub.isInteracting.current = false;

    return () => {
      hub.isInteracting.current = false;
    };
  }, [camera, hub.isInteracting]);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={80}
      target={[0, 0, 0]}
      onStart={() => {
        hub.isInteracting.current = true;
      }}
      onEnd={() => {
        hub.isInteracting.current = false;
      }}
    />
  );
}

// ---------------------------------------------
// Scene lighting
// ---------------------------------------------

function SceneLighting() {
  const { mode } = useFlight();

  const background =
    mode === "flight"
      ? "#9ac2df"
      : "#22222f";

  return (
    <>
      <color
        attach="background"
        args={[background]}
      />

      <ambientLight intensity={0.6} />

      {!SCENE_CONFIG.environmentEnabled && (
        <>
          <hemisphereLight
            args={[
              "#dceaff",
              "#646474",
              1.0,
            ]}
          />

          <directionalLight
            position={[10, 15, 10]}
            intensity={2.5}
          />

          <directionalLight
            position={[-10, 5, -10]}
            intensity={1.0}
          />
        </>
      )}

      {SCENE_CONFIG.environmentEnabled && (
        <Suspense fallback={null}>
          <Environment
            preset={SCENE_CONFIG.environmentPreset}
            background={
              SCENE_CONFIG.environmentBackground
            }
            backgroundBlurriness={
              SCENE_CONFIG.environmentBlurriness
            }
            environmentIntensity={
              SCENE_CONFIG.environmentIntensity
            }
          />
        </Suspense>
      )}

      {mode === "flight" && (
        <fog
          attach="fog"
          args={[background, 600, 1800]}
        />
      )}
    </>
  );
}

// ---------------------------------------------
// Aircraft configuration scene
// ---------------------------------------------

function ConfiguratorScene({ controlOverlay }) {
  const [seated, setSeated] = useState(false);
  const { alignment } = useAnimationHub();
  const [x, y, z] = alignment.standingPosition;
  return (
    <>
      <ConfiguratorCamera />
      <FlightTrack showPath={false} />
      <HingeControl
        portal={controlOverlay}
        offset={[x, y + 2.05 * alignment.scale, z]}
        ariaLabel="Pilot in cockpit"
        selected={seated}
        onClick={() => setSeated(current => !current)}
      />
      <PilotBoundary>
        <Suspense fallback={null}><Pilot seated={seated} /></Suspense>
      </PilotBoundary>

      <Suspense fallback={null}>
        <group>
          <TwinStar
            scale={1}
            rotation={[0, 0, 0]}
          />

          {SCENE_CONFIG.debugAxesVisible && (
            <DebugAxes size={1.2} visible />
          )}
        </group>
      </Suspense>
    </>
  );
}

// ---------------------------------------------
// Flight scene
// ---------------------------------------------

function FlightScene() {
  const { sessionId, showFlightPath } = useFlight();

  return (
    <>
      <FlightTrack showPath={showFlightPath} />
      <FlightCourse key={sessionId} />

      <Suspense fallback={null}>
        <FlightClouds key={`clouds-${sessionId}`} />

        <FlightAircraft key={sessionId} />
        <GhostAircraft key={`ghost-${sessionId}`} />

        <FlightCamera
          key={`camera-${sessionId}`}
        />
      </Suspense>
    </>
  );
}

// ---------------------------------------------
// Main Three.js scene
// ---------------------------------------------

function AircraftScene({ controlOverlay }) {
  const { mode } = useFlight();

  return (
    <>
      <SceneLighting />

      <Animator key={mode} />

      {mode === "configure" ? (
        <ConfiguratorScene controlOverlay={controlOverlay} />
      ) : (
        <FlightScene />
      )}
    </>
  );
}

// ---------------------------------------------
// Application UI
// ---------------------------------------------

function Application() {
  const { mode } = useFlight();
  const controlOverlay = useRef(null);

  return (
    <>
      <div className="scene-control-overlay" ref={controlOverlay} />
      <Canvas
        camera={{
          position: [21, 21, 21],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <AircraftScene controlOverlay={controlOverlay} />
      </Canvas>

      <FlightControls />
      <FlightClock />
      <AircraftStatus />

      {mode === "configure" && (
        <UserControls />
      )}
    </>
  );
}

// ---------------------------------------------
// Application entry point
// ---------------------------------------------

export default function App() {
  return (
    <AnimationHub>
      <FlightProvider>
        <Application />
      </FlightProvider>
    </AnimationHub>
  );
}