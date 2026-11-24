// src/ui/FlightControls.jsx

import { useEffect } from "react";
import { useFlight } from "../flight/FlightContext";
import { useAnimationHub } from "../animation/AnimationHub";

import "./FlightControls.css";

export default function FlightControls() {
  const {
    mode,
    status,
    cameraMode,
    progress,
    telemetry, autoPathFollowing, setAutoPathFollowing, showGhostAircraft, setShowGhostAircraft, failureReason,

    showFlightPath,
    setShowFlightPath,
    startFlight,
    exitFlight,
    toggleCamera,
    togglePause,
    setCameraMode,
    } = useFlight();

  useEffect(() => {
    function handleKeyDown(event) {
        if (mode !== "flight" || event.repeat) {
        return;
        }

        const tag = event.target?.tagName;

        if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(tag) ||
        event.target?.isContentEditable
        ) {
        return;
        }

        switch (event.code) {
        case "KeyC":
            event.preventDefault();
            toggleCamera();
            break;

        case "KeyP":
            event.preventDefault();
            togglePause();
            break;

        case "Escape":
            event.preventDefault();
            exitFlight();
            break;

        default:
            break;
        }
    }

    window.addEventListener(
        "keydown",
        handleKeyDown
    );

    return () => {
        window.removeEventListener(
        "keydown",
        handleKeyDown
        );
    };
    }, [
    mode,
    toggleCamera,
    togglePause,
    exitFlight,
    ]);

  const hub = useAnimationHub();
  const percentage = Math.round(progress * 100);

  return (
    <section className="flight-controls">
      <header className="flight-heading">
        <span className="flight-eyebrow">
          TWINSTAR
        </span>

        <h1>Flight Lab</h1>

        <p>
          Aircraft configuration & simulation
        </p>
      </header>

      {mode === "configure" ? (
        <>
        <div className="flight-options"><label><input type="checkbox" checked={autoPathFollowing} onChange={e=>setAutoPathFollowing(e.target.checked)}/> Auto path following</label><label><input type="checkbox" checked={showGhostAircraft} onChange={e=>setShowGhostAircraft(e.target.checked)}/> Shadow aircraft</label></div>
        <button
          className="flight-button primary"
          onClick={startFlight}
          disabled={!hub.isAircraftReady}
        >
          {hub.isAircraftReady ? "Start Flight" : "Loading aircraft…"}
        </button>
        </>
      ) : (
        <>
          <div className="flight-status">
            <span>
                {status === "failed" ? "Flight failed" : status === "completed"
                ? "Flight completed"
                : status === "paused"
                    ? "Flight paused"
                    : "Flight in progress"}
            </span>

            <strong>{percentage}%</strong>
          </div>

          <div
            className="flight-progress"
            role="progressbar"
            aria-label="Flight progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div
              className="flight-progress-fill"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          <div className="flight-options">
            <label><input type="checkbox" checked={autoPathFollowing} onChange={e=>{setAutoPathFollowing(e.target.checked);e.target.blur();}}/> Auto path following</label>
            <label><input type="checkbox" checked={showGhostAircraft} onChange={e=>{setShowGhostAircraft(e.target.checked);e.target.blur();}}/> Shadow aircraft</label>
          </div>
          <button
            type="button"
            className="flight-button"
            aria-pressed={showFlightPath}
            onClick={() => setShowFlightPath(visible => !visible)}
          >
            Flight path {showFlightPath ? "on" : "off"}
          </button>
          {failureReason && status === "failed" && <p className="flight-warning">{failureReason}</p>}
          <div className="flight-camera-controls">
            <button
              className={`flight-button ${
                cameraMode === "external"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setCameraMode("external")
              }
              aria-pressed={
                cameraMode === "external"
              }
            >
              Aircraft
            </button>

            <button
              className={`flight-button ${
                cameraMode === "cockpit"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setCameraMode("cockpit")
              }
              aria-pressed={
                cameraMode === "cockpit"
              }
            >
              Cockpit
            </button>
          </div>

          <div className="flight-actions">

            {status !== "completed" && status !== "failed" && (
                <button
                    className="flight-button flight-pause-button"
                    onClick={togglePause}
                >
                    {status === "paused"
                    ? "Resume Flight"
                    : "Pause Flight"}
                </button>
            )}

            <button
              className="flight-button"
              onClick={startFlight}
            >
              Restart
            </button>

            <button
              className="flight-button"
              onClick={exitFlight}
            >
              Exit Flight
            </button>
          </div>

          <div className="flight-keyboard-hint">
            <div><kbd>W</kbd> Throttle up</div>
            <div><kbd>S</kbd> Throttle down</div>

            <div><kbd>A</kbd> Rudder left</div>
            <div><kbd>D</kbd> Rudder right</div>

            <div><kbd>↑</kbd> Pitch down</div>
            <div><kbd>↓</kbd> Pitch up</div>

            <div><kbd>←</kbd> Roll left</div>
            <div><kbd>→</kbd> Roll right</div>

            <div><kbd>Space</kbd> Brake</div>
            <div><kbd>C</kbd> Camera</div>

            <div><kbd>P</kbd> Pause</div>
            <div><kbd>Esc</kbd> Exit</div>
          </div>
        </>
      )}
    </section>
  );
}