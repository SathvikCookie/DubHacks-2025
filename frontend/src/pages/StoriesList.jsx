import { Link } from 'react-router-dom'
import { useStories } from '../context/StoriesContext'
import StoryCard from '../components/StoryCard'

function StoriesList() {
  const { stories, deleteStory } = useStories()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">✨ Storybook</h1>
              <p className="text-gray-600 mt-1">Magical stories for emotional learning</p>
            </div>
            <Link
              to="/create"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              + Create Story
            </Link>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="container mx-auto px-4 py-12">
        {stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No stories yet</h2>
            <p className="text-gray-500 mb-6">Create your first magical story!</p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map(story => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onDelete={deleteStory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoriesList
