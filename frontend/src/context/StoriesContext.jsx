import { createContext, useContext, useState } from 'react'

const StoriesContext = createContext()

// Demo stories with sentiment data
const DEMO_STORIES = [
  {
    id: 1,
    title: "The Brave Little Star",
    content: "Once upon a time, in the vast night sky, there lived a little star named Stella. She was smaller than the other stars and often felt sad about it. One night, a lonely child looked up and made a wish upon Stella. The little star realized that no matter her size, she could bring joy and hope to others. She shined brighter than ever before, feeling proud and happy.",
    sentiment_data: [
      { emotion: 'neutral', color: '#A0AEC0', timestamp: 0, duration: 5 },
      { emotion: 'sadness', color: '#87CEEB', timestamp: 5, duration: 10 },
      { emotion: 'joy', color: '#FFD700', timestamp: 15, duration: 15 },
      { emotion: 'happy', color: '#FFA07A', timestamp: 30, duration: 10 }
    ],
    audio_url: null,
    created_at: new Date().toISOString(),
    duration: 40
  },
  {
    id: 2,
    title: "The Magical Garden",
    content: "In a hidden corner of the world, Maya discovered a magical garden where flowers sang songs. At first, she was surprised and a little scared by the singing roses. But as she listened, the melodies made her feel calm and peaceful. She spent the whole afternoon dancing with the singing flowers, filled with pure joy and wonder.",
    sentiment_data: [
      { emotion: 'surprise', color: '#FFA500', timestamp: 0, duration: 8 },
      { emotion: 'fear', color: '#FF8C69', timestamp: 8, duration: 7 },
      { emotion: 'calm', color: '#B0E0E6', timestamp: 15, duration: 12 },
      { emotion: 'joy', color: '#FFD700', timestamp: 27, duration: 13 }
    ],
    audio_url: null,
    created_at: new Date().toISOString(),
    duration: 40
  },
  {
    id: 3,
    title: "The Friendly Dragon",
    content: "Everyone in the village was afraid of the dragon on the mountain. But young Leo was curious, not scared. He climbed the mountain and found that the dragon was actually very lonely and kind. They became best friends, and Leo taught the village that sometimes our fears are just misunderstandings. The dragon helped protect the village, and everyone lived happily together.",
    sentiment_data: [
      { emotion: 'fear', color: '#FF8C69', timestamp: 0, duration: 8 },
      { emotion: 'curiosity', color: '#DDA0DD', timestamp: 8, duration: 10 },
      { emotion: 'surprise', color: '#FFA500', timestamp: 18, duration: 8 },
      { emotion: 'joy', color: '#FFD700', timestamp: 26, duration: 14 }
    ],
    audio_url: null,
    created_at: new Date().toISOString(),
    duration: 40
  }
]

export function StoriesProvider({ children }) {
  const [stories, setStories] = useState(DEMO_STORIES)

  const addStory = (story) => {
    const newStory = {
      ...story,
      id: stories.length + 1,
      created_at: new Date().toISOString(),
      sentiment_data: generateDemoSentiment(),
      duration: 40
    }
    setStories([newStory, ...stories])
    return newStory
  }

  const deleteStory = (id) => {
    setStories(stories.filter(s => s.id !== id))
  }

  const getStory = (id) => {
    return stories.find(s => s.id === parseInt(id))
  }

  return (
    <StoriesContext.Provider value={{ stories, addStory, deleteStory, getStory }}>
      {children}
    </StoriesContext.Provider>
  )
}

export function useStories() {
  const context = useContext(StoriesContext)
  if (!context) {
    throw new Error('useStories must be used within StoriesProvider')
  }
  return context
}

// Helper to generate demo sentiment data
function generateDemoSentiment() {
  const emotions = [
    { emotion: 'joy', color: '#FFD700' },
    { emotion: 'sadness', color: '#87CEEB' },
    { emotion: 'surprise', color: '#FFA500' },
    { emotion: 'calm', color: '#B0E0E6' },
    { emotion: 'neutral', color: '#A0AEC0' }
  ]
  
  const sentimentData = []
  let currentTime = 0
  
  for (let i = 0; i < 3; i++) {
    const emotion = emotions[Math.floor(Math.random() * emotions.length)]
    const duration = 10 + Math.random() * 10
    sentimentData.push({
      ...emotion,
      timestamp: currentTime,
      duration: Math.round(duration)
    })
    currentTime += duration
  }
  
  return sentimentData
}

