import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStory } from '../services/api'

function StoryCreate() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      setError('Please enter a story prompt')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('🤖 Generating story from prompt:', prompt)
      
      // Call backend to generate story with Gemini + audio
      const response = await createStory({ prompt })
      
      console.log('✓ Story created:', response)
      
      // Navigate to player with the new story
      navigate(`/player/${response.id}`)
      
    } catch (err) {
      console.error('Error creating story:', err)
      setError(err.message || 'Failed to generate story. Please try again.')
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center transition-colors"
            disabled={isGenerating}
          >
            ← Back to Stories
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✨ Create New Story</h1>
          <p className="text-gray-600">Generate a magical AI story with emotion-aware narration</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* AI Generation Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="text-4xl">🤖</div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">AI Story Generator</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Describe your story idea and our AI will create a personalized bedtime story
                  with emotion-aware narration and audio
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Prompt *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows="4"
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Example: Write a story for my child about being brave. My kid's name is Alex. Use animal characters and teach a lesson about trying new things."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Include your child's name, the lesson you want to teach, and any preferences (animals, themes, etc.)
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Generating Story & Audio...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>Generate Story</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          {isGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🔮</span>
                Creating Your Story...
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Generating story with AI...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <span>Analyzing emotions in the story...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span>Creating narrated audio segments...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <span>Preparing your story for playback...</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-4">
                ⏱ This usually takes 30-60 seconds
              </p>
            </div>
          )}

          {!isGenerating && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💫</span>
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>AI generates a personalized 5-minute bedtime story</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Story is broken into emotion-tagged segments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>Each segment is narrated with expressive voice acting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>You'll be taken to the player to listen and enjoy!</span>
                </li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default StoryCreate
