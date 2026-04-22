// src/components/PlanDisplay.jsx
// Upgrade 3 — Chat thread UI with conversation memory

import { useState, useEffect, useRef } from "react";
import "./PlanDisplay.css";

const INJECTION_PATTERNS = [
  "ignore previous", "ignore all previous", "ignore instructions",
  "forget everything", "you are now", "act as", "pretend you",
  "jailbreak", "dan mode", "bypass", "override", "no restrictions",
];

function containsInjection(text) {
  return INJECTION_PATTERNS.some(p => text.toLowerCase().includes(p));
}

export default function PlanDisplay({ plan, profile, onReset }) {
  const [tab, setTab]                = useState("workout");
  const [openDay, setOpenDay]        = useState(0);
  const [openMeal, setOpenMeal]      = useState(null);
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [messages, setMessages]      = useState(plan.conversation ?? []);
  const [input, setInput]            = useState("");
  const [sending, setSending]        = useState(false);
  const [inputError, setInputError]  = useState(null);
  const [sendError, setSendError]    = useState(null);
  const chatBottomRef                = useRef(null);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  if (!currentPlan) return null;

  const wp        = currentPlan.workout_plan    ?? {};
  const dp        = currentPlan.diet_plan       ?? {};
  const citations = currentPlan.citations       ?? [];
  const reasoning = currentPlan.agent_reasoning ?? [];
  const stats     = currentPlan.retrieval_stats ?? {};
  const schedule  = wp.weekly_schedule          ?? [];
  const mealPlan  = dp.meal_plan                ?? [];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.length > 10 && containsInjection(val)) {
      setInputError("Please describe a fitness change for your plan.");
    } else {
      setInputError(null);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || inputError || sending) return;

    if (containsInjection(text)) {
      setInputError("Please enter a valid fitness adjustment.");
      return;
    }

    // Optimistically add user message to chat
    const userMsg = { role: "user", message: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setSendError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adjust-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:    profile.profile_id,
          plan_id:    currentPlan.plan_id,
          adjustment: text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 400) throw new Error("That adjustment isn't allowed.");
        throw new Error(JSON.stringify(err.detail));
      }

      const updated = await res.json();

      // Update plan and conversation
      setCurrentPlan(updated);
      setMessages(updated.conversation ?? [...messages, userMsg]);
      setOpenDay(0);

    } catch (err) {
      setSendError(err.message);
      // Remove optimistic user message on failure
      setMessages(prev => prev.filter(m => m !== userMsg));
    } finally {
      setSending(false);
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
        <p className="pd-eyebrow">Evidence-based · Research-backed · AI-powered</p>
        <h1 className="pd-title">Your personalised plan</h1>
        <div className="pd-stats">
          <Stat label="Training days"  value={`${wp.weekly_frequency ?? schedule.length}× / week`} />
          <Stat label="Daily calories" value={`${dp.daily_calories ?? "—"} kcal`} />
          <Stat label="Protein target" value={`${dp.macros?.protein_g ?? "—"}g / day`} />
          <Stat label="Papers cited"   value={`${citations.length} sources`} />
          {stats.tool_calls > 0 && <Stat label="Agent searches" value={`${stats.tool_calls} queries`} />}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pd-tabs">
        {["workout", "diet", "chat", "citations"].map(t => (
          <button
            key={t}
            className={`pd-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "workout"   ? "Workout"
             : t === "diet"    ? "Diet"
             : t === "chat"    ? `Chat${messages.length > 0 ? ` (${messages.length})` : ""}`
             : "Research"}
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
                              <span className="pd-tag pd-tag-cite"
                                title={getCitationText(citations, ex.citation_id)}>
                                {ex.citation_id}
                              </span>
                            )}
                          </div>
                          {ex.notes && <p className="pd-ex-note">{ex.notes}</p>}
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
                      {dayObj.meals?.reduce((s, m) => s + (m.calories ?? 0), 0)} kcal
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
                            {meal.citation_id && <span className="pd-tag pd-tag-cite">{meal.citation_id}</span>}
                          </div>
                          {meal.ingredients && <p className="pd-ex-note">{meal.ingredients.join(" · ")}</p>}
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
          TAB: CHAT  ← NEW
      ══════════════════════════════ */}
      {tab === "chat" && (
        <div className="pd-section">
          <div className="pd-chat">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="pd-chat-empty">
                <p>Ask me to adjust anything about your plan.</p>
                <p style={{ fontSize: 12, marginTop: 6 }}>
                  I'll remember everything you've asked across this conversation.
                </p>
              </div>
            )}

            {/* Message thread */}
            <div className="pd-chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`pd-chat-msg ${msg.role === "user" ? "pd-msg-user" : "pd-msg-ai"}`}
                >
                  <div className="pd-msg-role">
                    {msg.role === "user" ? "You" : "FitAI"}
                  </div>
                  <div className="pd-msg-text">{msg.message}</div>
                </div>
              ))}

              {/* Thinking indicator */}
              {sending && (
                <div className="pd-chat-msg pd-msg-ai">
                  <div className="pd-msg-role">FitAI</div>
                  <div className="pd-msg-text pd-thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick chips */}
            <div className="pd-chips" style={{ marginBottom: 12 }}>
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
                  onClick={() => { setInput(chip); setInputError(null); }}
                  disabled={sending}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="pd-chat-input-row">
              <div style={{ flex: 1 }}>
                <input
                  className={`pd-adjust-input ${inputError ? "pd-input-error" : ""}`}
                  placeholder="e.g. Remove all leg exercises, I have a knee injury"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={e => e.key === "Enter" && !inputError && handleSend()}
                  disabled={sending}
                />
                {inputError && (
                  <p style={{ color: "var(--danger)", fontSize: 11, marginTop: 4 }}>{inputError}</p>
                )}
              </div>
              <button
                className="pd-adjust-btn"
                onClick={handleSend}
                disabled={sending || !input.trim() || !!inputError}
              >
                {sending ? "Thinking…" : "Send"}
              </button>
            </div>

            {sendError && (
              <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{sendError}</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: CITATIONS + REASONING
      ══════════════════════════════ */}
      {tab === "citations" && (
        <div className="pd-section">
          {reasoning.length > 0 && (
            <div className="pd-reasoning">
              <h3 className="pd-reasoning-title">
                AI agent reasoning
                <span className="pd-reasoning-badge">{reasoning.length} decisions</span>
              </h3>
              <p className="pd-reasoning-sub">
                How the agent searched for your evidence.
              </p>
              <div className="pd-reasoning-steps">
                {reasoning.map((step, i) => (
                  <div key={i} className="pd-reasoning-step">
                    <div className="pd-reasoning-num">{i + 1}</div>
                    <p className="pd-reasoning-text">{step}</p>
                  </div>
                ))}
              </div>
              {stats.avg_similarity > 0 && (
                <div className="pd-reasoning-footer">
                  Avg relevance: <strong>{Math.round(stats.avg_similarity * 100)}%</strong>
                  &nbsp;·&nbsp; Chunks: <strong>{stats.chunks_used}</strong>
                </div>
              )}
            </div>
          )}

          <h3 className="pd-section-subtitle">Research citations</h3>
          <div className="pd-citations">
            {citations.map((c, i) => (
              <div key={i} className="pd-citation">
                <div className="pd-cite-id">{c.citation_id}</div>
                <div className="pd-cite-body">
                  <p className="pd-cite-title">{c.paper_title}</p>
                  {c.relevant_finding && <p className="pd-cite-finding">"{c.relevant_finding}"</p>}
                  {c.chunk_text && !c.relevant_finding && (
                    <p className="pd-cite-finding">"{c.chunk_text.slice(0, 280)}..."</p>
                  )}
                  {c.similarity && (
                    <p className="pd-cite-sim">Relevance: {Math.round(c.similarity * 100)}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentPlan.safety_disclaimer && (
        <div className="pd-disclaimer">⚠ {currentPlan.safety_disclaimer}</div>
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
