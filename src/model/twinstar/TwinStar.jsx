// src/model/twinstar/TwinStar.jsx
import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useAnimationHub } from "../../animation/AnimationHub";

import Fuselage from "./parts/Fuselage";
import Interior from "./parts/Interior";
import Tail from "./parts/Tail";

// moved under parts/hinges
import CockpitDoor from "./parts/hinges/CockpitDoor";
import RearDoor from "./parts/hinges/RearDoor";
import NoseHatch from "./parts/hinges/NoseHatch";

// moved under parts/wings
import Wings from "./parts/wings/Wings";

export function TwinStar(props) {
  const group = useRef();
  const { nodes, materials } = useGLTF("/models/diamond-da42-twin-star3.glb");
  const hub = useAnimationHub();

  useEffect(() => {
    if (!hub || !group.current) return;
    const get = (n) => group.current.getObjectByName(n);
    hub.refs.current.planeBody = get("plane_body");
    hub.refs.current.leftProp = get("left_propellor");
    hub.refs.current.rightProp = get("right_propellor");
    hub.refs.current.cockpitCase = get("cockpit_window_case");
    hub.refs.current.leftRearDoorWindow = get("left_rear_door_window");
    hub.refs.current.rearSideDoor = get("rear_side_door"); 
    hub.refs.current.noseHatchPivot = get("nose_Empty");       
    hub.refs.current.wings.left = get("left_wing");
    hub.refs.current.wings.right = get("right_wing");
  }, [hub]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="plane_body">
          <Fuselage nodes={nodes} materials={materials} />

          {/* Hinges */}
          <NoseHatch nodes={nodes} materials={materials} />
          <CockpitDoor nodes={nodes} materials={materials} />
          <RearDoor nodes={nodes} materials={materials} />

          {/* Other parts */}
          <Interior nodes={nodes} materials={materials} />
          <Tail nodes={nodes} materials={materials} />

          {/* Wings */}
          <Wings nodes={nodes} materials={materials} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/diamond-da42-twin-star3.glb");
