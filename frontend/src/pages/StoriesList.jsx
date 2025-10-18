import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStories } from '../services/api'

function StoriesList() {
  const [stories, setStories] = useState([])

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    const data = await getStories()
    setStories(data)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Stories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map(story => (
          <div key={story.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{story.content}</p>
            <Link 
              to={`/player/${story.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Play Story →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StoriesList

