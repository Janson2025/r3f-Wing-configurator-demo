// src/model/twinstar/parts/wings/left/LeftEngine.jsx
export default function LeftEngine({ nodes, materials }) {
  return (
    <group name="left_engine" rotation={[-Math.PI, 0, 0]} scale={-1}>
      <mesh name="left_engine_1" geometry={nodes.left_engine_1.geometry} material={materials.engine} />
      <mesh name="left_engine_2" geometry={nodes.left_engine_2.geometry} material={materials.propellor} />
      <mesh name="left_propellor" geometry={nodes.left_propellor.geometry} material={materials["white propellor"]} position={[4.158, 0.611, 3.874]} />
    </group>
  );
}
