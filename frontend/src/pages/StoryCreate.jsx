import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createStory } from '../services/api'
import GradientButton from '../components/GradientButton'
import GlassCard from '../components/GlassCard'
import LoadingOverlay from '../components/LoadingOverlay'
import VoiceSelector from '../components/VoiceSelector'

function StoryCreate() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [selectedVoiceId, setSelectedVoiceId] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      setError('Please enter a story prompt')
      return
    }

    if (!selectedVoiceId) {
      setError('Please select a voice')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('🤖 Generating story from prompt:', prompt)
      console.log('🎤 Using voice ID:', selectedVoiceId)
      
      // Call backend to generate story with Gemini + audio
      const response = await createStory({ 
        prompt,
        voice_id: selectedVoiceId 
      })
      
      console.log('✓ Story created:', response)
      
      // Show success briefly before navigating
      setTimeout(() => {
        navigate(`/player/${response.id}`)
      }, 500)
      
    } catch (err) {
      console.error('Error creating story:', err)
      setError(err.message || 'Failed to generate story. Please try again.')
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 relative"
    >
      {/* Loading Overlay */}
      {isGenerating && (
        <LoadingOverlay
          message="✨ Creating your magical story..."
          steps={[
            'Generating story with AI...',
            'Analyzing emotions in the story...',
            'Creating narrated audio segments...',
            'Preparing your story for playback...'
          ]}
        />
      )}

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white mb-6 flex items-center gap-2 transition-all group"
            disabled={isGenerating}
          >
            <motion.span
              className="group-hover:-translate-x-1 transition-transform"
            >
              ←
            </motion.span>
            <span>Back to Stories</span>
          </button>
          
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            ✨ Create New Story
          </motion.h1>
          <p className="text-white/70 text-lg">
            Generate a magical AI story with emotion-aware narration
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* AI Generation Section */}
          <GlassCard className="mb-6" hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <motion.div
                className="text-5xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🤖
              </motion.div>
              <div>
                <h2 className="text-3xl font-semibold text-white mb-2">
                  AI Story Generator
                </h2>
                <p className="text-white/70">
                  Describe your story idea and our AI will create a personalized bedtime story
                  with emotion-aware narration and audio
                </p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Story Prompt *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows="5"
                  disabled={isGenerating}
                  className="w-full px-5 py-4 rounded-xl bg-white/10 border-2 border-white/20 
                           focus:border-story-purple-400 focus:ring-2 focus:ring-story-purple-400/50 
                           text-white placeholder-white/40 transition-all 
                           disabled:bg-white/5 disabled:cursor-not-allowed
                           backdrop-blur-sm"
                  placeholder="Example: Write a story for my child about being brave. My kid's name is Alex. Use animal characters and teach a lesson about trying new things."
                  required
                />
                <p className="text-white/50 text-sm mt-3 flex items-start gap-2">
                  <span>💡</span>
                  <span>Tip: Include your child's name, the lesson you want to teach, and any preferences (animals, themes, etc.)</span>
                </p>
              </div>

              {/* Voice Selector */}
              <VoiceSelector 
                selectedVoiceId={selectedVoiceId}
                onVoiceSelect={setSelectedVoiceId}
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="text-red-400 text-2xl">⚠️</span>
                  <div>
                    <p className="text-red-300 font-medium">Error</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
              
              <GradientButton
                type="submit"
                disabled={isGenerating || !prompt.trim() || !selectedVoiceId}
                className="w-full text-lg py-4"
                size="large"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ✨
                    </motion.span>
                    <span>Generating Story & Audio...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>Generate Story</span>
                  </span>
                )}
              </GradientButton>
            </div>
          </GlassCard>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard hover={false}>
              <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">💫</span>
                What happens next?
              </h3>
              <ul className="space-y-3">
                {[
                  'AI generates a personalized 5-minute bedtime story',
                  'Story is broken into emotion-tagged segments',
                  'Each segment is narrated with expressive voice acting',
                  'You\'ll be taken to the player to listen and enjoy!'
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <span className="text-story-purple-400 mt-1">✓</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </motion.form>
      </div>

      {/* Decorative floating elements */}
      <motion.div
        className="absolute top-20 right-10 text-6xl opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-10 text-5xl opacity-20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        🌙
      </motion.div>
    </motion.div>
  )
}

export default StoryCreate
