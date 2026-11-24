// src/model/twinstar/TwinStar.jsx

import { useEffect, useMemo, useRef } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import useAircraftMaterials from "./useAircraftMaterials";

import { useAnimationHub } from "../../animation/AnimationHub";

import Fuselage from "./parts/Fuselage";
import Interior from "./parts/Interior";
import Tail from "./parts/Tail";
import FrontEngine from "./parts/FrontEngine";

import ControlStick from "./parts/cockpit/ControlStick";

import CockpitDoor from "./parts/hinges/CockpitDoor";
import RearDoor from "./parts/hinges/RearDoor";
import NoseHatch from "./parts/hinges/NoseHatch";

import Wings from "./parts/wings/Wings";

const MODEL_URL =
  `${import.meta.env.BASE_URL}models/diamond-da42-twin-star3.glb`;

export function TwinStar(props) {
  const group = useRef();

  const { scene, animations } = useGLTF(MODEL_URL);

  // Create an independent model instance, including skeletons.
  const clone = useMemo(
    () => SkeletonUtils.clone(scene),
    [scene]
  );

  const {
    nodes,
    materials: originalMaterials,
  } = useGraph(clone);

  const materials = useAircraftMaterials(
    originalMaterials
  );

  // Prepare support for Blender animations.
  useAnimations(animations, group);

  const { refs, registerMorphTargets } = useAnimationHub();

  // Register aircraft animation references.
  useEffect(() => {
    if (!group.current) return;

    const get = (name) =>
      group.current.getObjectByName(name);

    const registered = {
      planeBody: get("plane_body"),

      leftProp: get("left_propellor"),
      rightProp: get("right_propellor"),

      cockpitCase: get("cockpit_window_case"),
      leftRearDoorWindow: get("left_rear_door_window"),
      rearSideDoor: get("rear_side_door"),

      noseHatchPivot: get("nose_Empty"),
      noseHatch: get("nose_hatch"),

      // New model references.
      frontEngine: get("engine"),
      controlStick: get("control_stick"),
      controlStickBone: get("Bone"),
      controlPanelSlider: get(
        "control_pannel_adjusting_slider"
      ),

      wings: {
        left: get("left_wing"),
        right: get("right_wing"),
      },
    };

    Object.assign(refs.current, registered);

    registerMorphTargets(
      registered.wings.left,
      registered.wings.right
    );

    // Clean up references when the aircraft unmounts.
    return () => {
      if (
        refs.current.planeBody === registered.planeBody
      ) {
        for (const key of Object.keys(registered)) {
          if (key === "wings") {
            refs.current.wings = {
              left: null,
              right: null,
            };
          } else {
            refs.current[key] = null;
          }
        }

        registerMorphTargets(null, null);
      }
    };
  }, [refs, registerMorphTargets, clone]);

  // Independent debugging effect.
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.groupCollapsed("TwinStar Model Diagnostics");

    console.table(
      animations.map((clip) => ({
        name: clip.name,
        duration: clip.duration,
        tracks: clip.tracks.length,
      }))
    );

    console.log(
      "Control stick bone:",
      nodes.Bone
    );

    console.log(
      "Left wing morph targets:",
      nodes.left_wing?.morphTargetDictionary
    );

    console.log(
      "Right wing morph targets:",
      nodes.right_wing?.morphTargetDictionary
    );

    console.groupEnd();
  }, [animations, nodes]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="plane_body">

          <Fuselage
            nodes={nodes}
            materials={materials}
          />

          <FrontEngine
            nodes={nodes}
            materials={materials}
          />

          <NoseHatch
            nodes={nodes}
            materials={materials}
          />

          <CockpitDoor
            nodes={nodes}
            materials={materials}
          />

          <RearDoor
            nodes={nodes}
            materials={materials}
          />

          <Interior
            nodes={nodes}
            materials={materials}
          />

          <ControlStick nodes={nodes} />

          <Tail
            nodes={nodes}
            materials={materials}
          />

          <Wings
            nodes={nodes}
            materials={materials}
          />

        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);