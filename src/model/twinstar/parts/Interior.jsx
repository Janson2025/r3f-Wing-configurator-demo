// src/model/twinstar/parts/Interior.jsx

import ControlPanel from "./cockpit/ControlPanel";

export default function Interior({ nodes, materials }) {
  return (
    <>
      <ControlPanel
        nodes={nodes}
        materials={materials}
      />

      <mesh
        name="front_seats"
        geometry={nodes.front_seats.geometry}
        material={materials.seatCushion}
        position={[0, 0, -0.205]}
      />

      <mesh
        name="rear_seats"
        geometry={nodes.rear_seats.geometry}
        material={materials.seatCushion}
        position={[0, 0, -3.194]}
      />
    </>
  );
}