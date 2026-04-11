// fetch('http://localhost:8000/health')
//    .then(r => r.json())
//    .then(d => console.log(d))

import { useEffect, useState } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState("Connecting to backend...")

  useEffect(() => {
    // This is the connection to your FastAPI server
    fetch('http://localhost:8000/health')
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend says:", data)
        setHealthStatus(data.healthy ? "Backend is Healthy! ✅" : "Backend issue ❌")
      })
      .catch((error) => {
        console.error("Error:", error)
        setHealthStatus("Cannot reach backend. Is the Python server running? ❌")
      })
  }, [])

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>FitAI Dashboard</h1>
      <p>Status: <strong>{healthStatus}</strong></p>
    </div>
  )
}

export default App
