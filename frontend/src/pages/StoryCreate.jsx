import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStories } from '../context/StoriesContext'

function StoryCreate() {
  const navigate = useNavigate()
  const { addStory } = useStories()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prompt: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) {
      alert('Please enter a story prompt')
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedContent = `Once upon a time, based on the idea "${formData.prompt}", a wonderful story unfolded. ${formData.prompt} led to an adventure filled with wonder, learning, and emotional growth. The characters discovered important lessons about feelings and friendship along their journey.`
      
      setFormData({
        ...formData,
        title: formData.title || formData.prompt.slice(0, 50),
        content: generatedContent
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content')
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
          <p className="text-gray-600">Generate a magical story with AI or write your own</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Generation Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">🤖</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">AI Story Generator</h2>
                <p className="text-sm text-gray-600">Describe your story idea and let AI create it</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Prompt
                </label>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="E.g., A story about a shy turtle who learns to be brave..."
                />
              </div>
              
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Generating Story...
                  </span>
                ) : (
                  '✨ Generate with AI'
                )}
              </button>
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="text-3xl">✍️</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Story Details</h2>
                <p className="text-sm text-gray-600">Edit or write your story manually</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Enter a magical title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="12"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Once upon a time..."
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
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Save & Play Story
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StoryCreate

