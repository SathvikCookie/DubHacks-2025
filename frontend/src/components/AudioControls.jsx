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
        <button
          onClick={onRestart}
          className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110"
          aria-label="Restart"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
          </svg>
        </button>

        <button
          onClick={onTogglePlay}
          className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center text-4xl shadow-2xl transition-all hover:scale-110"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="w-16 h-16" /> {/* Spacer for symmetry */}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div 
          onClick={handleProgressClick}
          className="h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all relative group"
        >
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
          
          {/* Progress handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-white/70 text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Playback Info */}
      <div className="mt-6 text-center">
        <p className="text-white/50 text-sm">
          {isPlaying ? '🎵 Playing...' : progress === 0 ? '🎧 Ready to play' : '⏸ Paused'}
        </p>
      </div>
    </div>
  )
}

export default AudioControls

