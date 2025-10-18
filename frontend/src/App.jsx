import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import StoriesList from './pages/StoriesList'
import StoryCreate from './pages/StoryCreate'
import PlayerFullScreen from './pages/PlayerFullScreen'
import { StoriesProvider } from './context/StoriesContext'

function App() {
  return (
    <StoriesProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <Routes>
            <Route path="/" element={<StoriesList />} />
            <Route path="/create" element={<StoryCreate />} />
            <Route path="/player/:id" element={<PlayerFullScreen />} />
          </Routes>
        </div>
      </Router>
    </StoriesProvider>
  )
}

export default App
