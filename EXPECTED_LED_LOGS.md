# 💡 Expected Console Logs - LED Control

## Successful LED Set (With Credentials)

When a story segment starts and the LED successfully changes color, you'll see:

### Complete Success Output

```javascript
// 1. Segment starts
🎬 Starting segment 0: {
  emotion: 'neutral',
  text: 'Once upon a time, in a peaceful forest, there live...',
  audioFile: 'ca3d7947-7a58-4fe0-b1ab-7d0140faa629_segment_000.mp3'
}

// 2. Light color change initiated
💡 Setting light to: neutral

// 3. Light controller processing
💡 Setting light color for emotion: neutral
   RGB: (255, 255, 255) → 16777215

// 4. Color API call successful
   ✓ Light color set: {
     code: 200,
     message: "Success",
     payload: {}
   }

// 5. Brightness API call successful
   ✓ Brightness set to 100%

// 6. Audio starts playing
🎵 Loading audio: http://localhost:5001/api/audio/ca3d7947-7a58-4fe0-b1ab-7d0140faa629_segment_000.mp3
   Segment: { text: '...', emotion: 'neutral' }
   Audio metadata: { filename: '...', duration: 8.5 }
✓ Playing segment 0
```

### Next Segment (Different Emotion)

```javascript
// Segment 0 finishes
✓ Segment 0 finished
→ Moving to segment 1

// Segment 1 starts with new emotion
🎬 Starting segment 1: {
  emotion: 'happy',
  text: 'The rabbit hopped joyfully through the meadow, fee...',
  audioFile: 'ca3d7947-7a58-4fe0-b1ab-7d0140faa629_segment_001.mp3'
}

💡 Setting light to: happy
💡 Setting light color for emotion: happy
   RGB: (255, 215, 0) → 16766720
   ✓ Light color set: { code: 200, message: "Success", payload: {} }
   ✓ Brightness set to 100%

🎵 Loading audio: http://localhost:5001/api/audio/ca3d7947-7a58-4fe0-b1ab-7d0140faa629_segment_001.mp3
✓ Playing segment 1
```

## Without Credentials (Graceful Fallback)

If you haven't added Govee credentials yet:

```javascript
🎬 Starting segment 0: { emotion: 'neutral', ... }

💡 Setting light to: neutral
💡 Setting light color for emotion: neutral
   ℹ️  Govee lights not configured (set VITE_GOVEE_* env vars)

🎵 Loading audio: http://localhost:5001/api/audio/...
✓ Playing segment 0
```

**Note:** Everything else still works - audio plays normally!

## Full Story Playback Example

Here's what a complete story looks like with LED control:

```javascript
// Story loads
Story loaded: {
  id: 1,
  title: "Shriyan and the Honest Rabbit",
  segments: [12],
  audio_segments: [12]
}

// User clicks play
▶ Playing

// ===== SEGMENT 0: neutral =====
🎬 Starting segment 0: { emotion: 'neutral', ... }
💡 Setting light to: neutral
   RGB: (255, 255, 255) → 16777215
   ✓ Light color set
   ✓ Brightness set to 100%
🎵 Loading audio: ...segment_000.mp3
✓ Playing segment 0

// ... 8 seconds later ...
✓ Segment 0 finished
→ Moving to segment 1

// ===== SEGMENT 1: neutral =====
🎬 Starting segment 1: { emotion: 'neutral', ... }
💡 Setting light to: neutral
   RGB: (255, 255, 255) → 16777215
   ✓ Light color set
   ✓ Brightness set to 100%
🎵 Loading audio: ...segment_001.mp3
✓ Playing segment 1

✓ Segment 1 finished
→ Moving to segment 2

// ===== SEGMENT 2: scared =====
🎬 Starting segment 2: { emotion: 'scared', ... }
💡 Setting light to: scared
   RGB: (255, 140, 105) → 16750697
   ✓ Light color set
   ✓ Brightness set to 100%
🎵 Loading audio: ...segment_002.mp3
✓ Playing segment 2

✓ Segment 2 finished
→ Moving to segment 3

// ===== SEGMENT 3: sad =====
🎬 Starting segment 3: { emotion: 'sad', ... }
💡 Setting light to: sad
   RGB: (135, 206, 235) → 8900331
   ✓ Light color set
   ✓ Brightness set to 100%
🎵 Loading audio: ...segment_003.mp3
✓ Playing segment 3

// ... continues for all 12 segments ...

🎉 Story complete!
```

## API Response Details

### Successful Govee API Response

```javascript
{
  code: 200,
  message: "Success",
  payload: {}
}
```

### Govee API Error Response

```javascript
{
  code: 400,
  message: "Invalid params"
}
// or
{
  code: 401,
  message: "Unauthorized"
}
```

## Error Scenarios

### Invalid API Key

```javascript
💡 Setting light color for emotion: happy
   RGB: (255, 215, 0) → 16766720
   ✗ Error setting light color: Error: HTTP 401: {"code":401,"message":"Unauthorized"}
```

### Wrong Device ID/SKU

```javascript
💡 Setting light color for emotion: happy
   RGB: (255, 215, 0) → 16766720
   ✗ Error setting light color: Error: HTTP 400: {"code":400,"message":"Invalid params"}
```

### Network Error

```javascript
💡 Setting light color for emotion: happy
   RGB: (255, 215, 0) → 16766720
   ✗ Error setting light color: TypeError: Failed to fetch
```

## Emotion Color Values Reference

For quick reference when reading logs:

| Emotion | RGB | Govee Value | Visual |
|---------|-----|-------------|--------|
| happy | (255, 215, 0) | 16766720 | 🟡 Gold |
| sad | (135, 206, 235) | 8900331 | 🔵 Blue |
| excited | (255, 165, 0) | 16754176 | 🟠 Orange |
| scared | (255, 140, 105) | 16750697 | 🟧 Coral |
| angry | (200, 100, 100) | 13132900 | 🔴 Red |
| calm | (160, 174, 192) | 10533568 | ⚪ Gray-Blue |
| neutral | (255, 255, 255) | 16777215 | ⚪ White |

## Network Tab (DevTools)

If you want to see the actual API requests, open DevTools → Network tab:

### Successful Request

```
POST https://openapi.api.govee.com/router/api/v1/device/control
Status: 200 OK
Request Headers:
  Govee-API-Key: sk_abc123...
  Content-Type: application/json
Request Payload:
  {
    "requestId": "story-1729308000123-abc123",
    "payload": {
      "sku": "H6076",
      "device": "AB:CD:EF:12:34:56:78:90",
      "capability": {
        "type": "devices.capabilities.color_setting",
        "instance": "colorRgb",
        "value": 16766720
      }
    }
  }
Response:
  {
    "code": 200,
    "message": "Success",
    "payload": {}
  }
```

## How to View Logs

### Browser Console
1. Open DevTools (F12 or Cmd+Option+I)
2. Click "Console" tab
3. Play a story
4. Watch logs appear in real-time

### Filter Logs
```javascript
// In console, filter by:
💡  // Shows only light-related logs
🎬  // Shows segment starts
✓   // Shows successful operations
```

## What to Look For

### ✅ Everything Working
- See `💡 Setting light color for emotion: [emotion]`
- See `RGB: (...) → [number]`
- See `✓ Light color set`
- See `✓ Brightness set to 100%`
- Light physically changes color

### ⚠️ Not Configured
- See `ℹ️ Govee lights not configured`
- No errors, just informational message
- Audio still plays normally

### ❌ Configuration Error
- See `✗ Error setting light color:`
- See error details (401, 400, etc.)
- Check your credentials in `.env`

## Testing Checklist

Run through this to verify everything works:

- [ ] See segment start message: `🎬 Starting segment X`
- [ ] See light setting message: `💡 Setting light to: [emotion]`
- [ ] See RGB calculation: `RGB: (...) → [value]`
- [ ] See success message: `✓ Light color set`
- [ ] See brightness message: `✓ Brightness set to 100%`
- [ ] See audio playing: `✓ Playing segment X`
- [ ] Physical light changes color (if you're watching it)
- [ ] Next segment triggers new color change

## Quick Debug Commands

### Check if credentials are loaded:
```javascript
// In browser console:
console.log('Govee API Key:', import.meta.env.VITE_GOVEE_API_KEY ? 'Set' : 'Not set')
console.log('Device ID:', import.meta.env.VITE_GOVEE_DEVICE_ID ? 'Set' : 'Not set')
console.log('Device SKU:', import.meta.env.VITE_GOVEE_DEVICE_SKU ? 'Set' : 'Not set')
```

### Manually test light:
```javascript
// In browser console:
import { setLightColor } from './utils/lightController.js'
setLightColor('happy')  // Should turn light gold
```

---

## Summary

**Successful LED set looks like:**

```
💡 Setting light color for emotion: happy
   RGB: (255, 215, 0) → 16766720
   ✓ Light color set: { code: 200, ... }
   ✓ Brightness set to 100%
```

If you see this pattern, your LEDs are working! 🎉

