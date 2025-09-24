// src/model/twinstar/parts/Interior.jsx
export default function Interior({ nodes, materials }) {
  return (
    <>
      <mesh name="control_pannel" geometry={nodes.control_pannel.geometry} material={materials.console} rotation={[0, 0, -0.027]} />
      <mesh name="front_seats" geometry={nodes.front_seats.geometry} material={materials.seatCushion} position={[0, 0, -0.205]} />
      <mesh name="rear_seats" geometry={nodes.rear_seats.geometry} material={materials.seatCushion} position={[0, 0, -3.194]} />
    </>
  );
}
