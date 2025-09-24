// src/model/twinstar/parts/wings/right/RightEngine.jsx
export default function RightEngine({ nodes, materials }) {
  return (
    <group name="right_engine">
      <mesh name="right_engine_1" geometry={nodes.right_engine_1.geometry} material={materials.engine} />
      <mesh name="right_engine_2" geometry={nodes.right_engine_2.geometry} material={materials.propellor} />
      <mesh name="right_propellor" geometry={nodes.right_propellor.geometry} material={materials["white propellor"]} position={[-4.185, 0.383, 3.874]} />
    </group>
  );
}
