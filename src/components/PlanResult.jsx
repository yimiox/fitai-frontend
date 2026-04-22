// src/components/PlanResult.jsx
import { useState } from "react";
import "./PlanResult.css";

// Maps ALL possible questionnaire goal values to the 4 backend accepts
const GOAL_MAP = {
  "fat_loss":    "fat_loss",
  "muscle_gain": "muscle_gain",
  "endurance":   "endurance",
  "general":     "general",
  "recomp":      "recomp",   
  "strength":    "strength",
};

export default function PlanResult({ profile, onReset, onPlanGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  if (!profile) return null;
  const p = profile.computed;
  const r = profile.raw;

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);

    const goal = GOAL_MAP[r.primary_goal] ?? "general";
    console.log("raw primary_goal:", r.primary_goal, "→ mapped goal:", goal);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: profile.profile_id,
          profile: {
            age:       r.age,
            sex:       r.sex,
            height_cm: r.height_cm,
            weight_kg: r.weight_kg,
            bmi:       p.bmi,
            tdee:      p.tdee,
            goal:      goal,                              // ← mapped value, never raw
            experience:          r.experience_level,
            budget_tier:         p.budget_tier,
            monthly_food_budget: r.monthly_food_budget,
            equipment:            r.equipment,
            health_conditions:    r.conditions?.filter(c => c !== "None") ?? [],
            dietary_restrictions: r.diet_restrictions?.filter(d => d !== "None") ?? [],
            meals_per_day:        r.meals_per_day ?? 3,
            cooking_time_mins:    r.cooking_time_mins ?? 30,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        const detail = Array.isArray(err.detail)
          ? err.detail.map(e => `${e.loc?.join(".")} — ${e.msg}`).join(", ")
          : JSON.stringify(err.detail);
        throw new Error(detail);
      }

      const plan = await response.json();
      onPlanGenerated(plan);

    } catch (err) {
      console.error("Plan generation failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <MetricCard label="BMI"         value={p.bmi}                        sub={p.bmi_category} />
        <MetricCard label="TDEE"        value={`${p.tdee} kcal`}             sub="daily energy need" />
        <MetricCard label="Target"      value={`${p.target_calories} kcal`}  sub={`${p.calorie_direction} by ${Math.abs(p.calorie_delta)} kcal`} />
        <MetricCard label="Protein"     value={`${p.protein_g}g`}            sub="per day minimum" />
        <MetricCard label="Budget tier" value={p.budget_tier}                sub={`${p.currency} ${p.monthly_food_budget}/mo`} />
        <MetricCard label="Plan type"   value={p.goal_label}                 sub={p.experience_level} />
      </div>

      <div className="result-section">
        <h2 className="result-section-title">Profile snapshot</h2>
        <table className="result-table">
          <tbody>
            {[
              ["Age",               `${r.age} years`],
              ["Sex",               r.sex],
              ["Height / Weight",   `${r.height_cm} cm / ${r.weight_kg} kg`],
              ["Primary goal",      p.goal_label],
              ["Experience",        r.experience_level],
              ["Equipment",         r.equipment?.replace("_", " ")],
              ["Training days",     `${r.training_days_per_week || "not set"} / week`],
              ["Conditions",        (r.conditions?.filter(c => c !== "None").join(", ")) || "None"],
              ["Diet restrictions", (r.diet_restrictions?.filter(d => d !== "None").join(", ")) || "None"],
              ["Sleep",             `${r.sleep_hours} hrs / night`],
              ["Stress level",      `${r.stress_level || 5} / 10`],
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
          Your profile has been saved. Click below to generate your full
          workout + diet plan using the research paper evidence base.
        </p>

        {error && (
          <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>
            Error: {error}
          </p>
        )}

        <button
          className="btn-primary"
          onClick={handleGeneratePlan}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}
        >
          {loading ? "Generating your plan…" : "Generate plan"}
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
