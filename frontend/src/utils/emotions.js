// Emotion color mappings and utilities for the storybook app

export const emotionColors = {
  happy: '#FACC15',      // Warm yellow
  sad: '#60A5FA',        // Soft blue
  scared: '#FB923C',     // Orange
  excited: '#F472B6',    // Pink
  angry: '#EF4444',      // Red
  calm: '#A78BFA',       // Purple
  neutral: '#94A3B8',    // Gray
  default: '#94A3B8'     // Fallback
}

// Get color for an emotion (case-insensitive, with fallback)
export const getEmotionColor = (emotion) => {
  const normalizedEmotion = emotion?.toLowerCase() || 'neutral'
  return emotionColors[normalizedEmotion] || emotionColors.default
}

// Get emotion display name with emoji
export const getEmotionLabel = (emotion) => {
  const labels = {
    happy: '😊 Happy',
    sad: '😢 Sad',
    scared: '😨 Scared',
    excited: '🤩 Excited',
    angry: '😠 Angry',
    calm: '😌 Calm',
    neutral: '😐 Neutral'
  }
  const normalizedEmotion = emotion?.toLowerCase() || 'neutral'
  return labels[normalizedEmotion] || '😐 Neutral'
}

// Get emotion message for the player screen
export const getEmotionMessage = (emotion) => {
  const messages = {
    happy: 'Feel the joy! 🌟',
    sad: 'Take a deep breath... 💙',
    scared: 'You are safe here 🤗',
    excited: 'Let\'s celebrate! 🎉',
    angry: 'Let\'s calm down together 🌊',
    calm: 'Peace and tranquility ☁️',
    neutral: 'Listen carefully 👂'
  }
  const normalizedEmotion = emotion?.toLowerCase() || 'neutral'
  return messages[normalizedEmotion] || messages.neutral
}

// Create gradient string from multiple emotions
export const createEmotionGradient = (emotions) => {
  if (!emotions || emotions.length === 0) {
    return `linear-gradient(to right, ${emotionColors.neutral})`
  }
  
  const colors = emotions.map(e => getEmotionColor(e.emotion || e))
  const gradientStops = colors.map((color, idx) => {
    const position = (idx / (colors.length - 1)) * 100
    return `${color} ${position}%`
  })
  
  return `linear-gradient(to right, ${gradientStops.join(', ')})`
}

