import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StoriesList from './pages/StoriesList'
import StoryCreate from './pages/StoryCreate'
import PlayerFullScreen from './pages/PlayerFullScreen'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<StoriesList />} />
          <Route path="/create" element={<StoryCreate />} />
          <Route path="/player/:id" element={<PlayerFullScreen />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
