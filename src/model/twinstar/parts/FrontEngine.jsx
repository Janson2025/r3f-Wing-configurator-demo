// src/model/twinstar/parts/FrontEngine.jsx

export default function FrontEngine({
  nodes,
  materials,
}) {
  return (
    <group
      name="engine"
      position={[0.192, 0.22, 6.857]}
      scale={0.5}
      userData={{ name: "engine" }}
    >
      <mesh
        name="engine_1"
        geometry={nodes.engine_1.geometry}
        material={materials.engine1}
      />

      <mesh
        name="engine_2"
        geometry={nodes.engine_2.geometry}
        material={materials.engine2}
      />
    </group>
  );
}