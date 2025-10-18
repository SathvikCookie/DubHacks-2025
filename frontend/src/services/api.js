const API_BASE = '/api'

export async function getStories() {
  const response = await fetch(`${API_BASE}/stories`)
  return response.json()
}

export async function getStory(id) {
  const response = await fetch(`${API_BASE}/stories/${id}`)
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

