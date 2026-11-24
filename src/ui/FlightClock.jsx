// src/ui/FlightClock.jsx

import { useFlight } from "../flight/FlightContext";
import "./FlightClock.css";

export function formatFlightTime(time = 0) {
  const totalCentiseconds = Math.floor(
    Math.max(0, time) * 100
  );

  const minutes = Math.floor(
    totalCentiseconds / 6000
  );

  const seconds =
    Math.floor(totalCentiseconds / 100) % 60;

  const centiseconds = totalCentiseconds % 100;

  return [
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":") +
    "." +
    String(centiseconds).padStart(2, "0");
}

export default function FlightClock() {
  const { mode, status, telemetry } = useFlight();

  if (mode !== "flight") return null;

  return (
    <aside className="flight-clock">
      <span className="flight-clock-label">
        {status === "paused"
          ? "FLIGHT PAUSED"
          : status === "completed"
            ? "FINAL TIME"
            : status === "failed"
              ? "FLIGHT FAILED"
              : "FLIGHT TIME"}
      </span>

      <strong className="flight-clock-time">
        {formatFlightTime(telemetry.elapsedTime)}
      </strong>
    </aside>
  );
}