import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getStory } from '../services/api'
import EmotionStrip from '../components/EmotionStrip'

function PlayerFullScreen() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadStory()
  }, [id])

  const loadStory = async () => {
    const data = await getStory(id)
    setStory(data)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement actual audio playback
  }

  if (!story) return <div>Loading...</div>

  return (
    <div className="h-screen flex flex-col">
      <EmotionStrip sentimentData={story.sentiment_data} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold mb-8 text-center">{story.title}</h1>
        
        <button
          onClick={togglePlay}
          className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-3xl shadow-lg"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className="mt-8 text-center max-w-2xl">
          <p className="text-lg text-gray-700">{story.content}</p>
        </div>
      </div>
    </div>
  )
}

export default PlayerFullScreen

