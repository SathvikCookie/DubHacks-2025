const API_BASE = 'http://localhost:5001/api'

export async function getStories() {
  const response = await fetch(`${API_BASE}/stories`)
  return response.json()
}

export async function getStory(id) {
  const response = await fetch(`${API_BASE}/stories/${id}`)
  return response.json()
}

export async function generateStory(storyData) {
  /**
   * Generate a story with audio processing
   * 
   * storyData format:
   * {
   *   title: "Story Title",
   *   prompt: "Original prompt",
   *   segments: [
   *     {text: "Story text...", emotion: "sad"},
   *     {text: "More text...", emotion: "happy"}
   *   ]
   * }
   */
  const response = await fetch(`${API_BASE}/stories/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(storyData)
  })
  return response.json()
}

export async function createStory(data) {
  const response = await fetch(`${API_BASE}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}

export async function updateStory(id, data) {
  const response = await fetch(`${API_BASE}/stories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}

export async function deleteStory(id) {
  const response = await fetch(`${API_BASE}/stories/${id}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete story' }))
    throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete story`)
  }
  
  return response.json()
}

export function getAudioUrl(filename) {
  return `${API_BASE}/audio/${filename}`
}

export async function getVoices() {
  const response = await fetch(`${API_BASE}/voices`)
  return response.json()
}

export async function createCustomVoice(formData) {
  /**
   * Create a custom voice from audio file
   * 
   * formData should be a FormData object with:
   * - audio_file: File
   * - name: string
   * - description: string (optional)
   */
  const response = await fetch(`${API_BASE}/voices/create`, {
    method: 'POST',
    body: formData  // Don't set Content-Type header for multipart/form-data
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create voice' }))
    throw new Error(errorData.error || `HTTP ${response.status}: Failed to create voice`)
  }
  
  return response.json()
}
