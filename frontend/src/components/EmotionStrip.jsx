// This component is no longer used in the refactored PlayerFullScreen
// The emotion display is now integrated directly into the player with smooth transitions
// Keeping this file for backwards compatibility

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEmotionColor, getEmotionLabel } from '../utils/emotions'

function EmotionStrip({ emotion, sentimentData, currentEmotion = 'neutral' }) {
  const [displayColor, setDisplayColor] = useState(getEmotionColor('neutral'))
  const [displayEmotion, setDisplayEmotion] = useState('neutral')

  useEffect(() => {
    if (emotion) {
      setDisplayColor(emotion.color || getEmotionColor(emotion.emotion))
      setDisplayEmotion(emotion.emotion || 'neutral')
    } else if (currentEmotion) {
      setDisplayColor(getEmotionColor(currentEmotion))
      setDisplayEmotion(currentEmotion)
    }
  }, [emotion, currentEmotion])

  // Create gradient from all emotions
  const createGradient = () => {
    if (!sentimentData || sentimentData.length === 0) {
      return `linear-gradient(to right, ${displayColor})`
    }

    const totalDuration = sentimentData.reduce((sum, e) => sum + (e.duration || 1), 0)
    const gradientStops = []
    let currentPercentage = 0

    sentimentData.forEach((e) => {
      const color = e.color || getEmotionColor(e.emotion)
      const percentage = ((e.duration || 1) / totalDuration) * 100
      gradientStops.push(`${color} ${currentPercentage}%`)
      currentPercentage += percentage
      gradientStops.push(`${color} ${currentPercentage}%`)
    })

    return `linear-gradient(to right, ${gradientStops.join(', ')})`
  }

  return (
    <div className="relative">
      {/* Gradient background showing all emotions */}
      <div 
        className="h-24 w-full opacity-20"
        style={{ background: createGradient() }}
      />
      
      {/* Current emotion overlay with smooth transition */}
      <motion.div 
        className="absolute inset-0 h-24 w-full"
        animate={{ 
          backgroundColor: displayColor,
          opacity: 0.8
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      
      {/* Emotion label with animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayEmotion}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30"
          >
            <span className="text-white font-bold text-2xl drop-shadow-lg">
              {getEmotionLabel(displayEmotion)}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Accessibility note */}
      <div className="absolute bottom-2 right-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white/70 text-xs">
          Colors represent emotions
        </span>
      </div>
    </div>
  )
}

export default EmotionStrip
