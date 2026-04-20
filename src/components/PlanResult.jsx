// src/components/PlanResult.jsx
// Shows the computed profile card after submission
// (Full plan display comes in Stage 5 — this is the profile confirmation step)

import "./PlanResult.css";

export default function PlanResult({ profile, onReset }) {
  if (!profile) return null;
  const p = profile.computed;

  return (
    <div className="result-root">
      <header className="result-header">
        <div className="q-logo" style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--accent)", letterSpacing: "0.1em" }}>FITAI</div>
        <button className="btn-ghost" onClick={onReset} style={{ fontSize: 12 }}>← Start over</button>
      </header>

      <div className="result-hero">
        <p className="result-eyebrow">Your profile is ready</p>
        <h1 className="result-title">Here's what we know about you</h1>
      </div>

      <div className="result-grid">
        <MetricCard label="BMI"        value={p.bmi}              sub={p.bmi_category} />
        <MetricCard label="TDEE"       value={`${p.tdee} kcal`}   sub="daily energy need" />
        <MetricCard label="Target"     value={`${p.target_calories} kcal`} sub={`${p.calorie_direction} by ${Math.abs(p.calorie_delta)} kcal`} />
        <MetricCard label="Protein"    value={`${p.protein_g}g`}  sub="per day minimum" />
        <MetricCard label="Budget tier" value={p.budget_tier}     sub={`${p.currency} ${p.monthly_food_budget}/mo`} />
        <MetricCard label="Plan type"  value={p.goal_label}       sub={p.experience_level} />
      </div>

      <div className="result-section">
        <h2 className="result-section-title">Profile snapshot</h2>
        <table className="result-table">
          <tbody>
            {[
              ["Age",            `${profile.raw.age} years`],
              ["Sex",            profile.raw.sex],
              ["Height / Weight", `${profile.raw.height_cm} cm / ${profile.raw.weight_kg} kg`],
              ["Primary goal",   p.goal_label],
              ["Experience",     profile.raw.experience_level],
              ["Equipment",      profile.raw.equipment?.replace("_", " ")],
              ["Training days",  `${profile.raw.training_days_per_week || "not set"} / week`],
              ["Conditions",     (profile.raw.conditions?.filter(c => c !== "None").join(", ")) || "None"],
              ["Diet restrictions", (profile.raw.diet_restrictions?.filter(d => d !== "None").join(", ")) || "None"],
              ["Sleep",          `${profile.raw.sleep_hours} hrs / night`],
              ["Stress level",   `${profile.raw.stress_level || 5} / 10`],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="result-td-key">{k}</td>
                <td className="result-td-val">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="result-cta">
        <p className="result-cta-note">
          Your profile has been saved. The next step (Stage 4) generates your
          full workout + diet plan using the research paper evidence base.
        </p>
        <button className="btn-primary" style={{ opacity: 0.4, cursor: "not-allowed" }} disabled>
          Generate plan — coming in Stage 4
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-sub">{sub}</p>
    </div>
  );
}
