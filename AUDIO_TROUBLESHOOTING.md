# 🔊 Audio Troubleshooting - No Sound

## Current Status

✅ Flask running on port 5001  
✅ Frontend connecting to correct port  
✅ Story loading successfully  
✅ Audio files exist on disk  
✅ Play button clicked  
❓ Audio not playing  

## What to Check

### 1. Browser Console Errors

Open DevTools Console (F12) and look for:

**After clicking play, you should see:**
```
🎬 Starting segment 0: { emotion: 'neutral', ... }
💡 Light should change to: neutral
🎵 Loading audio: http://localhost:5001/api/audio/ca3d7947-...segment_000.mp3
   Segment: { text: '...', emotion: 'neutral' }
   Audio metadata: { filename: '...', ... }
```

**If there's an error, you'll see:**
```
❌ Error playing segment 0: DOMException: ...
Error name: NotAllowedError
Error message: play() failed because the user didn't interact with the document first
```

### 2. Common Audio Errors

#### Error: "NotAllowedError"
**Cause:** Browser autoplay policy  
**Solution:** User must click play button (already done)  
**Check:** Make sure play button actually triggers the audio

#### Error: "NotSupportedError"
**Cause:** Audio format not supported or file corrupted  
**Solution:** Check if MP3 is valid
```bash
cd backend/audio_files
file ca3d7947-*.mp3 | head -1
# Should say: "Audio file with ID3 version 2.4.0"
```

#### Error: "AbortError"
**Cause:** Audio loading was interrupted  
**Solution:** Network issue or CORS problem

#### Error: Network error / CORS
**Cause:** Can't fetch audio from server  
**Check Flask logs:** Should show audio request

### 3. Network Tab Check

1. Open DevTools → Network tab
2. Click play
3. Look for request to `/api/audio/ca3d7947-...segment_000.mp3`

**Should see:**
- Status: 200
- Type: audio/mpeg
- Size: ~127 KB

**If 404:** File not found
**If 403:** Permission issue
**If CORS error:** CORS not configured

### 4. Audio Element State

The console now logs audio element state on error:
```javascript
{
  src: "http://localhost:5001/api/audio/...",
  readyState: 0,  // 0 = HAVE_NOTHING, 4 = HAVE_ENOUGH_DATA
  networkState: 2, // 2 = NETWORK_LOADING, 3 = NETWORK_NO_SOURCE
  error: null or { code: 4, message: "..." }
}
```

**readyState values:**
- 0 = HAVE_NOTHING - no data
- 1 = HAVE_METADATA - duration known
- 2 = HAVE_CURRENT_DATA - data for current position
- 3 = HAVE_FUTURE_DATA - enough to play a bit
- 4 = HAVE_ENOUGH_DATA - can play through

**networkState values:**
- 0 = NETWORK_EMPTY
- 1 = NETWORK_IDLE
- 2 = NETWORK_LOADING
- 3 = NETWORK_NO_SOURCE

### 5. Test Audio URL Directly

Copy the audio URL from console and paste in browser:
```
http://localhost:5001/api/audio/ca3d7947-7a58-4fe0-b1ab-7d0140faa629_segment_000.mp3
```

**Should:** Download or play the MP3 file

**If it works:** Audio file is fine, issue is in player code  
**If it doesn't:** Server or file issue

### 6. Check Flask Logs

Flask terminal should show:
```
🎵 Audio request: ca3d7947-7a58-4fe0-b1ab-7d0140faa629_segment_000.mp3
   Looking for: /Users/.../backend/audio_files/ca3d7947-...segment_000.mp3
   ✓ File found, serving...
127.0.0.1 - - [date] "GET /api/audio/ca3d7947-...segment_000.mp3 HTTP/1.1" 200 -
```

**If you don't see this:** Audio request isn't reaching Flask

### 7. Audio Element Inspection

Add this to browser console while on player page:
```javascript
// Get the audio element
const audio = document.querySelector('audio')

// Check if it exists
console.log('Audio element:', audio)

// Try to play manually
audio.play()
  .then(() => console.log('✓ Manual play worked!'))
  .catch(e => console.error('✗ Manual play failed:', e))

// Check current src
console.log('Audio src:', audio.src)

// Listen for events
audio.addEventListener('loadstart', () => console.log('→ loadstart'))
audio.addEventListener('loadedmetadata', () => console.log('→ loadedmetadata'))
audio.addEventListener('loadeddata', () => console.log('→ loadeddata'))
audio.addEventListener('canplay', () => console.log('→ canplay'))
audio.addEventListener('canplaythrough', () => console.log('→ canplaythrough'))
audio.addEventListener('playing', () => console.log('→ playing'))
audio.addEventListener('error', (e) => console.error('→ error:', e))
```

## Likely Issues

### Issue 1: Audio Element Not Created
**Check:** Look for `<audio>` tag in DOM
**Solution:** Make sure `audioRef` is properly set

### Issue 2: useEffect Dependency Issue
**Problem:** `playSegment()` not being called when `isPlaying` changes
**Check:** Add console.log in useEffect:
```javascript
useEffect(() => {
  console.log('useEffect triggered:', { story: !!story, isPlaying, currentSegmentIndex })
  if (story && isPlaying) {
    playSegment(currentSegmentIndex)
  }
}, [currentSegmentIndex, story])
```

### Issue 3: Missing `isPlaying` in Dependencies
**Problem:** useEffect doesn't include `isPlaying` in dependencies
**Current code:** `[currentSegmentIndex, story]`
**Should be:** `[currentSegmentIndex, story, isPlaying]` ???

Wait - looking at the code, when you click play:
1. `togglePlay()` sets `isPlaying = true`
2. But `useEffect` only watches `[currentSegmentIndex, story]`
3. So `playSegment()` won't be called!

**This is the bug!**

### Issue 4: playSegment Not Called on First Play
**Problem:** useEffect dependency array doesn't include `isPlaying`

When you click play:
- `isPlaying` changes from `false` to `true`
- But useEffect doesn't re-run because it only watches `currentSegmentIndex` and `story`
- So `playSegment()` is never called!

**Solution:** Either:
1. Add `isPlaying` to dependencies
2. Or call `playSegment()` directly in `togglePlay()`

## Quick Fix

Try this in `togglePlay()`:

```javascript
const togglePlay = () => {
  if (!story || !story.audio_segments || story.audio_segments.length === 0) {
    console.error('No audio segments available')
    return
  }

  if (isPlaying) {
    // Pause
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    console.log('⏸ Paused')
  } else {
    // Play
    if (progress === 100) {
      // Restart from beginning
      console.log('🔄 Restarting story')
      setProgress(0)
      setCurrentSegmentIndex(0)
    }
    setIsPlaying(true)
    
    // ⭐ ADD THIS LINE:
    playSegment(currentSegmentIndex)
    
    console.log('▶ Playing')
  }
}
```

This will call `playSegment()` immediately when play is clicked, instead of waiting for useEffect.

## Test Sequence

1. Click play
2. Check console for:
   - "▶ Playing"
   - "🎬 Starting segment 0"
   - "🎵 Loading audio"
   - "✓ Playing segment 0"
3. Check Network tab for audio request
4. Check Flask logs for audio serving
5. Listen for sound! 🔊

If you see all the console logs but no sound, the issue is:
- Volume muted
- Audio output device
- Browser audio permissions
- Corrupted audio file

If you don't see "🎬 Starting segment 0", the issue is:
- `playSegment()` not being called
- Fix: Add to `togglePlay()` or fix useEffect dependencies

