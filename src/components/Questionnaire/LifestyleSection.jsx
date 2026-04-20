// src/components/sections/LifestyleSection.jsx
// Section 5 — Sleep, meals, schedule, stress

export default function LifestyleSection({ data, update, errors }) {
  return (
    <div>
      <div className="field-row">
        <div className="field">
          <label className="field-label">Meals per day</label>
          <input
            type="number" className={`q-input ${errors.meals_per_day ? "error" : ""}`}
            placeholder="3" min={1} max={8}
            value={data.meals_per_day}
            onChange={e => update("meals_per_day", e.target.value)}
          />
          {errors.meals_per_day && <p className="field-error">{errors.meals_per_day}</p>}
        </div>

        <div className="field">
          <label className="field-label">Sleep per night</label>
          <div className="input-suffix-wrap">
            <input
              type="number" className={`q-input ${errors.sleep_hours ? "error" : ""}`}
              placeholder="7" min={3} max={14} step={0.5}
              value={data.sleep_hours}
              onChange={e => update("sleep_hours", e.target.value)}
            />
            <span className="input-suffix">hrs</span>
          </div>
          {errors.sleep_hours && <p className="field-error">{errors.sleep_hours}</p>}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Cooking time available per day</label>
        <div className="pill-group">
          {["< 15 min", "15–30 min", "30–60 min", "60 min+", "Meal prep weekly"].map(t => (
            <label key={t} className="pill-label">
              <input type="radio" name="cooking_time" value={t}
                checked={data.cooking_time_mins === t}
                onChange={() => update("cooking_time_mins", t)} />
              <span className="pill-btn">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="field-divider" />

      <div className="field">
        <label className="field-label">Job / activity type</label>
        <div className="pill-group">
          {[
            { val: "sedentary",  label: "Desk job" },
            { val: "light",      label: "Light activity" },
            { val: "moderate",   label: "On my feet" },
            { val: "active",     label: "Physical work" },
          ].map(({ val, label }) => (
            <label key={val} className="pill-label">
              <input type="radio" name="work_type" value={val}
                checked={data.work_type === val}
                onChange={() => update("work_type", val)} />
              <span className="pill-btn">{label}</span>
            </label>
          ))}
        </div>
        <p className="field-hint">Used to calculate your total daily energy expenditure (TDEE).</p>
      </div>

      <div className="field">
        <label className="field-label">
          Current stress level &nbsp;
          <span style={{ color: "var(--accent)", fontWeight: 500 }}>
            {data.stress_level || 5} / 10
          </span>
        </label>
        <input
          type="range" className="q-range"
          min={1} max={10} step={1}
          value={data.stress_level || 5}
          onChange={e => update("stress_level", parseInt(e.target.value))}
        />
        <div className="range-labels">
          <span>Very low</span>
          <span>Moderate</span>
          <span>Very high</span>
        </div>
        <p className="field-hint">Chronic stress raises cortisol and impacts recovery — we factor this in.</p>
      </div>

      <div className="field">
        <label className="field-label">When do you prefer to train?</label>
        <div className="pill-group">
          {["Morning (before 9am)", "Midday", "Evening (5–8pm)", "Late night", "No preference"].map(t => (
            <label key={t} className="pill-label">
              <input type="radio" name="training_time" value={t}
                checked={data.training_time === t}
                onChange={() => update("training_time", t)} />
              <span className="pill-btn">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Anything else we should know? (optional)</label>
        <textarea
          className="q-input" rows={3}
          style={{ resize: "vertical", fontFamily: "var(--mono)" }}
          placeholder="e.g. I travel for work, I have a wedding in 3 months, I used to play football..."
          value={data.notes || ""}
          onChange={e => update("notes", e.target.value)}
        />
      </div>
    </div>
  );
}
