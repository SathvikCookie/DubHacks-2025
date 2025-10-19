// This component is no longer used in the refactored PlayerFullScreen
// The audio controls are now integrated directly into the player with better animations
// Keeping this file for backwards compatibility

import { motion } from 'framer-motion'

function AudioControls({ isPlaying, progress, duration, onTogglePlay, onSeek, onRestart }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = (progress / 100) * duration
  const remainingTime = duration - currentTime

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    onSeek(percentage)
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Main Play Button */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-lg"
          aria-label="Restart"
        >
          <span className="text-2xl">↻</span>
        </motion.button>

        <motion.button
          onClick={onTogglePlay}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-28 h-28 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center text-4xl shadow-2xl transition-all"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          animate={isPlaying ? {
            boxShadow: [
              '0 20px 60px rgba(255, 255, 255, 0.3)',
              '0 20px 80px rgba(255, 255, 255, 0.5)',
              '0 20px 60px rgba(255, 255, 255, 0.3)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>

        <div className="w-16 h-16" /> {/* Spacer for symmetry */}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div 
          onClick={handleProgressClick}
          className="h-3 bg-white/20 rounded-full cursor-pointer hover:h-4 transition-all relative group backdrop-blur-sm overflow-hidden"
        >
          <motion.div 
            className="h-full bg-white/90 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Progress handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Time Display */}
        {duration && (
          <div className="flex justify-between text-white/70 text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        )}
      </div>

      {/* Playback Info */}
      <motion.div
        className="mt-6 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-white/70 text-sm">
          {isPlaying ? '🎵 Playing...' : progress === 0 ? '🎧 Ready to play' : '⏸ Paused'}
        </p>
      </motion.div>
    </div>
  )
}

export default AudioControls

