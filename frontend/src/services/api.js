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
  return response.json()
}

export function getAudioUrl(filename) {
  return `${API_BASE}/audio/${filename}`
}
