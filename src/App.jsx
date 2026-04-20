// src/App.jsx
import { useState } from "react";
import Questionnaire from "./components/Questionnaire/Questionnaire";
import PlanResult from "./components/PlanResult";
import "./App.css";

export default function App() {
  const [phase, setPhase] = useState("questionnaire"); // "questionnaire" | "loading" | "result"
  const [planData, setPlanData] = useState(null);

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

  return (
    <div className="app-root">
      {phase === "questionnaire" && <Questionnaire onSubmit={handleSubmit} />}
      {phase === "loading" && <LoadingScreen />}
      {phase === "result" && <PlanResult profile={planData} onReset={() => setPhase("questionnaire")} />}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-pulse" />
      <p className="loading-text">Analysing your profile & retrieving research…</p>
    </div>
  );
}
