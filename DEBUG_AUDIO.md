# 🔍 Audio Playback Debugging Guide

## Issues Found

### 1. ❌ Port Mismatch
**Problem:** Frontend calls `localhost:5001` but Flask runs on `5000`

**Fixed:** Updated `frontend/src/services/api.js` to use port 5000

### 2. ❌ Flask Server Not Running
**Problem:** Getting 403 from AirPlay service, not Flask

**Solution:** Make sure Flask server is actually running

### 3. ⚠️ Path Resolution
**Problem:** Audio files might not be found due to relative paths

**Fixed:** Added logging to track file resolution

## How to Debug

### Step 1: Verify Flask Server is Running

```bash
# Check if Flask is actually running on port 5000
lsof -i:5000

# Should show Python process, not ControlCenter/AirTunes
```

### Step 2: Test Audio Endpoint Directly

```bash
# Test with curl
curl -I http://localhost:5000/api/audio/aee553b2-54c0-463b-80aa-1604bdf454c4_segment_000.mp3

# Should return:
# HTTP/1.1 200 OK
# Content-Type: audio/mpeg
```

### Step 3: Check Audio Files Exist

```bash
cd backend
ls -lh audio_files/*.mp3 | head -5

# Should show MP3 files with sizes like 100-150 KB
```

### Step 4: Test in Browser

Open browser and try to access audio directly:
```
http://localhost:5000/api/audio/aee553b2-54c0-463b-80aa-1604bdf454c4_segment_000.mp3
```

Should download or play the MP3 file.

### Step 5: Check Browser Console

Open DevTools Console (F12) and look for:
- Network errors (red entries)
- CORS errors
- 404 errors
- Audio loading errors

### Step 6: Check Flask Logs

Flask terminal should show:
```
🎵 Audio request: aee553b2-54c0-463b-80aa-1604bdf454c4_segment_000.mp3
   Looking for: /Users/adig/Documents/DubHacks-2025/backend/audio_files/...
   ✓ File found, serving...
```

## Common Issues & Solutions

### Issue: "Connection refused"
**Cause:** Flask not running  
**Solution:** `cd backend && python app.py`

### Issue: "403 Forbidden"
**Cause:** Wrong port (hitting macOS AirPlay on 5000)  
**Solution:** Kill AirPlay process or use different port for Flask

```bash
# Option 1: Kill process on 5000
lsof -ti:5000 | xargs kill -9

# Option 2: Run Flask on different port
python app.py  # Then update API_BASE in frontend
```

### Issue: "404 Not Found"
**Cause:** Audio file doesn't exist or wrong path  
**Solution:**
```bash
# Check if file exists
ls backend/audio_files/[filename].mp3

# Check Flask logs for actual path being searched
```

### Issue: "CORS error"
**Cause:** CORS not configured  
**Solution:** Already fixed in app.py with `CORS(app)`

### Issue: Audio loads but doesn't play
**Cause:** Browser autoplay policy  
**Solution:** User must interact (click play button) first - already handled

### Issue: "net::ERR_EMPTY_RESPONSE"
**Cause:** File path is directory or file is empty  
**Solution:**
```bash
# Check file size
ls -lh backend/audio_files/*.mp3

# Files should be 50-200 KB, not 0 bytes
```

## Testing Checklist

Run through these tests:

- [ ] Flask server is running on port 5000
- [ ] `lsof -i:5000` shows Python process
- [ ] `curl http://localhost:5000/api/health` returns `{"status":"ok"}`
- [ ] `curl -I http://localhost:5000/api/audio/[filename].mp3` returns 200
- [ ] Audio files exist in `backend/audio_files/`
- [ ] Files are not empty (50-200 KB each)
- [ ] Browser can access audio URL directly
- [ ] Browser console shows no CORS errors
- [ ] Flask logs show audio requests
- [ ] Audio element in player has correct `src`

## Quick Test Script

```bash
#!/bin/bash

echo "🔍 Audio Playback Diagnostics"
echo "============================"

# Check Flask server
echo ""
echo "1. Flask Server:"
if lsof -i:5000 | grep -q Python; then
    echo "   ✓ Flask running on port 5000"
else
    echo "   ✗ Flask NOT running on port 5000"
fi

# Check audio files
echo ""
echo "2. Audio Files:"
COUNT=$(ls backend/audio_files/*.mp3 2>/dev/null | wc -l)
echo "   Found $COUNT MP3 files"

# Check API health
echo ""
echo "3. API Health:"
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo "   ✓ API responding"
else
    echo "   ✗ API not responding"
fi

# Test audio endpoint
echo ""
echo "4. Audio Endpoint:"
FILE=$(ls backend/audio_files/*.mp3 2>/dev/null | head -1 | xargs basename)
if [ -n "$FILE" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/audio/$FILE)
    if [ "$STATUS" = "200" ]; then
        echo "   ✓ Audio endpoint working (HTTP $STATUS)"
    else
        echo "   ✗ Audio endpoint returned HTTP $STATUS"
    fi
fi

echo ""
echo "============================"
```

Save as `test_audio.sh` and run:
```bash
chmod +x test_audio.sh
./test_audio.sh
```

## If Still Not Working

### Get Detailed Logs

1. **Frontend Console:**
```javascript
// In PlayerFullScreen.jsx, add to playSegment():
console.log('Audio URL:', audioUrl)
console.log('Audio element:', audioRef.current)
audioRef.current.addEventListener('error', (e) => {
  console.error('Audio error:', e)
  console.error('Error code:', audioRef.current.error?.code)
  console.error('Error message:', audioRef.current.error?.message)
})
```

2. **Backend Logs:**
Already added logging to audio.py - watch Flask terminal

3. **Network Tab:**
- Open DevTools → Network tab
- Filter by "audio" or "mp3"
- Click play
- Check HTTP status, response headers, and response body

## Expected Behavior

When working correctly:

1. **Click Play**
2. **Console shows:**
   ```
   🎬 Starting segment 0: {...}
   💡 Light should change to: neutral
   🎵 Loading audio: http://localhost:5000/api/audio/xxx_segment_000.mp3
   ```

3. **Network tab shows:**
   ```
   GET /api/audio/xxx_segment_000.mp3
   Status: 200
   Type: audio/mpeg
   Size: 154 KB
   ```

4. **Flask shows:**
   ```
   🎵 Audio request: xxx_segment_000.mp3
      Looking for: /Users/.../audio_files/xxx_segment_000.mp3
      ✓ File found, serving...
   127.0.0.1 - - [date] "GET /api/audio/xxx_segment_000.mp3 HTTP/1.1" 200 -
   ```

5. **Audio plays from speakers** 🔊

---

## Quick Fix Summary

✅ **Fixed port mismatch** (5001 → 5000)  
✅ **Added detailed logging** to track issues  
✅ **Added error handling** in audio endpoint  

**Next:** Restart Flask server and frontend, then test!

