// src/scene/environment/FlightClouds.jsx

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Clouds } from "@react-three/drei";
import { MeshBasicMaterial } from "three";

const CLOUD_FORMATIONS = [
  {
    position: [-120, 145, 180],
    bounds: [55, 12, 35],
    seed: 12,
    volume: 12,
  },
  {
    position: [180, 175, 350],
    bounds: [65, 16, 40],
    seed: 25,
    volume: 15,
  },
  {
    position: [420, 150, 180],
    bounds: [45, 12, 30],
    seed: 36,
    volume: 10,
  },
  {
    position: [560, 220, -100],
    bounds: [80, 18, 45],
    seed: 41,
    volume: 18,
  },
  {
    position: [300, 130, -300],
    bounds: [50, 10, 35],
    seed: 52,
    volume: 12,
  },
  {
    position: [-80, 180, -280],
    bounds: [60, 15, 40],
    seed: 63,
    volume: 14,
  },
  {
    position: [160, 260, 20],
    bounds: [90, 15, 50],
    seed: 74,
    volume: 20,
  },
  {
    position: [-220, 200, -40],
    bounds: [55, 14, 40],
    seed: 85,
    volume: 13,
  },
];

export default function FlightClouds() {
  const cloudGroup = useRef();

  useFrame((_, delta) => {
    if (!cloudGroup.current) return;

    const dt = Math.min(delta, 0.05);

    // Gentle prevailing wind.
    cloudGroup.current.position.x += 0.35 * dt;
    cloudGroup.current.position.z += 0.12 * dt;
  });

  return (
    <group ref={cloudGroup}>
      <Clouds
        material={MeshBasicMaterial}
        texture={`${import.meta.env.BASE_URL}textures/cloud.png`}
        limit={200}
      >
        {CLOUD_FORMATIONS.map((cloud) => (
          <Cloud
            key={cloud.seed}
            seed={cloud.seed}
            position={cloud.position}
            bounds={cloud.bounds}
            volume={cloud.volume}
            segments={18}
            opacity={0.65}
            speed={0.08}
            color="#f4f7fb"
            fade={40}
          />
        ))}
      </Clouds>
    </group>
  );
}