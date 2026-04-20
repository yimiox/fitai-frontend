// src/components/sections/GoalsSection.jsx
// Section 3 — Primary goal, experience level, timeline

const GOALS = [
  { val: "fat_loss",    icon: "↓", label: "Fat loss",    sub: "Reduce body fat, stay lean" },
  { val: "muscle_gain", icon: "↑", label: "Muscle gain", sub: "Build size and strength" },
  { val: "endurance",   icon: "→", label: "Endurance",   sub: "Cardio, stamina, aerobic fitness" },
  { val: "recomp",      icon: "⇄", label: "Recomposition", sub: "Lose fat while gaining muscle" },
  { val: "general",     icon: "◎", label: "General health", sub: "Overall fitness and wellbeing" },
  { val: "strength",    icon: "▲", label: "Pure strength", sub: "Maximise lifts (powerlifting focus)" },
];

const EXPERIENCE = [
  { val: "beginner",     label: "Beginner",     sub: "< 1 year of consistent training" },
  { val: "intermediate", label: "Intermediate", sub: "1–3 years, know the basics" },
  { val: "advanced",     label: "Advanced",     sub: "3+ years, structured programming" },
];

export default function GoalsSection({ data, update, errors }) {
  return (
    <div>
      <div className="field">
        <label className="field-label">Primary goal</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GOALS.map(({ val, icon, label, sub }) => (
            <label key={val} className="pill-label" style={{ display: "block" }}>
              <input type="radio" name="primary_goal" value={val}
                checked={data.primary_goal === val}
                onChange={() => update("primary_goal", val)} />
              <span className="pill-btn" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", borderRadius: 6, padding: "12px 14px", gap: 3 }}>
                <span style={{ fontSize: 16 }}>{icon} {label}</span>
                <span style={{ fontSize: 11, opacity: 0.5, lineHeight: 1.3 }}>{sub}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.primary_goal && <p className="field-error">{errors.primary_goal}</p>}
      </div>

      <div className="field">
        <label className="field-label">Experience level</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EXPERIENCE.map(({ val, label, sub }) => (
            <label key={val} className="pill-label" style={{ display: "block" }}>
              <input type="radio" name="experience_level" value={val}
                checked={data.experience_level === val}
                onChange={() => update("experience_level", val)} />
              <span className="pill-btn" style={{ display: "flex", justifyContent: "space-between", borderRadius: 6, padding: "12px 16px" }}>
                <span>{label}</span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>{sub}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.experience_level && <p className="field-error">{errors.experience_level}</p>}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label">Goal timeline</label>
          <div className="input-suffix-wrap">
            <input
              type="number" className={`q-input ${errors.timeline_weeks ? "error" : ""}`}
              placeholder="12" min={2} max={104}
              value={data.timeline_weeks}
              onChange={e => update("timeline_weeks", e.target.value)}
            />
            <span className="input-suffix">wks</span>
          </div>
          {errors.timeline_weeks && <p className="field-error">{errors.timeline_weeks}</p>}
        </div>

        <div className="field">
          <label className="field-label">Training days / week</label>
          <div className="input-suffix-wrap">
            <input
              type="number" className="q-input"
              placeholder="4" min={1} max={7}
              value={data.training_days_per_week}
              onChange={e => update("training_days_per_week", e.target.value)}
            />
            <span className="input-suffix">days</span>
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Workout duration preference</label>
        <div className="pill-group">
          {["< 30 min", "30–45 min", "45–60 min", "60–90 min", "90 min+"].map(d => (
            <label key={d} className="pill-label">
              <input type="radio" name="workout_duration" value={d}
                checked={data.workout_duration === d}
                onChange={() => update("workout_duration", d)} />
              <span className="pill-btn">{d}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
