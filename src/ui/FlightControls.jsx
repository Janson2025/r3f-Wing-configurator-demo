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
    telemetry,

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
        <button
          className="flight-button primary"
          onClick={startFlight}
        >
          Start Flight
        </button>
      ) : (
        <>
          <div className="flight-status">
            <span>
                {status === "completed"
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

          <div className="flight-throttle">
            <div className="flight-throttle-label">
                <span>Throttle</span>

                <strong>
                {Math.round(telemetry.throttle * 100)}%
                </strong>
            </div>

            <div
                className="flight-throttle-track"
                role="progressbar"
                aria-label="Engine throttle"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(
                telemetry.throttle * 100
                )}
            >
                <div
                className="flight-throttle-fill"
                style={{
                    width: `${telemetry.throttle * 100}%`,
                }}
                />
            </div>
            </div>

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

            {status !== "completed" && (
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