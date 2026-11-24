import { useState } from "react";
import { useAnimationHub } from "../animation/AnimationHub";

const positions = [
  ["seatedPosition", "Pilot seat position"],
  ["standingPosition", "Pilot idle position"],
  ["controlStickPosition", "Control stick position"],
  ["controlPanelPosition", "Control panel position"],
];

function AlignmentInput({ value, onChange, min, increment = 0.01 }) {
  const [draft, setDraft] = useState(null);

  return (
    <input
      type="number"
      step="any"
      min={min}
      value={draft ?? value}
      onChange={event => {
        const input = event.currentTarget;
        setDraft(input.value);
        if (Number.isFinite(input.valueAsNumber) && input.validity.valid) {
          onChange(input.valueAsNumber);
        }
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={event => {
        const direction = { ArrowUp: 1, ArrowDown: -1 }[event.key];
        if (!direction) return;
        event.preventDefault();
        const step = event.shiftKey ? increment * 10 : increment;
        const next = Number((value + direction * step).toFixed(4));
        onChange(Math.max(min ?? -Infinity, next));
        setDraft(null);
      }}
    />
  );
}

export default function CockpitAlignment() {
  const { alignment, setAlignment } = useAnimationHub();

  return (
    <details className="cockpit-alignment">
      <summary>Development · Cockpit alignment</summary>
      <p>Aircraft-local coordinates. +Z points toward the nose.</p>
      {positions.map(([name, label]) => (
        <fieldset key={name}>
          <legend>{label}</legend>
          <div className="cockpit-alignment-axes">
            {["X", "Y", "Z"].map((axis, index) => (
              <label key={axis}>
                {axis}
                <AlignmentInput
                  value={alignment[name][index]}
                  onChange={value => setAlignment(previous => ({
                    ...previous,
                    [name]: previous[name].map((coordinate, axisIndex) =>
                      axisIndex === index ? value : coordinate
                    ),
                  }))}
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label>
        Pilot scale
        <AlignmentInput
          min={0.01}
          value={alignment.scale}
          onChange={scale => setAlignment(previous => ({ ...previous, scale }))}
        />
      </label>
      <fieldset>
        <legend>Pilot pose</legend>
        {[
          ["seatRecline", "Seat recline (°)"],
          ["legSpread", "Leg spread per side (°)"],
          ["headTilt", "Head tilt up (°)"],
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <AlignmentInput
              increment={1}
              value={alignment[name]}
              onChange={value => setAlignment(previous => ({ ...previous, [name]: value }))}
            />
          </label>
        ))}
      </fieldset>
    </details>
  );
}
