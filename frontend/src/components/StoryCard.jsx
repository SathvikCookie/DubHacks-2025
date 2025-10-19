// This component is now inline in StoriesList.jsx
// Keeping this file for backwards compatibility, but it's no longer used
// The new StoryCard is integrated directly into StoriesList.jsx with glass-morphism design

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getEmotionColor } from '../utils/emotions'
import GlassCard from './GlassCard'

function StoryCard({ story, index = 0 }) {
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

export default StoryCard

