// src/ui/UserControls.jsx
import React, { useEffect, useState } from "react";
import { useAnimationHub } from "../animation/AnimationHub";

export default function UserControls() {
  const hub = useAnimationHub();
  const [morphNames, setMorphNames] = useState([]);

  useEffect(() => {
    const left = hub.refs.current.wings.left;
    if (left?.morphTargetDictionary) {
      setMorphNames(Object.keys(left.morphTargetDictionary));
    }
  }, [hub]);

  const setMorph = (name, v) => hub.setMorphValue(name, v);

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 1000,
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(16,16,20,0.65)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        width: 260,
      }}
    >
      {morphNames.length > 0 && (
        <>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Wing morphs
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {morphNames.map((name) => (
              <div key={name}>
                <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4 }}>{name}</div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={0}
                  onChange={(e) => setMorph(name, parseFloat(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
