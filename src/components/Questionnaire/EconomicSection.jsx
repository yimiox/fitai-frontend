// src/components/sections/EconomicSection.jsx
// Section 2 — Food budget, equipment access

const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AUD", "CAD", "SGD", "AED"];

const EQUIPMENT_OPTIONS = [
  { val: "full_gym",    label: "Full gym",        sub: "All machines, cables, free weights" },
  { val: "basic_gym",   label: "Basic gym",       sub: "Barbells, dumbbells, pull-up bar" },
  { val: "home_dumbs",  label: "Home + dumbbells", sub: "Some equipment at home" },
  { val: "bodyweight",  label: "Bodyweight only",  sub: "No equipment needed" },
];

export default function EconomicSection({ data, update, errors }) {
  return (
    <div>
      <div className="field">
        <label className="field-label">Monthly food budget</label>
        <p className="field-hint" style={{ marginBottom: 10 }}>
          How much do you typically spend on food per month?
        </p>
        <div className="budget-row">
          <select className="q-select" value={data.currency}
            onChange={e => update("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="input-suffix-wrap">
            <input
              type="number" className={`q-input ${errors.monthly_food_budget ? "error" : ""}`}
              placeholder="5000" min={1}
              value={data.monthly_food_budget}
              onChange={e => update("monthly_food_budget", e.target.value)}
            />
          </div>
        </div>
        {errors.monthly_food_budget && <p className="field-error">{errors.monthly_food_budget}</p>}
        <p className="field-hint">We use this to suggest affordable, practical meal options.</p>
      </div>

      <hr className="field-divider" />

      <div className="field">
        <label className="field-label">Equipment access</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EQUIPMENT_OPTIONS.map(({ val, label, sub }) => (
            <label key={val} className="pill-label" style={{ display: "block" }}>
              <input type="radio" name="equipment" value={val}
                checked={data.equipment === val}
                onChange={() => update("equipment", val)} />
              <span className="pill-btn" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 6, padding: "12px 16px" }}>
                <span>{label}</span>
                <span style={{ fontSize: 11, opacity: 0.5, textAlign: "right", maxWidth: 180 }}>{sub}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.equipment && <p className="field-error">{errors.equipment}</p>}
      </div>

      <hr className="field-divider" />

      <div className="field">
        <label className="field-label">Supplement budget (optional)</label>
        <div className="pill-group">
          {["None", "Basic (protein powder)", "Moderate (protein + creatine)", "Open"].map(s => (
            <label key={s} className="pill-label">
              <input type="radio" name="supplement_budget" value={s}
                checked={data.supplement_budget === s}
                onChange={() => update("supplement_budget", s)} />
              <span className="pill-btn">{s}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
