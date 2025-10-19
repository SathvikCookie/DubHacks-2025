import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStories } from '../context/StoriesContext'
import { createStory as apiCreateStory } from '../services/api'

function StoryCreate() {
  const navigate = useNavigate()
  const { addStory } = useStories()
  const [formData, setFormData] = useState({
    prompt: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGenerateAndSave = async () => {
    if (!formData.prompt.trim()) {
      alert('Please enter a story prompt')
      return
    }


    setIsGenerating(true)

    try {
      // Call backend create_story which will generate content server-side
      const payload = { prompt: formData.prompt }
      const created = await apiCreateStory(payload)

      // Add to local context store and navigate
      const newStory = addStory(created)
      setIsGenerating(false)
      navigate(`/player/${newStory.id}`)
    } catch (err) {
      console.error('Failed to create story', err)
      setIsGenerating(false)
      alert('Failed to generate story. Please try again.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      alert('Please fill in content')
      return
    }

    const newStory = addStory(formData)
    navigate(`/player/${newStory.id}`)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← Back to Stories
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create New Story</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Generation Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-3 mb-4">
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Story Details  ✍️</h2>
              </div>
              <div>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="A story about a shy turtle who learns to be brave..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateAndSave}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Generating & Saving...
                </span>
              ) : (
                '✨ Generate & Save Story'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StoryCreate

