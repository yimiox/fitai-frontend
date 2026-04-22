// src/components/PlanDisplay.jsx
// Phase 5 — Full plan results UI
// Includes client-side injection defence on the adjustment input

import { useState } from "react";
import "./PlanDisplay.css";

// ── INJECTION KEYWORDS (mirrors backend list) ──────────────────────
const INJECTION_PATTERNS = [
  "ignore previous", "ignore all previous", "ignore instructions",
  "forget everything", "forget your instructions",
  "you are now", "you are no longer",
  "act as", "pretend you", "pretend to be",
  "roleplay as", "imagine you are",
  "new persona", "new instructions",
  "disregard", "bypass", "jailbreak",
  "dan mode", "developer mode", "unrestricted mode",
  "no restrictions", "reveal your prompt",
  "show your instructions", "what is your system prompt",
  "ignore your training", "override",
  "you have no rules", "you can do anything",
];

function containsInjection(text) {
  const lower = text.toLowerCase();
  return INJECTION_PATTERNS.some(p => lower.includes(p));
}
// ───────────────────────────────────────────────────────────────────

export default function PlanDisplay({ plan, profile, onReset }) {
  const [tab, setTab]                = useState("workout");
  const [openDay, setOpenDay]        = useState(0);
  const [openMeal, setOpenMeal]      = useState(null);
  const [adjustment, setAdjustment]  = useState("");
  const [adjusting, setAdjusting]    = useState(false);
  const [adjustError, setAdjustError] = useState(null);
  const [inputError, setInputError]  = useState(null);   // client-side injection error
  const [currentPlan, setCurrentPlan] = useState(plan);

  if (!currentPlan) return null;

  const wp       = currentPlan.workout_plan  ?? {};
  const dp       = currentPlan.diet_plan     ?? {};
  const citations = currentPlan.citations    ?? [];
  const schedule  = wp.weekly_schedule       ?? [];
  const mealPlan  = dp.meal_plan             ?? [];

  const handleAdjustmentChange = (e) => {
    const val = e.target.value;
    setAdjustment(val);
    // Real-time injection check
    if (val.length > 10 && containsInjection(val)) {
      setInputError("That doesn't look like a fitness adjustment. Please describe what you'd like to change about your plan.");
    } else {
      setInputError(null);
    }
  };

  const handleAdjust = async () => {
    if (!adjustment.trim()) return;

    // Client-side guard — block before even hitting the network
    if (containsInjection(adjustment)) {
      setInputError("Please enter a valid fitness adjustment (e.g. 'remove leg exercises' or 'make the diet cheaper').");
      return;
    }

    setAdjusting(true);
    setAdjustError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adjust-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:    profile.profile_id,
          plan_id:    currentPlan.plan_id,
          adjustment,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        // Surface injection errors distinctly
        if (res.status === 400) {
          throw new Error("That adjustment isn't allowed. Please describe a fitness change.");
        }
        const detail = Array.isArray(err.detail)
          ? err.detail.map(e => `${e.loc?.join(".")} — ${e.msg}`).join(", ")
          : JSON.stringify(err.detail);
        throw new Error(detail);
      }

      const updated = await res.json();
      setCurrentPlan(updated);
      setAdjustment("");
      setOpenDay(0);

    } catch (err) {
      setAdjustError(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="pd-root">

      {/* ── HEADER ── */}
      <header className="pd-header">
        <span className="pd-logo">FITAI</span>
        <div className="pd-header-right">
          <span className="pd-badge">Plan ready</span>
          <button className="pd-ghost" onClick={onReset}>← Start over</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <div className="pd-hero">
        <p className="pd-eyebrow">Evidence-based · Research-backed</p>
        <h1 className="pd-title">Your personalised plan</h1>
        <div className="pd-stats">
          <Stat label="Training days"  value={`${wp.weekly_frequency ?? schedule.length}× / week`} />
          <Stat label="Daily calories" value={`${dp.daily_calories ?? "—"} kcal`} />
          <Stat label="Protein target" value={`${dp.macros?.protein_g ?? "—"}g / day`} />
          <Stat label="Citations"      value={`${citations.length} papers`} />
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pd-tabs">
        {["workout", "diet", "citations"].map(t => (
          <button
            key={t}
            className={`pd-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "workout" ? "Workout plan" : t === "diet" ? "Diet plan" : "Research"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          TAB: WORKOUT
      ══════════════════════════════ */}
      {tab === "workout" && (
        <div className="pd-section">
          {wp.progressive_overload_note && (
            <div className="pd-callout">
              <span className="pd-callout-icon">↑</span>
              {wp.progressive_overload_note}
            </div>
          )}
          <div className="pd-days">
            {schedule.map((day, i) => (
              <div key={i} className={`pd-day ${openDay === i ? "open" : ""}`}>
                <button className="pd-day-header" onClick={() => setOpenDay(openDay === i ? null : i)}>
                  <div className="pd-day-left">
                    <span className="pd-day-name">{day.day}</span>
                    <span className="pd-day-type">{day.session_type}</span>
                  </div>
                  <div className="pd-day-right">
                    <span className="pd-day-meta">{day.duration_mins} min</span>
                    <span className="pd-day-meta">{day.exercises?.length ?? 0} exercises</span>
                    <span className="pd-chevron">{openDay === i ? "−" : "+"}</span>
                  </div>
                </button>
                {openDay === i && (
                  <div className="pd-exercises">
                    {(day.exercises ?? []).map((ex, j) => (
                      <div key={j} className="pd-exercise">
                        <div className="pd-ex-num">{j + 1}</div>
                        <div className="pd-ex-body">
                          <p className="pd-ex-name">{ex.name}</p>
                          <div className="pd-ex-tags">
                            <span className="pd-tag">{ex.sets} sets</span>
                            <span className="pd-tag">{ex.reps} reps</span>
                            <span className="pd-tag">{ex.rest_secs}s rest</span>
                            {ex.citation_id && (
                              <span className="pd-tag pd-tag-cite" title={getCitationText(citations, ex.citation_id)}>
                                {ex.citation_id}
                              </span>
                            )}
                          </div>
                          {ex.notes && <p className="pd-ex-note">{ex.notes}</p>}
                          {ex.citation_warning && (
                            <p className="pd-ex-note" style={{ color: "var(--peach)" }}>⚠ {ex.citation_warning}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: DIET
      ══════════════════════════════ */}
      {tab === "diet" && (
        <div className="pd-section">
          <div className="pd-macros">
            <MacroBar label="Calories" value={dp.daily_calories}    unit="kcal" color="var(--amber)" max={4000} />
            <MacroBar label="Protein"  value={dp.macros?.protein_g} unit="g"    color="var(--teal)"  max={300} />
            <MacroBar label="Carbs"    value={dp.macros?.carbs_g}   unit="g"    color="var(--slate)" max={500} />
            <MacroBar label="Fat"      value={dp.macros?.fat_g}     unit="g"    color="var(--peach)" max={200} />
          </div>
          <div className="pd-days">
            {mealPlan.map((dayObj, i) => (
              <div key={i} className={`pd-day ${openMeal === i ? "open" : ""}`}>
                <button className="pd-day-header" onClick={() => setOpenMeal(openMeal === i ? null : i)}>
                  <div className="pd-day-left">
                    <span className="pd-day-name">{dayObj.day}</span>
                    <span className="pd-day-type">{dayObj.meals?.length ?? 0} meals</span>
                  </div>
                  <div className="pd-day-right">
                    <span className="pd-day-meta">
                      {dayObj.meals?.reduce((sum, m) => sum + (m.calories ?? 0), 0)} kcal
                    </span>
                    <span className="pd-chevron">{openMeal === i ? "−" : "+"}</span>
                  </div>
                </button>
                {openMeal === i && (
                  <div className="pd-exercises">
                    {(dayObj.meals ?? []).map((meal, j) => (
                      <div key={j} className="pd-exercise">
                        <div className="pd-meal-type">{meal.meal_type}</div>
                        <div className="pd-ex-body">
                          <p className="pd-ex-name">{meal.name}</p>
                          <div className="pd-ex-tags">
                            <span className="pd-tag">{meal.calories} kcal</span>
                            <span className="pd-tag">{meal.protein_g}g protein</span>
                            <span className="pd-tag pd-tag-budget">{meal.estimated_cost} cost</span>
                            <span className="pd-tag">{meal.prep_time_mins} min prep</span>
                            {meal.citation_id && (
                              <span className="pd-tag pd-tag-cite">{meal.citation_id}</span>
                            )}
                          </div>
                          {meal.ingredients && (
                            <p className="pd-ex-note">{meal.ingredients.join(" · ")}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {dp.shopping_list?.length > 0 && (
            <div className="pd-shopping">
              <h3 className="pd-shopping-title">Shopping list</h3>
              <div className="pd-shopping-grid">
                {dp.shopping_list.map((item, i) => (
                  <span key={i} className="pd-shopping-item">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          TAB: CITATIONS
      ══════════════════════════════ */}
      {tab === "citations" && (
        <div className="pd-section">
          {citations.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>No citations available.</p>
          ) : (
            <div className="pd-citations">
              {citations.map((c, i) => (
                <div key={i} className="pd-citation">
                  <div className="pd-cite-id">{c.citation_id}</div>
                  <div className="pd-cite-body">
                    <p className="pd-cite-title">{c.paper_title}</p>
                    {c.relevant_finding && (
                      <p className="pd-cite-finding">"{c.relevant_finding}"</p>
                    )}
                    {c.chunk_text && !c.relevant_finding && (
                      <p className="pd-cite-finding">"{c.chunk_text.slice(0, 280)}..."</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADJUST PLAN ── */}
      <div className="pd-adjust">
        <h3 className="pd-adjust-title">Adjust your plan</h3>
        <p className="pd-adjust-sub">
          Tell us what to change — no dumbbells, tighter budget, injured knee — and we'll regenerate.
        </p>
        <div className="pd-adjust-row">
          <div style={{ flex: 1 }}>
            <input
              className={`pd-adjust-input ${inputError ? "pd-input-error" : ""}`}
              placeholder="e.g. I don't have dumbbells, use bodyweight only"
              value={adjustment}
              onChange={handleAdjustmentChange}
              onKeyDown={e => e.key === "Enter" && !inputError && handleAdjust()}
              disabled={adjusting}
            />
            {inputError && (
              <p style={{ color: "var(--danger)", fontSize: 11, marginTop: 5, lineHeight: 1.4 }}>
                {inputError}
              </p>
            )}
          </div>
          <button
            className="pd-adjust-btn"
            onClick={handleAdjust}
            disabled={adjusting || !adjustment.trim() || !!inputError}
          >
            {adjusting ? "Updating…" : "Update plan"}
          </button>
        </div>

        {adjustError && (
          <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{adjustError}</p>
        )}

        <div className="pd-chips">
          {[
            "No dumbbells, bodyweight only",
            "Make the diet cheaper",
            "Shorter sessions — 30 mins max",
            "Add more protein",
            "Remove leg exercises",
          ].map(chip => (
            <button
              key={chip}
              className="pd-chip"
              onClick={() => { setAdjustment(chip); setInputError(null); }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {currentPlan.safety_disclaimer && (
        <div className="pd-disclaimer">
          ⚠ {currentPlan.safety_disclaimer}
        </div>
      )}
    </div>
  );
}

function getCitationText(citations, id) {
  const c = citations.find(c => c.citation_id === id);
  return c ? `${c.paper_title}: ${c.relevant_finding ?? ""}` : id;
}

function Stat({ label, value }) {
  return (
    <div className="pd-stat">
      <p className="pd-stat-val">{value}</p>
      <p className="pd-stat-label">{label}</p>
    </div>
  );
}

function MacroBar({ label, value, unit, color, max }) {
  const pct = Math.min(100, Math.round(((value ?? 0) / max) * 100));
  return (
    <div className="pd-macro">
      <div className="pd-macro-top">
        <span className="pd-macro-label">{label}</span>
        <span className="pd-macro-val">{value ?? "—"} {unit}</span>
      </div>
      <div className="pd-macro-track">
        <div className="pd-macro-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
