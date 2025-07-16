import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <Router>
        <div className="flex h-screen">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
          <CopilotSidebar 
            instructions="You are a content optimization assistant. Help users transform their long-form content into platform-specific social media posts. You can rewrite content in different tones, optimize for different platforms like Twitter, LinkedIn, and email, and provide engagement suggestions."
            defaultOpen={false}
          />
        </div>
      </Router>
    </CopilotKit>
  )
}

export default App
