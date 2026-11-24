// src/model/twinstar/useAircraftMaterials.js

import { useEffect, useMemo } from "react";

import { useFlight } from "../../flight/FlightContext";
import { FLIGHT_CONFIG } from "../../flight/flightConfig";

export default function useAircraftMaterials(materials) {
  const { mode, cameraMode } = useFlight();

  const windowMaterial = useMemo(() => {
    if (!materials.window) return null;

    const material = materials.window.clone();

    material.transparent = true;
    material.opacity =
      FLIGHT_CONFIG.windows.exteriorOpacity;

    material.depthWrite = false;
    material.alphaTest = 0;

    if ("transmission" in material) {
      material.transmission = 0;
    }

    material.needsUpdate = true;

    return material;
  }, [materials.window]);

  useEffect(() => {
    if (!windowMaterial) return;

    const cockpit =
      mode === "flight" &&
      cameraMode === "cockpit";

    windowMaterial.opacity = cockpit
      ? FLIGHT_CONFIG.windows.cockpitOpacity
      : FLIGHT_CONFIG.windows.exteriorOpacity;
  }, [windowMaterial, mode, cameraMode]);

  useEffect(() => {
    return () => {
      windowMaterial?.dispose();
    };
  }, [windowMaterial]);

  return useMemo(
    () => ({
      ...materials,
      window: windowMaterial ?? materials.window,
    }),
    [materials, windowMaterial]
  );
}