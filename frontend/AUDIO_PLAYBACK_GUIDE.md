# 🎵 Audio Playback System Guide

## Overview

The audio playback system automatically plays story segments back-to-back, triggering events (like light changes) at the start of each segment.

## How It Works

### 1. **Segment-by-Segment Playback**

```
Segment 0 starts
  ↓
Trigger onSegmentStart() → Set lights/events
  ↓
Play audio file
  ↓
Audio ends → handleAudioEnded()
  ↓
Move to Segment 1
  ↓
Repeat until all segments complete
```

### 2. **Key Functions**

#### `onSegmentStart(segment, segmentIndex)`
Called at the start of each segment. This is where you trigger external events.

```javascript
const onSegmentStart = (segment, segmentIndex) => {
  // Log the segment info
  console.log(`Starting segment ${segmentIndex}:`, segment.emotion)
  
  // TODO: Add your light API call here
  // setLightForEmotion(segment.emotion)
}
```

#### `playSegment(segmentIndex)`
Loads and plays a specific audio segment.

```javascript
const playSegment = (segmentIndex) => {
  // 1. Trigger segment start event
  onSegmentStart(storySegment, segmentIndex)
  
  // 2. Load audio file
  audioRef.current.src = getAudioUrl(audioSegment.filename)
  
  // 3. Play audio
  audioRef.current.play()
}
```

#### `handleAudioEnded()`
Called when current audio finishes. Automatically moves to next segment.

```javascript
const handleAudioEnded = () => {
  // Update progress
  setProgress(...)
  
  // Move to next segment
  setCurrentSegmentIndex(currentSegmentIndex + 1)
}
```

### 3. **Automatic Progression**

The system uses React's `useEffect` to automatically play the next segment:

```javascript
useEffect(() => {
  if (story && isPlaying) {
    playSegment(currentSegmentIndex)
  }
}, [currentSegmentIndex, story])
```

When `currentSegmentIndex` changes, it automatically triggers `playSegment()`.

## Adding Light Control

### Step 1: Import the light controller

```javascript
import { setLightForEmotion } from '../utils/lightController'
```

### Step 2: Update onSegmentStart

```javascript
const onSegmentStart = async (segment, segmentIndex) => {
  console.log(`Starting segment ${segmentIndex}:`, segment.emotion)
  
  // Set light color based on emotion
  await setLightForEmotion(segment.emotion)
}
```

### Step 3: Configure your light API

Edit `frontend/src/utils/lightController.js` and replace the TODO sections with your actual light API calls.

## Emotion → Color Mapping

| Emotion | Color | RGB |
|---------|-------|-----|
| happy | Gold/Yellow | (255, 215, 0) |
| sad | Sky Blue | (135, 206, 235) |
| excited | Orange | (255, 165, 0) |
| scared | Muted Orange | (255, 140, 105) |
| angry | Muted Red | (200, 100, 100) |
| neutral | Gray | (160, 174, 192) |

## Testing

### Console Logs

The player logs detailed information:

```
🎬 Starting segment 0: { emotion: 'neutral', text: '...', audioFile: '...' }
💡 Light should change to: neutral
🎵 Loading audio: http://localhost:5000/api/audio/...
✓ Playing segment 0
✓ Segment 0 finished
→ Moving to segment 1
...
🎉 Story complete!
```

### Debug Mode

In development, the player shows debug info at the bottom:
- Current segment index
- Current audio filename

## User Controls

### Play/Pause Button
- **Play:** Starts playback from current segment
- **Pause:** Pauses current audio
- **Resume:** Continues from where it paused

### Restart Button
- Resets to segment 0
- Stops playback
- Resets progress to 0%

### Progress Bar
- Shows overall story progress
- Updates after each segment completes

## Error Handling

### Missing Audio File
If a segment has no audio file:
```javascript
if (!audioSegment || !audioSegment.filename) {
  console.error(`No audio file for segment ${segmentIndex}`)
  // Automatically skip to next segment
  setCurrentSegmentIndex(segmentIndex + 1)
}
```

### Playback Error
If audio fails to play:
```javascript
audioRef.current.play()
  .catch(error => {
    console.error('Error playing:', error)
    // Try next segment after delay
    setTimeout(() => {
      setCurrentSegmentIndex(segmentIndex + 1)
    }, 500)
  })
```

## API Integration Examples

### Example 1: Philips Hue

```javascript
const onSegmentStart = async (segment, segmentIndex) => {
  const color = getColorRGBForEmotion(segment.emotion)
  
  await fetch('http://192.168.1.2/api/YOUR_KEY/lights/1/state', {
    method: 'PUT',
    body: JSON.stringify({
      on: true,
      bri: 200,
      xy: rgbToXy(color.r, color.g, color.b)
    })
  })
}
```

### Example 2: Generic RGB LED API

```javascript
const onSegmentStart = async (segment, segmentIndex) => {
  const color = getColorRGBForEmotion(segment.emotion)
  
  await fetch('http://your-arduino-ip/set-color', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      r: color.r,
      g: color.g,
      b: color.b
    })
  })
}
```

### Example 3: MQTT (IoT)

```javascript
import mqtt from 'mqtt'

const client = mqtt.connect('mqtt://your-broker')

const onSegmentStart = (segment, segmentIndex) => {
  const color = getColorRGBForEmotion(segment.emotion)
  
  client.publish('storybook/lights', JSON.stringify({
    emotion: segment.emotion,
    color: color
  }))
}
```

## Performance Considerations

### Preloading
Audio files are loaded on-demand. For smoother transitions, you could preload the next segment:

```javascript
// Preload next segment while current is playing
if (currentSegmentIndex < story.audio_segments.length - 1) {
  const nextAudio = new Audio(getAudioUrl(story.audio_segments[currentSegmentIndex + 1].filename))
  nextAudio.load()
}
```

### Transition Timing
Light changes happen at the START of each segment, giving a seamless experience.

## Customization

### Adjust Transition Speed
Edit `lightController.js`:

```javascript
export async function fadeTransition(fromEmotion, toEmotion, durationMs = 1000) {
  // Implement smooth color fade over durationMs
}
```

### Add Custom Events
In `onSegmentStart()`, add any custom logic:

```javascript
const onSegmentStart = (segment, segmentIndex) => {
  // Light control
  setLightForEmotion(segment.emotion)
  
  // Analytics
  trackSegmentPlay(story.id, segmentIndex, segment.emotion)
  
  // Notifications
  if (segment.emotion === 'scared') {
    showParentAlert('Story entering scary moment')
  }
}
```

## Summary

✅ **Automatic playback** - Segments play back-to-back  
✅ **Event hooks** - `onSegmentStart()` for custom actions  
✅ **Error handling** - Skips problematic segments  
✅ **User controls** - Play/pause/restart  
✅ **Progress tracking** - Visual progress bar  
✅ **Extensible** - Easy to add light control or other integrations  

The system is ready to use! Just add your light API calls to `onSegmentStart()` and you're good to go! 🎉

