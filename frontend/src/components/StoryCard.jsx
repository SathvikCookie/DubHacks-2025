import { Link } from 'react-router-dom'

function StoryCard({ story, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault()
    if (window.confirm(`Delete "${story.title}"?`)) {
      onDelete(story.id)
    }
  }

  // Get emotion colors for preview
  const emotionColors = story.sentiment_data?.map(e => e.color) || ['#A0AEC0']

  return (
    <Link to={`/player/${story.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 group">
        {/* Emotion Color Preview */}
        <div className="h-3 flex">
          {emotionColors.map((color, idx) => (
            <div
              key={idx}
              style={{ 
                backgroundColor: color,
                width: `${100 / emotionColors.length}%`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
            {story.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {story.content}
          </p>

          {/* Emotions */}
          {story.sentiment_data && story.sentiment_data.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {story.sentiment_data.map((emotion, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: emotion.color }}
                >
                  {emotion.emotion}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {new Date(story.created_at).toLocaleDateString()}
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Delete
              </button>
              <span className="text-purple-600 font-semibold group-hover:gap-2 flex items-center transition-all">
                Play
                <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default StoryCard

