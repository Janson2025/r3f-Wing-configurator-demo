// src/flight/useFlightInput.js

import { useEffect, useRef } from "react";

const CONTROL_KEYS = new Set([
  "KeyW",
  "KeyS",
  "KeyA",
  "KeyD",

  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",

  "Space",
]);

export default function useFlightInput(enabled = true) {
  const keys = useRef(new Set());

  useEffect(() => {
    if (!enabled) {
      keys.current.clear();
      return;
    }

    function handleKeyDown(event) {
      if (!CONTROL_KEYS.has(event.code)) return;

      const tag = event.target?.tagName;

      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(tag) ||
        event.target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      keys.current.add(event.code);
    }

    function handleKeyUp(event) {
      keys.current.delete(event.code);
    }

    function clearKeys() {
      keys.current.clear();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    document.addEventListener(
      "visibilitychange",
      clearKeys
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      window.removeEventListener(
        "blur",
        clearKeys
      );

      document.removeEventListener(
        "visibilitychange",
        clearKeys
      );

      clearKeys();
    };
  }, [enabled]);

  function readInput() {
    const pressed = keys.current;

    const axis = (positive, negative) =>
      Number(pressed.has(positive)) -
      Number(pressed.has(negative));

    return {
      // W and S: throttle adjustment
      throttle: axis("KeyW", "KeyS"),

      // Pull back to climb, push forward to descend
      pitch: axis("ArrowDown", "ArrowUp"),

      // Control stick left and right
      roll: axis("ArrowRight", "ArrowLeft"),

      // Rudder pedals
      yaw: axis("KeyD", "KeyA"),

      brake: pressed.has("Space"),
    };
  }

  return readInput;
}