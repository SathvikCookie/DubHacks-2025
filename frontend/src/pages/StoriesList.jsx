import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStories } from '../services/api'

function StoriesList() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await getStories()
      setStories(data)
      console.log('Loaded stories from backend:', data)
    } catch (err) {
      console.error('Error loading stories:', err)
      setError('Failed to load stories. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-2xl text-gray-600">Loading stories...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl text-gray-800 mb-2">Connection Error</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={loadStories}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">✨ Storybook</h1>
              <p className="text-gray-600 mt-1">Magical stories for emotional learning</p>
            </div>
            <Link
              to="/create"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              + Create Story
            </Link>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="container mx-auto px-4 py-12">
        {stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No stories yet</h2>
            <p className="text-gray-500 mb-6">Generate your first story with Gemini!</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              Found {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Story Card Component
function StoryCard({ story }) {
  // Get emotion colors for preview
  const emotionColors = story.segments?.map(s => getColorForEmotion(s.emotion)) || ['#A0AEC0']
  const uniqueEmotions = [...new Set(story.segments?.map(s => s.emotion) || [])]
  
  const hasAudio = story.audio_segments && story.audio_segments.length > 0
  const audioCount = story.audio_segments?.length || 0

  return (
    <Link to={`/player/${story.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 group">
        {/* Emotion Color Preview */}
        <div className="h-3 flex">
          {emotionColors.slice(0, 10).map((color, idx) => (
            <div
              key={idx}
              style={{ 
                backgroundColor: color,
                width: `${100 / Math.min(emotionColors.length, 10)}%`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
            {story.title}
          </h2>
          
          {/* Story metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📝</span>
              <span>{story.segments?.length || 0} segments</span>
            </div>
            
            {hasAudio ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span>🎵</span>
                <span>{audioCount} audio files ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>⏳</span>
                <span>No audio yet</span>
              </div>
            )}
          </div>

          {/* Emotions */}
          {uniqueEmotions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {uniqueEmotions.map((emotion, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getColorForEmotion(emotion) }}
                >
                  {emotion}
                </span>
              ))}
            </div>
          )}

          {/* Preview text */}
          {story.segments && story.segments[0] && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {story.segments[0].text}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {story.created_at ? new Date(story.created_at).toLocaleDateString() : 'Recently'}
            </span>
            
            <span className="text-purple-600 font-semibold group-hover:gap-2 flex items-center transition-all">
              {hasAudio ? 'Play Story' : 'View Story'}
              <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Helper function to get color for emotion
function getColorForEmotion(emotion) {
  const colors = {
    happy: '#FFD700',
    sad: '#87CEEB',
    excited: '#FFA500',
    scared: '#FF8C69',
    angry: '#C86464',
    neutral: '#A0AEC0'
  }
  return colors[emotion?.toLowerCase()] || '#A0AEC0'
}

export default StoriesList
