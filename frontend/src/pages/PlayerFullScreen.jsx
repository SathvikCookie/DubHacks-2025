import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getStory, getAudioUrl } from '../services/api'
import EmotionStrip from '../components/EmotionStrip'

function PlayerFullScreen() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    loadStory()
  }, [id])

  const loadStory = async () => {
    const data = await getStory(id)
    setStory(data)
    console.log('Story loaded:', data)
  }

  // Function to trigger events at the start of each segment
  const onSegmentStart = (segment, segmentIndex) => {
    console.log(`🎬 Starting segment ${segmentIndex}:`, {
      emotion: segment.emotion,
      text: segment.text.substring(0, 50) + '...',
      audioFile: story.audio_segments[segmentIndex]?.filename
    })

    // TODO: Replace this with actual light API call
    // Example:
    // fetch('http://light-api/set-color', {
    //   method: 'POST',
    //   body: JSON.stringify({ 
    //     emotion: segment.emotion,
    //     color: getColorForEmotion(segment.emotion)
    //   })
    // })

    // For now, just log the emotion change
    console.log(`💡 Light should change to: ${segment.emotion}`)
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

    // Trigger segment start event (for lights, etc.)
    onSegmentStart(storySegment, segmentIndex)

    // Load and play audio
    const audioUrl = getAudioUrl(audioSegment.filename)
    console.log(`🎵 Loading audio: ${audioUrl}`)
    console.log(`   Segment:`, storySegment)
    console.log(`   Audio metadata:`, audioSegment)
    
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
          console.error('Error name:', error.name)
          console.error('Error message:', error.message)
          console.error('Audio element state:', {
            src: audioRef.current.src,
            readyState: audioRef.current.readyState,
            networkState: audioRef.current.networkState,
            error: audioRef.current.error
          })
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
      
      // ⭐ Start playing the current segment immediately
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
  }

  if (!story) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-2xl text-white">Loading story...</div>
      </div>
    )
  }

  if (!story.audio_segments || story.audio_segments.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-2xl mb-2">No audio available</div>
          <div className="text-gray-400">This story hasn't been processed yet</div>
        </div>
      </div>
    )
  }

  const currentSegment = story.segments && story.segments[currentSegmentIndex] 
    ? story.segments[currentSegmentIndex] 
    : { emotion: 'neutral', text: '' }

  const totalSegments = story.audio_segments.length

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {/* Emotion Strip */}
      <EmotionStrip sentimentData={[currentSegment]} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold mb-8 text-center text-white">
          {story.title}
        </h1>
        
        {/* Current Segment Text */}
        <div className="max-w-3xl mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <p className="text-xl text-white leading-relaxed">
            {currentSegment.text}
          </p>
        </div>

        {/* Segment Counter */}
        <div className="text-white/70 mb-2 text-lg">
          Segment {currentSegmentIndex + 1} of {totalSegments}
        </div>

        {/* Current Emotion Badge */}
        <div className="mb-6 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full">
          <span className="text-white font-semibold text-lg capitalize">
            Emotion: {currentSegment.emotion}
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={handleRestart}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all text-2xl"
            title="Restart"
          >
            ↻
          </button>
          
          <button
            onClick={togglePlay}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center text-3xl shadow-lg transition-all hover:scale-105"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl">
          <div className="h-2 bg-white/20 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-center text-white/50 text-sm">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 text-white/50 text-sm">
          {isPlaying ? '🎵 Playing...' : progress === 100 ? '✓ Complete' : progress === 0 ? '🎧 Ready to play' : '⏸ Paused'}
        </div>

        {/* Debug info (can be removed in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-white/30 text-xs text-center max-w-2xl">
            <div>Current segment: {currentSegmentIndex}</div>
            <div>Audio file: {story.audio_segments[currentSegmentIndex]?.filename || 'N/A'}</div>
          </div>
        )}
      </div>

      {/* Overall Progress Indicator */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div 
          className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default PlayerFullScreen
