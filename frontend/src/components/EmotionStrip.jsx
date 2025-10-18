function EmotionStrip({ sentimentData }) {
  // Default color if no sentiment data
  const defaultColor = '#E5E7EB'
  
  if (!sentimentData || sentimentData.length === 0) {
    return (
      <div 
        className="h-16 w-full transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: defaultColor }}
      />
    )
  }

  // TODO: Implement smooth color transitions based on playback progress
  const currentColor = sentimentData[0]?.color || defaultColor

  return (
    <div 
      className="h-16 w-full transition-colors duration-1000 ease-in-out flex items-center justify-center"
      style={{ backgroundColor: currentColor }}
    >
      <span className="text-white font-semibold text-lg">
        {sentimentData[0]?.emotion || ''}
      </span>
    </div>
  )
}

export default EmotionStrip

