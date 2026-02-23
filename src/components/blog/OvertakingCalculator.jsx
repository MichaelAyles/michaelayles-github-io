import { useState, useMemo } from "react";

const COLORS = {
  bg: "var(--background)",
  surface: "var(--surface)",
  border: "var(--border)",
  text: "var(--text-primary)",
  textMuted: "var(--text-secondary)",
  textDim: "var(--text-dim)",
  accent: "#f97316",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

export default function OvertakingCalculator() {
  const [truckA, setTruckA] = useState(55.8);
  const [truckB, setTruckB] = useState(56.3);

  const calc = useMemo(() => {
    const faster = Math.max(truckA, truckB);
    const slower = Math.min(truckA, truckB);
    const differential = faster - slower;

    if (differential < 0.05) {
      return { differential: 0, overtakeTime: Infinity, overtakeDistance: 0, dailySaving: 0, shiftMiles: 0 };
    }

    // Truck length ~16.5m, plus safe gap before and after ~50m total manoeuvre distance
    const overtakeDistanceMiles = 50 / 1609.34; // ~50m in miles (truck length + pull-out + pull-in gaps)
    const overtakeDistanceMetres = 50;

    // Time = distance / relative speed
    // But we need the overtaking distance at the faster truck's speed
    // The faster truck needs to cover the truck length (16.5m) + safety gaps (~33.5m) relative to the slower truck
    const relativeSpeedMph = differential;
    const relativeSpeedMs = relativeSpeedMph * 0.44704;
    const passingDistanceM = 65; // truck length 16.5m + 25m gap before + 25m after
    const overtakeTimeSec = passingDistanceM / relativeSpeedMs;
    const fasterSpeedMs = faster * 0.44704;
    const distanceCoveredM = fasterSpeedMs * overtakeTimeSec;

    // Daily time saving: 10-hour shift at the speed differential
    const shiftHours = 10;
    const extraMiles = differential * shiftHours;

    // Time saved: those extra miles at the faster speed
    const timeSavedMinutes = (extraMiles / faster) * 60;

    return {
      differential: differential.toFixed(1),
      overtakeTimeSec: overtakeTimeSec.toFixed(0),
      distanceCoveredM: distanceCoveredM.toFixed(0),
      distanceCoveredMiles: (distanceCoveredM / 1609.34).toFixed(2),
      extraMilesPerDay: extraMiles.toFixed(1),
      timeSavedMinutes: timeSavedMinutes.toFixed(1),
    };
  }, [truckA, truckB]);

  const SliderRow = ({ label, value, onChange, id }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{
          fontFamily: mono,
          fontSize: 11,
          color: COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 14, color: COLORS.accent, fontWeight: 600 }}>
          {value.toFixed(1)} mph
        </span>
      </div>
      <input
        type="range"
        min={55.0}
        max={57.0}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>55.0</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>57.0</span>
      </div>
    </div>
  );

  const isSameSpeed = parseFloat(calc.differential) === 0;

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <SliderRow label="Truck A (being overtaken)" value={truckA} onChange={setTruckA} />
        <SliderRow label="Truck B (overtaking)" value={truckB} onChange={setTruckB} />
      </div>

      {isSameSpeed ? (
        <div style={{
          textAlign: "center",
          padding: 24,
          fontFamily: sans,
          fontSize: 14,
          color: COLORS.textMuted,
        }}>
          At the same speed, no overtake happens. Adjust the sliders so one truck is faster.
        </div>
      ) : (
        <>
          {/* Stat row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}>
            {[
              {
                value: `${calc.overtakeTimeSec}s`,
                label: "Time to overtake",
                color: parseFloat(calc.overtakeTimeSec) > 60 ? COLORS.red : COLORS.yellow,
              },
              {
                value: `${calc.distanceCoveredM}m`,
                label: "Distance during overtake",
                color: COLORS.blue,
              },
              {
                value: `${calc.differential} mph`,
                label: "Speed differential",
                color: COLORS.accent,
              },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: mono,
                  fontSize: 26,
                  fontWeight: 700,
                  color: stat.color,
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: COLORS.textMuted,
                  marginTop: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Daily context */}
          <div style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: mono,
                fontSize: 11,
                color: COLORS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}>Over a 10-hour shift</div>
              <div style={{
                fontFamily: mono,
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.green,
              }}>
                +{calc.extraMilesPerDay} miles
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: mono,
                fontSize: 11,
                color: COLORS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}>Time saved per shift</div>
              <div style={{
                fontFamily: mono,
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.green,
              }}>
                {calc.timeSavedMinutes} min
              </div>
            </div>
          </div>

          <div style={{
            fontFamily: sans,
            fontSize: 13,
            color: COLORS.textDim,
            marginTop: 16,
            lineHeight: 1.5,
          }}>
            {parseFloat(calc.overtakeTimeSec) > 60
              ? `At ${calc.differential} mph differential, the overtake takes ${calc.overtakeTimeSec} seconds — over a minute of blocking the outside lane. Annoying, but it gains the driver ${calc.extraMilesPerDay} extra miles across a working day.`
              : `At ${calc.differential} mph differential, the overtake completes in ${calc.overtakeTimeSec} seconds and gains ${calc.extraMilesPerDay} extra miles per shift.`
            }
          </div>
        </>
      )}
    </div>
  );
}
