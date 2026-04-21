// src/App.jsx
import { useState } from "react";
import Questionnaire from "./components/Questionnaire/Questionnaire";
import PlanResult from "./components/PlanResult";
import PlanDisplay from "./components/PlanDisplay";   // Stage 5 — create this next
import "./App.css";

export default function App() {
  const [phase, setPhase]     = useState("questionnaire"); // "questionnaire" | "loading" | "result" | "plan" | "generating"
  const [planData, setPlanData] = useState(null);
  const [plan, setPlan]         = useState(null);

  const handleSubmit = async (formData) => {
    setPhase("loading");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Profile build failed");
      const profile = await res.json();
      setPlanData(profile);
      setPhase("result");
    } catch (err) {
      alert("Something went wrong: " + err.message);
      setPhase("questionnaire");
    }
  };

  const handleGeneratePlan = async (generatedPlan) => {
    setPlan(generatedPlan);
    setPhase("plan");
  };

  return (
    <div className="app-root">
      {phase === "questionnaire" && (
        <Questionnaire onSubmit={handleSubmit} />
      )}
      {phase === "loading" && (
        <LoadingScreen message="Analysing your profile & retrieving research…" />
      )}
      {phase === "result" && (
        <PlanResult
          profile={planData}
          onReset={() => setPhase("questionnaire")}
          onPlanGenerated={handleGeneratePlan}
        />
      )}
      {phase === "generating" && (
        <LoadingScreen message="Generating your personalised plan from research papers…" />
      )}
      {phase === "plan" && (
        <PlanDisplay
          plan={plan}
          profile={planData}
          onReset={() => setPhase("questionnaire")}
        />
      )}
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <div className="loading-screen">
      <div className="loading-pulse" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
