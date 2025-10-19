// Govee Light Control Integration
// Controls smart lights based on story emotions

// Use backend proxy to avoid CORS issues
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
const LIGHTS_API_URL = `${API_BASE}/lights/set-color`

// Check if lights are enabled (backend will validate credentials)
const GOVEE_ENABLED = true  // Always try, backend will handle if not configured

// Emotion to RGB color mapping
const EMOTION_COLORS = {
  happy: { r: 255, g: 215, b: 0 },    // Gold
  sad: { r: 135, g: 206, b: 235 },    // Sky Blue
  excited: { r: 255, g: 165, b: 0 },  // Orange
  scared: { r: 255, g: 140, b: 105 }, // Coral
  angry: { r: 200, g: 100, b: 100 },  // Red-ish
  calm: { r: 160, g: 174, b: 192 },   // Gray-Blue
  neutral: { r: 255, g: 255, b: 255 } // White
}

// Convert RGB to Govee color value
// Formula: value = (r * 65536) + (g * 256) + b
function rgbToGoveeValue(r, g, b) {
  return (r * 65536) + (g * 256) + b
}

// Get RGB color for emotion
function getColorForEmotion(emotion) {
  const normalizedEmotion = emotion?.toLowerCase() || 'neutral'
  return EMOTION_COLORS[normalizedEmotion] || EMOTION_COLORS.neutral
}

// Generate unique request ID
function generateRequestId() {
  return `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Set light color via backend proxy
export async function setLightColor(emotion) {
  console.log(`💡 Setting light color for emotion: ${emotion}`)
  
  try {
    const rgb = getColorForEmotion(emotion)
    const colorValue = rgbToGoveeValue(rgb.r, rgb.g, rgb.b)
    
    console.log(`   RGB: (${rgb.r}, ${rgb.g}, ${rgb.b}) → ${colorValue}`)

    // Send request to backend proxy
    const response = await fetch(LIGHTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emotion: emotion,
        colorValue: colorValue,
        requestId: generateRequestId()
      })
    })

    if (!response.ok) {
      const error = await response.json()
      if (response.status === 503) {
        console.log('   ℹ️  Govee lights not configured on backend')
        return
      }
      throw new Error(`HTTP ${response.status}: ${error.error || 'Unknown error'}`)
    }

    const result = await response.json()
    console.log('   ✓ Light color set:', result.color)
    console.log('   ✓ Brightness set:', result.brightness)

  } catch (error) {
    console.error('   ✗ Error setting light color:', error)
  }
}

// Turn lights off (TODO: implement backend endpoint if needed)
export async function turnLightsOff() {
  console.log('💡 Turn off lights feature - not yet implemented')
  // Backend endpoint would need to be created for this
}

// Export emotion colors for UI use
export { EMOTION_COLORS }
