import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getStories } from '../services/api'
import { getEmotionColor } from '../utils/emotions'
import GlassCard from '../components/GlassCard'
import FloatingCreateButton from '../components/FloatingCreateButton'

function StoriesList() {
  const navigate = useNavigate()
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            className="text-8xl mb-6"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            📚
          </motion.div>
          <div className="text-2xl text-white/80">Loading stories...</div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <GlassCard className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl text-white mb-3">Connection Error</div>
          <div className="text-white/70 mb-6">{error}</div>
          <button
            onClick={loadStories}
            className="gradient-button"
          >
            Retry
          </button>
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                ✨ Storybook
              </motion.h1>
              <p className="text-white/70">Magical stories for emotional learning</p>
            </div>
            <Link
              to="/create"
              className="hidden md:block gradient-button"
            >
              + Create Story
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stories Grid */}
      <div className="container mx-auto px-4 py-12">
        {stories.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <GlassCard className="max-w-lg mx-auto text-center" hover={false}>
              <motion.div
                className="text-8xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📚
              </motion.div>
              <h2 className="text-3xl font-semibold text-white mb-3">
                No stories yet
              </h2>
              <p className="text-white/70 mb-8">
                Create your first magical story and start your journey!
              </p>
              <button
                onClick={() => navigate('/create')}
                className="gradient-button"
              >
                ✨ Create Your First Story
              </button>
            </GlassCard>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-white/70 flex items-center gap-2"
            >
              <span className="text-xl">📖</span>
              <span>
                Found {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              </span>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {stories.map((story, idx) => (
                <StoryCard key={story.id} story={story} index={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Create Button (Mobile) */}
      <FloatingCreateButton />

      {/* Decorative elements */}
      <motion.div
        className="fixed top-1/4 left-5 text-6xl opacity-10 pointer-events-none"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 15, 0]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        🌟
      </motion.div>
      <motion.div
        className="fixed bottom-1/4 right-5 text-5xl opacity-10 pointer-events-none"
        animate={{
          y: [0, 30, 0],
          rotate: [0, -15, 0]
        }}
        transition={{ duration: 7, repeat: Infinity }}
      >
        🌙
      </motion.div>
    </motion.div>
  )
}

// Story Card Component with Glass-morphism
function StoryCard({ story, index }) {
  const navigate = useNavigate()
  
  // Get emotion colors for preview
  const emotionColors = story.segments?.map(s => getEmotionColor(s.emotion)) || ['#94A3B8']
  const uniqueEmotions = [...new Set(story.segments?.map(s => s.emotion) || [])]
  
  const hasAudio = story.audio_segments && story.audio_segments.length > 0
  const audioCount = story.audio_segments?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard
        className="h-full cursor-pointer overflow-hidden p-0 group"
        onClick={() => navigate(`/player/${story.id}`)}
      >
        {/* Emotion Color Preview Strip */}
        <div className="h-2 flex">
          {emotionColors.slice(0, 10).map((color, idx) => (
            <motion.div
              key={idx}
              style={{ 
                backgroundColor: color,
                width: `${100 / Math.min(emotionColors.length, 10)}%`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + idx * 0.05 }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient transition-all">
            {story.title}
          </h2>
          
          {/* Story metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>📝</span>
              <span>{story.segments?.length || 0} segments</span>
            </div>
            
            {hasAudio ? (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>🎵</span>
                <span>{audioCount} audio files ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span>⏳</span>
                <span>No audio yet</span>
              </div>
            )}
          </div>

          {/* Emotions */}
          {uniqueEmotions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {uniqueEmotions.map((emotion, idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 + idx * 0.05 }}
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
                  style={{ 
                    backgroundColor: `${getEmotionColor(emotion)}40`,
                    border: `1px solid ${getEmotionColor(emotion)}`
                  }}
                >
                  {emotion}
                </motion.span>
              ))}
            </div>
          )}

          {/* Preview text */}
          {story.segments && story.segments[0] && (
            <p className="text-white/60 text-sm mb-4 line-clamp-2">
              {story.segments[0].text}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-white/50">
              {story.created_at ? new Date(story.created_at).toLocaleDateString() : 'Recently'}
            </span>
            
            <span className="text-story-purple-400 font-semibold group-hover:gap-2 flex items-center transition-all">
              {hasAudio ? 'Play Story' : 'View Story'}
              <motion.span
                className="inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-story-purple-500/20 to-story-pink-500/20 rounded-2xl" />
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default StoriesList
