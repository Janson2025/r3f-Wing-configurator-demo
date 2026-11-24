import { MathUtils } from 'three';
import { useFlight } from '../flight/FlightContext';
import { FLIGHT_CONFIG } from '../flight/flightConfig';
import { flightRings, ringBonus } from '../flight/courseRules';
import { coordinatedTurnRate } from '../aircraft/performance/calculatePerformance';
import './AircraftStatus.css';

function performanceRows(performance) {
  const { minSpeed, maxSpeed, acceleration, brakeDeceleration, verticalSpeed } = performance;
  const turnRate = speed => MathUtils.radToDeg(coordinatedTurnRate(FLIGHT_CONFIG.maxSteeringBank, speed));
  return [
    ['Airborne speed range', `${minSpeed.toFixed(1)}–${maxSpeed.toFixed(1)} u/s`],
    ['Full-bank turn range', `${turnRate(maxSpeed).toFixed(1)}–${turnRate(minSpeed).toFixed(1)} °/s`],
    ['Acceleration', `${acceleration.toFixed(1)} u/s²`],
    ['Wheel braking', `${brakeDeceleration.toFixed(1)} u/s²`],
    ['Assisted climb limit', `${verticalSpeed.toFixed(1)} u/s`],
  ];
}

function StatRows({ rows }) {
  return rows.map(([label, value]) => <div key={label}>{label}<b>{value}</b></div>);
}

export default function AircraftStatus() {
  const { mode, status, telemetry, performance } = useFlight();
  if (mode !== 'flight') return null;

  const t = telemetry;
  const fuel = MathUtils.clamp(t.fuelRemaining / t.fuelCapacity * 100, 0, 100);
  const rings = flightRings.filter((_, index) => t.collectedRings & (1 << index)).length;
  return (
    <aside className="aircraft-status">
      <h3>Aircraft status</h3>
      <div>Race fuel <b>{fuel.toFixed(0)}%</b></div>
      <progress max="100" value={fuel} aria-label="Race fuel remaining" />
      <small>{t.fuelRemaining.toFixed(2)} / {t.fuelCapacity.toFixed(2)} L</small>
      <StatRows rows={[
        ['Speed', `${t.speed.toFixed(1)} u/s`],
        ['Altitude', `${t.altitude.toFixed(1)} u`],
        ['Throttle', `${Math.round(t.throttle * 100)}%`],
        ['Fuel flow', `${t.fuelFlow.toFixed(1)} L/h`],
        ['Climb rate', `${t.verticalSpeed.toFixed(1)} u/s`],
        ['Bank', `${t.roll.toFixed(1)}°`],
        ['Path deviation', `${t.pathDeviation.toFixed(1)} u`],
      ]} />
      <div aria-live="polite">Ring bonus <b>{rings * ringBonus} pts ({rings}/{flightRings.length})</b></div>
      {status === 'flying' && t.corridorTimeLeft !== null && (
        <p className="flight-warning">Return to the corridor in {t.corridorTimeLeft.toFixed(1)} s</p>
      )}
      {status === 'flying' && fuel < 20 && <p className="flight-warning">LOW FUEL</p>}
      <hr />
      <h3>Configured limits</h3>
      <StatRows rows={performanceRows(performance)} />
    </aside>
  );
}

export function PerformancePreview() {
  const { predictedPerformance: p } = useFlight();
  return (
    <aside className="performance-preview">
      <h3>Estimated performance</h3>
      <small>Conceptual flight model</small>
      <StatRows rows={[
        ['Wing area', `${p.area.toFixed(1)} m²`],
        ['Race fuel', `${p.startingFuel.toFixed(2)} L`],
        ['Roll response', `${Math.round(p.rollResponse * 100)}%`],
        ['Tank estimate', `${p.fuelCapacity.toFixed(0)} L`],
        ...performanceRows(p),
      ]} />
    </aside>
  );
}
