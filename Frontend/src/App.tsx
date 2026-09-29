import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { LandingPage } from './components/LandingPage'

function App() {
  const [entered, setEntered] = useState(false)

  if (!entered) {
    return <LandingPage onContinue={() => setEntered(true)} />
  }

  return <Dashboard onBack={() => setEntered(false)} />
}

export default App
