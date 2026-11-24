import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Quaternion, Vector3 } from 'three';
import { flightRings } from './courseRules';
import { useFlight } from './FlightContext';

const torusNormal = new Vector3(0, 0, 1);

export default function FlightCourse() {
  const { status, telemetry, simulationTime } = useFlight();
  const warning = useRef(null);
  const orientations = useMemo(() => flightRings.map(({ normal }) =>
    new Quaternion().setFromUnitVectors(torusNormal, normal)
  ), []);

  useFrame(() => {
    const active = status === 'flying' && telemetry.corridorTimeLeft !== null;
    if (!warning.current) return;
    warning.current.intensity = active
      ? 0.9 + 0.65 * Math.cos(simulationTime.current * 4 * Math.PI)
      : 0;
  });

  return (
    <>
      <ambientLight ref={warning} color="#ff2525" intensity={0} />
      {flightRings.map(({ center, radius }, index) => (
        <mesh
          key={index}
          position={center}
          quaternion={orientations[index]}
          visible={(telemetry.collectedRings & (1 << index)) === 0}
        >
          <torusGeometry args={[radius + 0.35, 0.35, 8, 64]} />
          <meshBasicMaterial color="#ffc45a" />
        </mesh>
      ))}
    </>
  );
}
