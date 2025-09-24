// src/model/twinstar/parts/Fuselage.jsx
export default function Fuselage({ nodes, materials }) {
  return (
    <>
      <mesh name="body" geometry={nodes.body.geometry} material={materials["body.001"]} />
      <mesh name="body_1" geometry={nodes.body_1.geometry} material={materials["body white"]} />
    </>
  );
}
