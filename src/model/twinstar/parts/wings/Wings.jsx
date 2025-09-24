// src/model/twinstar/parts/wings/Wings.jsx
import LeftWing from "./left/LeftWing";
import RightWing from "./right/RightWing";

export default function Wings({ nodes, materials }) {
  return (
    <>
      <LeftWing nodes={nodes} materials={materials} />
      <RightWing nodes={nodes} materials={materials} />
    </>
  );
}
