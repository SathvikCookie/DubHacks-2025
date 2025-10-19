import { useEffect, useState } from 'react'

function EmotionStrip({ emotion, sentimentData }) {
  const [displayColor, setDisplayColor] = useState('#A0AEC0')
  const [displayEmotion, setDisplayEmotion] = useState('neutral')

  useEffect(() => {
    if (emotion) {
      setDisplayColor(emotion.color)
      setDisplayEmotion(emotion.emotion)
    }
  }, [emotion])

  // Create gradient from all emotions
  const createGradient = () => {
    if (!sentimentData || sentimentData.length === 0) {
      return `linear-gradient(to right, ${displayColor})`
    }

    const totalDuration = sentimentData.reduce((sum, e) => sum + e.duration, 0)
    const gradientStops = []
    let currentPercentage = 0

    sentimentData.forEach((e, idx) => {
      const percentage = (e.duration / totalDuration) * 100
      gradientStops.push(`${e.color} ${currentPercentage}%`)
      currentPercentage += percentage
      gradientStops.push(`${e.color} ${currentPercentage}%`)
    })

    return `linear-gradient(to right, ${gradientStops.join(', ')})`
  }

  return (
    <div className="relative">
      {/* Gradient background showing all emotions */}
      <div 
        className="h-24 w-full opacity-30"
        style={{ background: createGradient() }}
      />
      
      {/* Current emotion overlay */}
      <div 
        className="absolute inset-0 h-24 w-full transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundColor: displayColor,
          opacity: 0.85
        }}
      />
      
      {/* Emotion label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full">
          <span className="text-white font-bold text-2xl capitalize drop-shadow-lg">
            {displayEmotion}
          </span>
        </div>
      </div>

      {/* Accessibility note */}
      <div className="absolute bottom-2 right-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white/70 text-xs">
          Colors represent emotions
        </span>
      </div>
    </div>
  )
}

export default EmotionStrip
