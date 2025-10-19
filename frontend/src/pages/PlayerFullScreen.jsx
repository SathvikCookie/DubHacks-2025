import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStories } from '../context/StoriesContext'
import EmotionStrip from '../components/EmotionStrip'
import AudioControls from '../components/AudioControls'

function PlayerFullScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getStory } = useStories()
  const [story, setStory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentEmotion, setCurrentEmotion] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const foundStory = getStory(id)
    if (foundStory) {
      setStory(foundStory)
      if (foundStory.sentiment_data && foundStory.sentiment_data.length > 0) {
        setCurrentEmotion(foundStory.sentiment_data[0])
      }
    } else {
      navigate('/')
    }
  }, [id, getStory, navigate])

  useEffect(() => {
    if (isPlaying && story) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.1
          
          // Update emotion based on progress
          if (story.sentiment_data) {
            const currentTime = (newProgress / 100) * story.duration
            const emotion = story.sentiment_data.find(e => 
              currentTime >= e.timestamp && 
              currentTime < e.timestamp + e.duration
            )
            if (emotion && emotion !== currentEmotion) {
              setCurrentEmotion(emotion)
            }
          }
          
          // Stop at 100%
          if (newProgress >= 100) {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
            return 100
          }
          
          return newProgress
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, story, currentEmotion])

  const togglePlay = () => {
    if (progress >= 100) {
      setProgress(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (newProgress) => {
    setProgress(newProgress)
    if (story.sentiment_data) {
      const currentTime = (newProgress / 100) * story.duration
      const emotion = story.sentiment_data.find(e => 
        currentTime >= e.timestamp && 
        currentTime < e.timestamp + e.duration
      )
      if (emotion) {
        setCurrentEmotion(emotion)
      }
    }
  }

  const handleRestart = () => {
    setProgress(0)
    setIsPlaying(false)
    if (story.sentiment_data && story.sentiment_data.length > 0) {
      setCurrentEmotion(story.sentiment_data[0])
    }
  }

  if (!story) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Emotion Strip */}
      <EmotionStrip 
        emotion={currentEmotion} 
        sentimentData={story.sentiment_data}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-white/70 hover:text-white flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm transition-all"
        >
          ← Back
        </button>

        {/* Story Content */}
        <div className="max-w-4xl w-full text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg">
            {story.title}
          </h1>
          
          {/* Story Text (scrollable) */}
          <div className="max-h-64 overflow-y-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
            <p className="text-xl text-white/90 leading-relaxed">
              {story.content}
            </p>
          </div>

          {/* Emotion Label */}
          {currentEmotion && (
            <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-3 rounded-full">
              <span className="text-white font-semibold text-lg">
                Current emotion: {currentEmotion.emotion}
              </span>
            </div>
          )}
        </div>

        {/* Audio Controls */}
        <AudioControls
          isPlaying={isPlaying}
          progress={progress}
          duration={story.duration}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onRestart={handleRestart}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div 
          className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default PlayerFullScreen
