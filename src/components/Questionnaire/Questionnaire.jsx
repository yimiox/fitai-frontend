// src/components/Questionnaire.jsx
// Multi-step questionnaire — 5 sections, animated transitions, full validation
import { useState, useEffect } from "react";
import "./Questionnaire.css";

import BioSection      from "./BioSection";
import EconomicSection from "./EconomicSection";
import GoalsSection    from "./GoalsSection";
import HealthSection   from "./HealthSection";
import LifestyleSection from "./LifestyleSection";

const SECTIONS = [
  { id: "bio",       label: "01 / Bio",       title: "Your body",       sub: "Basic physical stats" },
  { id: "economic",  label: "02 / Economic",  title: "Your resources",  sub: "Budget & equipment access" },
  { id: "goals",     label: "03 / Goals",     title: "Your targets",    sub: "What you want to achieve" },
  { id: "health",    label: "04 / Health",    title: "Your health",     sub: "Conditions & restrictions" },
  { id: "lifestyle", label: "05 / Lifestyle", title: "Your day",        sub: "Sleep, meals & schedule" },
];

const EMPTY = {
  // Bio
  age: "", sex: "", height_cm: "", weight_kg: "",
  // Economic
  monthly_food_budget: "", currency: "INR", equipment: "",
  // Goals
  primary_goal: "", experience_level: "", timeline_weeks: "",
  // Health
  conditions: [], injuries: [], diet_restrictions: [], allergies: "",
  // Lifestyle
  meals_per_day: "", cooking_time_mins: "", sleep_hours: "",
  work_type: "", stress_level: "",
};

export default function Questionnaire({ onSubmit }) {
  const [step, setStep]       = useState(0);
  const [data, setData]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [dir, setDir]         = useState("forward"); // animation direction

  // Update a field — called by child sections
  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = {...prev}; delete e[field]; return e; });
  };

  // Validate current step before advancing
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!data.age || data.age < 10 || data.age > 100) e.age = "Enter a valid age (10–100)";
      if (!data.sex) e.sex = "Required";
      if (!data.height_cm || data.height_cm < 100 || data.height_cm > 250) e.height_cm = "Enter height in cm (100–250)";
      if (!data.weight_kg || data.weight_kg < 30 || data.weight_kg > 300) e.weight_kg = "Enter weight in kg (30–300)";
    }
    if (step === 1) {
      if (!data.monthly_food_budget || data.monthly_food_budget < 1) e.monthly_food_budget = "Enter your monthly food budget";
      if (!data.equipment) e.equipment = "Required";
    }
    if (step === 2) {
      if (!data.primary_goal) e.primary_goal = "Required";
      if (!data.experience_level) e.experience_level = "Required";
      if (!data.timeline_weeks || data.timeline_weeks < 1) e.timeline_weeks = "Enter a goal timeline in weeks";
    }
    if (step === 4) {
      if (!data.meals_per_day || data.meals_per_day < 1) e.meals_per_day = "Required";
      if (!data.sleep_hours || data.sleep_hours < 3 || data.sleep_hours > 14) e.sleep_hours = "Enter sleep hours (3–14)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    setDir("forward");
    setStep(s => Math.min(s + 1, SECTIONS.length - 1));
  };

  const back = () => {
    setDir("back");
    setStep(s => Math.max(s - 1, 0));
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit(data);
  };

  const progress = ((step + 1) / SECTIONS.length) * 100;

  const sectionComponents = [
    <BioSection       data={data} update={update} errors={errors} />,
    <EconomicSection  data={data} update={update} errors={errors} />,
    <GoalsSection     data={data} update={update} errors={errors} />,
    <HealthSection    data={data} update={update} errors={errors} />,
    <LifestyleSection data={data} update={update} errors={errors} />,
  ];

  return (
    <div className="q-root">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="q-header">
        <div className="q-logo">FITAI</div>
        <div className="q-step-label">{SECTIONS[step].label}</div>
      </header>

      {/* ── Progress bar ────────────────────────────────────────── */}
      <div className="q-progress-track">
        <div className="q-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="q-section-header">
        <h1 className="q-section-title">{SECTIONS[step].title}</h1>
        <p className="q-section-sub">{SECTIONS[step].sub}</p>
      </div>

      {/* ── Form body ───────────────────────────────────────────── */}
      <main className="q-main" key={step} data-dir={dir}>
        {sectionComponents[step]}
      </main>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <footer className="q-footer">
        {step > 0
          ? <button className="btn-ghost" onClick={back}>← Back</button>
          : <div />
        }
        <div className="q-dots">
          {SECTIONS.map((_, i) => (
            <span key={i} className={`q-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
          ))}
        </div>
        {step < SECTIONS.length - 1
          ? <button className="btn-primary" onClick={next}>Continue →</button>
          : <button className="btn-primary" onClick={submit}>Generate my plan →</button>
        }
      </footer>
    </div>
  );
}
