import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getStory, getAudioUrl } from '../services/api'
import { setLightColor } from '../utils/lightController'
import { getEmotionColor, getEmotionLabel, getEmotionMessage } from '../utils/emotions'
import GlassCard from '../components/GlassCard'

function PlayerFullScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [story, setStory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const audioRef = useRef(null)

  useEffect(() => {
    loadStory()
  }, [id])

  const loadStory = async () => {
    const data = await getStory(id)
    setStory(data)
    console.log('Story loaded:', data)
    
    // Set initial emotion
    if (data.segments && data.segments[0]) {
      setCurrentEmotion(data.segments[0].emotion || 'neutral')
    }
  }

  // Function to trigger events at the start of each segment
  const onSegmentStart = (segment, segmentIndex) => {
    console.log(`🎬 Starting segment ${segmentIndex}:`, {
      emotion: segment.emotion,
      text: segment.text.substring(0, 50) + '...',
      audioFile: story.audio_segments[segmentIndex]?.filename
    })

    // Set current emotion for smooth transition
    const emotion = segment?.emotion || 'neutral'
    setCurrentEmotion(emotion)
    
    // Set Govee light color based on emotion
    console.log(`💡 Setting light to: ${emotion}`)
    setLightColor(emotion)
  }

  // Load and play a specific segment
  const playSegment = (segmentIndex) => {
    if (!story || !story.audio_segments || segmentIndex >= story.audio_segments.length) {
      console.log('No more segments to play')
      setIsPlaying(false)
      return
    }

    const audioSegment = story.audio_segments[segmentIndex]
    const storySegment = story.segments[segmentIndex]

    if (!audioSegment || !audioSegment.filename) {
      console.error(`No audio file for segment ${segmentIndex}`)
      // Try next segment
      if (segmentIndex < story.audio_segments.length - 1) {
        setCurrentSegmentIndex(segmentIndex + 1)
      } else {
        setIsPlaying(false)
      }
      return
    }

    // Trigger segment start event (for lights, emotion transition, etc.)
    onSegmentStart(storySegment, segmentIndex)

    // Load and play audio
    const audioUrl = getAudioUrl(audioSegment.filename)
    console.log(`🎵 Loading audio: ${audioUrl}`)
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.load()
      
      // Play after loading
      audioRef.current.play()
        .then(() => {
          console.log(`✓ Playing segment ${segmentIndex}`)
          setIsPlaying(true)
        })
        .catch(error => {
          console.error(`❌ Error playing segment ${segmentIndex}:`, error)
          // Try next segment on error
          if (segmentIndex < story.audio_segments.length - 1) {
            setTimeout(() => {
              setCurrentSegmentIndex(segmentIndex + 1)
            }, 500)
          }
        })
    }
  }

  // Handle when current audio segment ends
  const handleAudioEnded = () => {
    console.log(`✓ Segment ${currentSegmentIndex} finished`)
    
    // Calculate progress
    const newProgress = ((currentSegmentIndex + 1) / story.audio_segments.length) * 100
    setProgress(newProgress)

    // Move to next segment
    if (currentSegmentIndex < story.audio_segments.length - 1) {
      const nextIndex = currentSegmentIndex + 1
      console.log(`→ Moving to segment ${nextIndex}`)
      setCurrentSegmentIndex(nextIndex)
    } else {
      // Story finished
      console.log('🎉 Story complete!')
      setIsPlaying(false)
      setProgress(100)
    }
  }

  // Play current segment when index changes (and we're in playing state)
  useEffect(() => {
    if (story && isPlaying) {
      playSegment(currentSegmentIndex)
    }
  }, [currentSegmentIndex, story])

  // Set up audio event listeners
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    audio.addEventListener('ended', handleAudioEnded)

    return () => {
      audio.removeEventListener('ended', handleAudioEnded)
    }
  }, [currentSegmentIndex, story])

  const togglePlay = () => {
    if (!story || !story.audio_segments || story.audio_segments.length === 0) {
      console.error('No audio segments available')
      return
    }

    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setIsPlaying(false)
      console.log('⏸ Paused')
    } else {
      // Play
      if (progress === 100) {
        // Restart from beginning
        console.log('🔄 Restarting story')
        setProgress(0)
        setCurrentSegmentIndex(0)
      }
      setIsPlaying(true)
      console.log('▶ Playing')
      
      // Start playing the current segment immediately
      playSegment(currentSegmentIndex)
    }
  }

  const handleRestart = () => {
    console.log('🔄 Restart button clicked')
    setCurrentSegmentIndex(0)
    setProgress(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    // Reset to first emotion
    if (story?.segments?.[0]) {
      setCurrentEmotion(story.segments[0].emotion || 'neutral')
    }
  }

  if (!story) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            📚
          </motion.div>
          <div className="text-2xl text-white">Loading story...</div>
        </div>
      </motion.div>
    )
  }

  if (!story.audio_segments || story.audio_segments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen flex items-center justify-center px-4"
      >
        <GlassCard className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-2xl text-white mb-3">No audio available</div>
          <div className="text-white/70 mb-6">This story hasn't been processed yet</div>
          <button
            onClick={() => navigate('/')}
            className="gradient-button"
          >
            Back to Stories
          </button>
        </GlassCard>
      </motion.div>
    )
  }

  const currentSegment = story.segments && story.segments[currentSegmentIndex] 
    ? story.segments[currentSegmentIndex] 
    : { emotion: 'neutral', text: '' }

  const totalSegments = story.audio_segments.length
  const emotionColor = getEmotionColor(currentEmotion)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col relative overflow-hidden"
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {/* Animated emotion-based background with smooth transitions */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          backgroundColor: emotionColor
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
        
        {/* Animated orbs for ambient effect */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ backgroundColor: emotionColor }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ backgroundColor: emotionColor }}
        />
      </motion.div>

      {/* Back button */}
      <div className="relative z-10 p-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="text-white/80 hover:text-white flex items-center gap-2 transition-all group"
        >
          <motion.span
            className="group-hover:-translate-x-1 transition-transform"
          >
            ←
          </motion.span>
          <span>Back to Stories</span>
        </motion.button>
      </div>

      {/* Main content - with proper scrolling container */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto py-4 md:py-8 px-4 md:px-8">
          <motion.div
            className="w-full max-w-4xl mx-auto flex flex-col items-center min-h-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Title - always visible at top */}
            <motion.h1
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-center text-white drop-shadow-lg px-4 flex-shrink-0"
              layoutId={`story-title-${story.id}`}
            >
              {story.title}
            </motion.h1>
            
            {/* Current Emotion Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentEmotion}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="mb-3 md:mb-4 text-center flex-shrink-0"
              >
                <div className="inline-block bg-white/20 backdrop-blur-md px-3 md:px-5 py-2 rounded-full border border-white/30">
                  <span className="text-white font-semibold text-sm md:text-base">
                    {getEmotionLabel(currentEmotion)}
                  </span>
                </div>
                <p className="text-white/80 text-xs mt-1">
                  {getEmotionMessage(currentEmotion)}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Current Segment Text with smooth transitions and controlled height */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSegmentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="mb-3 md:mb-4 w-full max-w-3xl px-2 flex-shrink-0"
              >
                <GlassCard className="max-h-[30vh] overflow-y-auto custom-scrollbar" hover={false}>
                  <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed text-center">
                    {currentSegment.text}
                  </p>
                </GlassCard>
              </motion.div>
            </AnimatePresence>

            {/* Segment Counter */}
            <div className="text-white/70 mb-3 md:mb-4 text-center text-sm md:text-base flex-shrink-0">
              Segment {currentSegmentIndex + 1} of {totalSegments}
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-3 md:mb-4 flex-shrink-0">
              <motion.button
                onClick={handleRestart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all text-lg md:text-xl shadow-lg"
                title="Restart"
              >
                ↻
              </motion.button>
              
              <motion.button
                onClick={togglePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center text-3xl shadow-2xl transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
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
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl px-2 mb-3 flex-shrink-0">
              <div className="h-2 md:h-3 bg-white/20 rounded-full backdrop-blur-sm overflow-hidden">
                <motion.div 
                  className="h-full bg-white/90 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-2 text-center text-white/70 text-xs">
                {Math.round(progress)}% complete
              </div>
            </div>

            {/* Status */}
            <motion.div
              className="mt-2 text-center text-white/70 text-xs mb-4 flex-shrink-0"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isPlaying ? '🎵 Playing...' : progress === 100 ? '✓ Complete' : progress === 0 ? '🎧 Ready to play' : '⏸ Paused'}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default PlayerFullScreen
