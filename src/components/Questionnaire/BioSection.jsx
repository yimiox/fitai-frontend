// src/components/sections/BioSection.jsx
// Section 1 — Age, sex, height, weight

export default function BioSection({ data, update, errors }) {
  return (
    <div>
      <div className="field-row">
        <div className="field">
          <label className="field-label">Age</label>
          <div className="input-suffix-wrap">
            <input
              type="number" className={`q-input ${errors.age ? "error" : ""}`}
              placeholder="28" min={10} max={100}
              value={data.age}
              onChange={e => update("age", e.target.value)}
            />
            <span className="input-suffix">yrs</span>
          </div>
          {errors.age && <p className="field-error">{errors.age}</p>}
        </div>

        <div className="field">
          <label className="field-label">Biological sex</label>
          <div className="pill-group">
            {["Male", "Female", "Other"].map(s => (
              <label key={s} className="pill-label">
                <input type="radio" name="sex" value={s}
                  checked={data.sex === s}
                  onChange={() => update("sex", s)} />
                <span className="pill-btn">{s}</span>
              </label>
            ))}
          </div>
          {errors.sex && <p className="field-error">{errors.sex}</p>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label">Height</label>
          <div className="input-suffix-wrap">
            <input
              type="number" className={`q-input ${errors.height_cm ? "error" : ""}`}
              placeholder="170" min={100} max={250}
              value={data.height_cm}
              onChange={e => update("height_cm", e.target.value)}
            />
            <span className="input-suffix">cm</span>
          </div>
          {errors.height_cm && <p className="field-error">{errors.height_cm}</p>}
        </div>

        <div className="field">
          <label className="field-label">Weight</label>
          <div className="input-suffix-wrap">
            <input
              type="number" className={`q-input ${errors.weight_kg ? "error" : ""}`}
              placeholder="70" min={30} max={300}
              value={data.weight_kg}
              onChange={e => update("weight_kg", e.target.value)}
            />
            <span className="input-suffix">kg</span>
          </div>
          {errors.weight_kg && <p className="field-error">{errors.weight_kg}</p>}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Body type (optional)</label>
        <div className="pill-group">
          {[
            { val: "ectomorph",  label: "Ectomorph — naturally lean, hard to gain" },
            { val: "mesomorph",  label: "Mesomorph — athletic, gains easily" },
            { val: "endomorph",  label: "Endomorph — stockier, gains fat easily" },
          ].map(({ val, label }) => (
            <label key={val} className="pill-label">
              <input type="radio" name="body_type" value={val}
                checked={data.body_type === val}
                onChange={() => update("body_type", val)} />
              <span className="pill-btn">{label}</span>
            </label>
          ))}
        </div>
        <p className="field-hint">Unsure? Leave it — we'll infer from your stats.</p>
      </div>
    </div>
  );
}
