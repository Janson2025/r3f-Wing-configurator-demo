// src/flight/FlightContext.jsx

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import { FLIGHT_CONFIG } from "./flightConfig";

const FlightContext = createContext(null);

function createTelemetry(started = false) {
  return {
    speed: started ? FLIGHT_CONFIG.initialSpeed : 0,
    throttle: started ? FLIGHT_CONFIG.initialThrottle : 0,

    altitude: 0,
    lateralOffset: 0,
    verticalOffset: 0,

    pitch: 0,
    roll: 0,
    yaw: 0,

    verticalSpeed: 0,
    lateralSpeed: 0,

    braking: false,
    elapsedTime: 0,
  };
}

export function useFlight() {
  const context = useContext(FlightContext);

  if (!context) {
    throw new Error(
      "useFlight must be used inside FlightProvider"
    );
  }

  return context;
}

export default function FlightProvider({ children }) {
  // Application state
  const [mode, setMode] = useState("configure");
  const [status, setStatus] = useState("ready");

  // Camera state
  const [cameraMode, setCameraMode] =
    useState("external");

  // Flight session state
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(0);

  // Reactive flight data for the interface
  const [telemetry, setTelemetry] = useState(
    () => createTelemetry()
  );

  // Mutable Three.js aircraft reference
  const aircraftRef = useRef(null);

  // -----------------------------------------
  // Flight lifecycle
  // -----------------------------------------

  const startFlight = useCallback(() => {
    setProgress(0);
    setTelemetry(createTelemetry(true));

    setCameraMode("external");

    setSessionId((id) => id + 1);

    setMode("flight");
    setStatus("flying");
  }, []);

  const completeFlight = useCallback(() => {
    setProgress(1);

    setTelemetry((previous) => ({
      ...previous,
      speed: 0,
      throttle: 0,
      braking: false,
      verticalSpeed: 0,
      lateralSpeed: 0,
    }));

    setStatus("completed");
  }, []);

  const pauseFlight = useCallback(() => {
    setStatus((current) =>
      current === "flying" ? "paused" : current
    );
  }, []);

  const resumeFlight = useCallback(() => {
    setStatus((current) =>
      current === "paused" ? "flying" : current
    );
  }, []);

  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === "flying") return "paused";
      if (current === "paused") return "flying";

      return current;
    });
  }, []);

  const exitFlight = useCallback(() => {
    setStatus("ready");
    setMode("configure");

    setProgress(0);
    setTelemetry(createTelemetry());

    setCameraMode("external");
  }, []);

  // -----------------------------------------
  // Camera controls
  // -----------------------------------------

  const toggleCamera = useCallback(() => {
    setCameraMode((current) =>
      current === "external"
        ? "cockpit"
        : "external"
    );
  }, []);

  // -----------------------------------------
  // Context API
  // -----------------------------------------

  const value = useMemo(
    () => ({
      mode,
      status,
      cameraMode,

      progress,
      sessionId,
      telemetry,

      aircraftRef,

      isFlying: status === "flying",
      isPaused: status === "paused",
      isCompleted: status === "completed",

      startFlight,
      completeFlight,
      exitFlight,

      pauseFlight,
      resumeFlight,
      togglePause,

      toggleCamera,
      setCameraMode,

      setProgress,
      setTelemetry,
    }),
    [
      mode,
      status,
      cameraMode,

      progress,
      sessionId,
      telemetry,

      startFlight,
      completeFlight,
      exitFlight,

      pauseFlight,
      resumeFlight,
      togglePause,
      toggleCamera,
    ]
  );

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  );
}