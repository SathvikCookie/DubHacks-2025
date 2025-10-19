import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import StoriesList from './pages/StoriesList'
import StoryCreate from './pages/StoryCreate'
import PlayerFullScreen from './pages/PlayerFullScreen'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<StoriesList />} />
        <Route path="/create" element={<StoryCreate />} />
        <Route path="/player/:id" element={<PlayerFullScreen />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen animated-gradient-bg custom-scrollbar overflow-x-hidden">
        <AnimatedRoutes />
      </div>
    </Router>
  )
}

export default App
