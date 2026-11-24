// src/ui/UserControls.jsx

import { useState } from "react";
import { useAnimationHub } from "../animation/AnimationHub";

import "./UserControls.css";

export default function UserControls() {
  const {
    morphNames,
    morphValues,
    setMorphValue,
    resetMorphValues,
    isAircraftReady,
  } = useAnimationHub();

  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={`wing-controls ${
        expanded ? "is-expanded" : "is-collapsed"
      }`}
    >
      <header className="wing-controls-header">
        <div>
          <span className="wing-controls-eyebrow">
            AIRCRAFT CONFIGURATION
          </span>

          <h2>Wing geometry</h2>
        </div>

        <button
          type="button"
          className="wing-controls-toggle"
          onClick={() =>
            setExpanded((value) => !value)
          }
          aria-expanded={expanded}
          aria-controls="wing-controls-content"
          aria-label={
            expanded
              ? "Hide wing controls"
              : "Show wing controls"
          }
        >
          {expanded ? "−" : "+"}
        </button>
      </header>

      {expanded && (
        <div id="wing-controls-content">
          {!isAircraftReady ? (
            <p className="wing-controls-status">
              Loading aircraft configuration...
            </p>
          ) : morphNames.length === 0 ? (
            <p className="wing-controls-status">
              No compatible wing morphs found.
            </p>
          ) : (
            <>
              <div className="wing-controls-sliders">
                {morphNames.map((name) => {
                  const value = morphValues[name] ?? 0;

                  return (
                    <label
                      className="wing-control"
                      key={name}
                    >
                      <div className="wing-control-label">
                        <span>{name}</span>

                        <span className="wing-control-value">
                          {Math.round(value * 100)}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={value}
                        onChange={(event) =>
                          setMorphValue(
                            name,
                            Number(event.target.value)
                          )
                        }
                      />
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                className="wing-controls-reset"
                onClick={resetMorphValues}
              >
                Reset configuration
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}