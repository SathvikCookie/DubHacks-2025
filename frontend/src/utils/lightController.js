/**
 * Light Controller - Handles communication with smart lights
 * 
 * This module provides functions to control smart lights based on story emotions.
 * Replace the placeholder functions with actual API calls to your light system.
 */

// Emotion to color mapping
const EMOTION_COLORS = {
  happy: { r: 255, g: 215, b: 0 },      // Gold/Yellow
  sad: { r: 135, g: 206, b: 235 },      // Sky Blue
  excited: { r: 255, g: 165, b: 0 },    // Orange
  scared: { r: 255, g: 140, b: 105 },   // Muted Orange
  angry: { r: 200, g: 100, b: 100 },    // Muted Red
  neutral: { r: 160, g: 174, b: 192 }   // Gray
}

/**
 * Set light color based on emotion
 * @param {string} emotion - The emotion (happy, sad, excited, scared, angry, neutral)
 * @param {number} brightness - Brightness level 0-100 (optional, default 80)
 */
export async function setLightForEmotion(emotion, brightness = 80) {
  const color = EMOTION_COLORS[emotion.toLowerCase()] || EMOTION_COLORS.neutral
  
  console.log(`💡 Setting light for emotion: ${emotion}`, color)
  
  // TODO: Replace with actual light API call
  // Example for Philips Hue:
  // await fetch('http://your-bridge-ip/api/your-key/lights/1/state', {
  //   method: 'PUT',
  //   body: JSON.stringify({
  //     on: true,
  //     bri: Math.round(brightness * 2.54), // Convert to 0-254 range
  //     xy: rgbToXy(color.r, color.g, color.b)
  //   })
  // })
  
  // Example for generic RGB API:
  // await fetch('http://your-light-api/set-color', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     r: color.r,
  //     g: color.g,
  //     b: color.b,
  //     brightness: brightness
  //   })
  // })
  
  // For now, just simulate with a delay
  return new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Turn lights off
 */
export async function turnLightsOff() {
  console.log('💡 Turning lights off')
  
  // TODO: Replace with actual API call
  // await fetch('http://your-light-api/off', { method: 'POST' })
  
  return new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Fade transition between colors
 * @param {string} fromEmotion - Starting emotion
 * @param {string} toEmotion - Target emotion
 * @param {number} durationMs - Transition duration in milliseconds
 */
export async function fadeTransition(fromEmotion, toEmotion, durationMs = 1000) {
  console.log(`💡 Fading from ${fromEmotion} to ${toEmotion} over ${durationMs}ms`)
  
  // TODO: Implement smooth color transition
  // This would require multiple API calls to gradually change the color
  
  // For now, just set the target color
  await setLightForEmotion(toEmotion)
}

/**
 * Get hex color for emotion (for UI display)
 */
export function getColorHexForEmotion(emotion) {
  const color = EMOTION_COLORS[emotion.toLowerCase()] || EMOTION_COLORS.neutral
  return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
}

/**
 * Get RGB color for emotion
 */
export function getColorRGBForEmotion(emotion) {
  return EMOTION_COLORS[emotion.toLowerCase()] || EMOTION_COLORS.neutral
}

// Helper function to convert RGB to XY color space (for Philips Hue)
function rgbToXy(r, g, b) {
  // Normalize RGB values
  r = r / 255
  g = g / 255
  b = b / 255

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  // Convert to XYZ
  const X = r * 0.649926 + g * 0.103455 + b * 0.197109
  const Y = r * 0.234327 + g * 0.743075 + b * 0.022598
  const Z = r * 0.000000 + g * 0.053077 + b * 1.035763

  // Convert to xy
  const x = X / (X + Y + Z)
  const y = Y / (X + Y + Z)

  return [x, y]
}

export default {
  setLightForEmotion,
  turnLightsOff,
  fadeTransition,
  getColorHexForEmotion,
  getColorRGBForEmotion
}

