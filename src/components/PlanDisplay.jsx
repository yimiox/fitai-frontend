export default function PlanDisplay({ plan, profile, onReset }) {
  return (
    <div style={{ padding: 40, color: "var(--text)" }}>
      <h1>Plan generated!</h1>
      <pre style={{ fontSize: 12, overflow: "auto" }}>
        {JSON.stringify(plan, null, 2)}
      </pre>
      <button onClick={onReset}>Start over</button>
    </div>
  );
}