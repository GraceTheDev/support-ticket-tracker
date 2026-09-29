import { useState } from 'react'
import { LandingPage, type AppView } from './components/LandingPage'
import { LoggerPage } from './components/LoggerPage'
import { SupportDeskPage } from './components/SupportDeskPage'

function App() {
  const [view, setView] = useState<AppView>('home')

  if (view === 'logger') {
    return <LoggerPage onBack={() => setView('home')} />
  }

  if (view === 'support') {
    return <SupportDeskPage onBack={() => setView('home')} />
  }

  return <LandingPage onChoose={setView} />
}

export default App
