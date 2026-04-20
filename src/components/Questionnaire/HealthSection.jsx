// src/components/sections/HealthSection.jsx
// Section 4 — Conditions, injuries, dietary restrictions

const CONDITIONS = [
  "Type 2 diabetes", "Hypertension", "High cholesterol",
  "Hypothyroidism", "PCOS", "Asthma", "Arthritis",
  "Obesity (clinically diagnosed)", "Heart disease", "None",
];

const INJURIES = [
  "Lower back pain", "Knee issues", "Shoulder impingement",
  "Hip pain", "Wrist/elbow pain", "Neck issues", "None",
];

const DIET_RESTRICTIONS = [
  "Vegetarian", "Vegan", "Pescatarian",
  "Gluten-free", "Dairy-free", "Halal", "Kosher",
  "Keto", "Low-FODMAP", "None",
];

function MultiSelect({ options, field, data, update, noneVal = "None" }) {
  const selected = data[field] || [];

  const toggle = (val) => {
    if (val === noneVal) {
      update(field, selected.includes(noneVal) ? [] : [noneVal]);
      return;
    }
    const without = selected.filter(v => v !== noneVal);
    if (without.includes(val)) {
      update(field, without.filter(v => v !== val));
    } else {
      update(field, [...without, val]);
    }
  };

  return (
    <div className="pill-group">
      {options.map(opt => (
        <label key={opt} className="pill-label">
          <input type="checkbox" checked={selected.includes(opt)}
            onChange={() => toggle(opt)} />
          <span className="pill-btn">{opt}</span>
        </label>
      ))}
    </div>
  );
}

export default function HealthSection({ data, update, errors }) {
  return (
    <div>
      <div className="field">
        <label className="field-label">Medical conditions</label>
        <p className="field-hint" style={{ marginBottom: 10 }}>
          Select all that apply. This lets us avoid contraindicated exercises and foods.
        </p>
        <MultiSelect options={CONDITIONS} field="conditions" data={data} update={update} />
      </div>

      <hr className="field-divider" />

      <div className="field">
        <label className="field-label">Injuries or pain areas</label>
        <MultiSelect options={INJURIES} field="injuries" data={data} update={update} />
      </div>

      <hr className="field-divider" />

      <div className="field">
        <label className="field-label">Dietary restrictions</label>
        <MultiSelect options={DIET_RESTRICTIONS} field="diet_restrictions" data={data} update={update} />
      </div>

      <hr className="field-divider" />

      <div className="field">
        <label className="field-label">Food allergies or intolerances (optional)</label>
        <input
          type="text" className="q-input"
          placeholder="e.g. peanuts, shellfish, soy..."
          value={data.allergies || ""}
          onChange={e => update("allergies", e.target.value)}
        />
        <p className="field-hint">Free-text — be as specific as you like.</p>
      </div>

      <div className="field">
        <label className="field-label">Currently taking medication? (optional)</label>
        <div className="pill-group">
          {["No", "Yes — affects metabolism", "Yes — affects training"].map(m => (
            <label key={m} className="pill-label">
              <input type="radio" name="medication" value={m}
                checked={data.medication === m}
                onChange={() => update("medication", m)} />
              <span className="pill-btn">{m}</span>
            </label>
          ))}
        </div>
        <p className="field-hint">We don't store medication names — just the impact category.</p>
      </div>
    </div>
  );
}
