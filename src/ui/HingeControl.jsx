// src/ui/HingeControl.jsx
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { useFlight } from "../flight/FlightContext";

export default function HingeControl({
  onClick,
  offset = [0, 0.2, 0],
  size = 12,                 // consider >= 10px for crispness & clickability
  distanceFactor = 20,
  fillOpacity = 0.35,
  strokeOpacity = 0.85,
  strokeWidth = 0.125,       // "px" in viewBox space; scaled below
  ariaLabel = "Toggle hinge",
  selected = false,

  // Colors as RGB triplets so we can keep alpha separate & consistent
  baseRGB = [255, 255, 255],     // idle (white)
  hoverRGB = [80, 200, 255],     // hover (cyan)
  activeRGB = [0, 160, 255],     // selected (blue)
}) {
  const [hovered, setHovered] = useState(false);
  const { mode } = useFlight();

  const rgb = selected ? activeRGB : hovered ? hoverRGB : baseRGB;
  const fill = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fillOpacity})`;
  const stroke = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${strokeOpacity})`;
  const svgStrokeWidth = strokeWidth * (100 / size); // keep stroke consistent across sizes

  if (mode === "flight") {
    return null;
  }

  return (
    <Html
      transform
      sprite
      distanceFactor={distanceFactor}
      position={offset}
      occlude={false}
      zIndexRange={[10, 0]}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMissed={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={ariaLabel}
        aria-pressed={selected}
        style={{
          padding: 0,
          width: size,
          height: size,
          border: "none",
          background: "transparent",
          display: "block",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{
            display: "block",
            shapeRendering: "geometricPrecision",
            textRendering: "geometricPrecision",
          }}
        >
          {/* Fill + base stroke */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill={fill}
            stroke={stroke}
            strokeWidth={svgStrokeWidth}
          />
          {/* Subtle outer ring on hover/selected (no scaling, stays sharp) */}
          {(hovered || selected) && (
            <circle
              cx="50"
              cy="50"
              r="49.5"
              fill="none"
              stroke={stroke}
              strokeWidth={svgStrokeWidth * 1.5}
              opacity={0.6}
            />
          )}
        </svg>
      </button>
    </Html>
  );
}
