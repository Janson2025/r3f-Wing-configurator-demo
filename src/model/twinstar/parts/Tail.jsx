// src/model/twinstar/parts/Tail.jsx
export default function Tail({ nodes, materials }) {
  return <mesh name="tail" geometry={nodes.tail.geometry} material={materials["tail.002"]} position={[0, 0, 2.661]} />;
}
