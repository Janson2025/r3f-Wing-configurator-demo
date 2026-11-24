// src/flight/FlightTrack.jsx

import { useMemo } from "react";
import { Line } from "@react-three/drei";

import { flightPath } from "./flightPath";
import { FLIGHT_CONFIG } from "./flightConfig";

export default function FlightTrack() {
  const points = useMemo(() => {
    return Array.from(
      { length: 501 },
      (_, index) => {
        return flightPath.getPoint(index / 500);
      }
    );
  }, []);

  return (
    <group>
      {FLIGHT_CONFIG.showTrack && (
        <Line
          points={points}
          color="#63d5ff"
          lineWidth={2}
          transparent
          opacity={0.65}
        />
      )}

      {FLIGHT_CONFIG.showGround && (
        <>
          {/* Temporary terrain */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[200, -2.05, 0]}
            receiveShadow
          >
            <planeGeometry args={[3000, 3000]} />

            <meshStandardMaterial
              color="#617b51"
              roughness={1}
            />
          </mesh>

          {/* Temporary runway */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
            receiveShadow
          >
            <planeGeometry args={[24, 320]} />

            <meshStandardMaterial
              color="#42484d"
              roughness={0.9}
            />
          </mesh>

          {/* Runway center markings */}
          {Array.from({ length: 14 }, (_, index) => (
            <mesh
              key={index}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[
                0,
                -1.99,
                -130 + index * 20,
              ]}
            >
              <planeGeometry args={[0.5, 10]} />

              <meshBasicMaterial
                color="#ffffff"
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}