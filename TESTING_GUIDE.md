# 🧪 Testing Guide - View Database Stories in Frontend

## Current Status

✅ **Database has 3 stories** with Shriyan content  
✅ **Frontend updated** to fetch from backend API  
✅ **Player ready** for automatic playback  

## Quick Start

### Step 1: Start Backend Server

```bash
cd backend
python app.py
```

**Wait for:** `Running on http://127.0.0.1:5000`

### Step 2: Verify Backend is Working

```bash
# In another terminal
curl http://localhost:5000/api/stories
```

**Expected:** JSON array with 3 stories

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

**Opens:** `http://localhost:3000`

### Step 4: Test the Flow

1. **Stories List Page** (`http://localhost:3000`)
   - Should show 3 stories from database
   - Each card shows:
     - Title: "Shriyan and the Honest Rabbit"
     - 12 segments
     - 12 audio files ready
     - Emotion badges (neutral, scared, sad, happy, excited)

2. **Click any story card**
   - Navigates to player: `http://localhost:3000/player/1`

3. **Player Page**
   - Shows story title
   - Shows first segment text
   - Shows emotion color strip
   - Has play button

4. **Press Play ▶**
   - Audio starts playing
   - Console logs show:
     ```
     🎬 Starting segment 0: { emotion: 'neutral', ... }
     💡 Light should change to: neutral
     🎵 Loading audio: http://localhost:5000/api/audio/...
     ✓ Playing segment 0
     ```
   - After ~10 seconds, segment 0 finishes
   - Automatically moves to segment 1
   - Repeats for all 12 segments

## What You'll See

### Stories List

```
┌─────────────────────────────────────┐
│ ✨ Storybook                         │
│ Magical stories for emotional       │
│ learning                            │
└─────────────────────────────────────┘

Found 3 stories

┌──────────────────────────┐
│ [Color strip]            │
│                          │
│ Shriyan and the Honest   │
│ Rabbit                   │
│                          │
│ 📝 12 segments           │
│ 🎵 12 audio files ready  │
│                          │
│ [neutral] [scared] [sad] │
│ [happy] [excited]        │
│                          │
│ "Once upon a time..."    │
│                          │
│ Recently     Play Story→ │
└──────────────────────────┘
```

### Player

```
┌─────────────────────────────────────┐
│ [Emotion Color Strip - changes]     │
├─────────────────────────────────────┤
│                                     │
│   Shriyan and the Honest Rabbit     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Once upon a time, in a        │ │
│  │ peaceful forest, there lived  │ │
│  │ a young boy named Shriyan...  │ │
│  └───────────────────────────────┘ │
│                                     │
│        Segment 1 of 12              │
│      Emotion: neutral               │
│                                     │
│         ↻      ▶                    │
│                                     │
│  ████████░░░░░░░░░░░░░░░░░░░░      │
│           8% complete               │
│                                     │
│         🎵 Playing...               │
└─────────────────────────────────────┘
```

## Console Output (What to Expect)

When you press play, you'll see:

```
🎬 Starting segment 0: {
  emotion: 'neutral',
  text: 'Once upon a time, in a peaceful forest...',
  audioFile: 'aee553b2-54c0-463b-80aa-1604bdf454c4_segment_000.mp3'
}
💡 Light should change to: neutral
🎵 Loading audio: http://localhost:5000/api/audio/aee553b2-54c0-463b-80aa-1604bdf454c4_segment_000.mp3
✓ Playing segment 0
✓ Segment 0 finished
→ Moving to segment 1

🎬 Starting segment 1: {
  emotion: 'neutral',
  text: 'One day, Shriyan found a basket...',
  audioFile: 'aee553b2-54c0-463b-80aa-1604bdf454c4_segment_001.mp3'
}
💡 Light should change to: neutral
🎵 Loading audio: http://localhost:5000/api/audio/aee553b2-54c0-463b-80aa-1604bdf454c4_segment_001.mp3
✓ Playing segment 1
...
```

## Troubleshooting

### "Connection Error" on Stories List

**Problem:** Backend not running or wrong URL

**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If not, start it
cd backend && python app.py
```

### "No audio available" on Player

**Problem:** Story doesn't have audio_segments

**Solution:** The 3 stories in database should have audio. Check:
```bash
cd backend
python -c "from app import create_app; from models import Story; app = create_app(); 
with app.app_context():
    s = Story.query.get(1)
    print(f'Audio segments: {len(s.audio_segments) if s.audio_segments else 0}')"
```

### Audio doesn't play

**Problem:** CORS or audio file not accessible

**Solution:**
1. Check browser console for errors
2. Try accessing audio directly: `http://localhost:5000/api/audio/[filename]`
3. Make sure Flask CORS is enabled (already done in app.py)

### Segments don't auto-advance

**Problem:** JavaScript error or audio event not firing

**Solution:**
1. Open browser DevTools console
2. Look for errors
3. Check that `handleAudioEnded` is being called

## Testing Checklist

- [ ] Backend server starts successfully
- [ ] `/api/stories` returns 3 stories
- [ ] Frontend loads without errors
- [ ] Stories list shows 3 cards
- [ ] Each card shows "12 audio files ready"
- [ ] Clicking a card navigates to player
- [ ] Player shows story title and first segment
- [ ] Play button works
- [ ] Audio plays
- [ ] Segment text updates after audio finishes
- [ ] Emotion color strip changes
- [ ] Progress bar updates
- [ ] All 12 segments play automatically
- [ ] Console shows segment transitions

## Next Steps

Once basic playback works:

1. **Add Light Control**
   - Edit `onSegmentStart()` in PlayerFullScreen.jsx
   - Add your light API call
   - Test with real lights

2. **Test with New Stories**
   - Generate new story with Gemini
   - Process through backend
   - Verify it appears in list
   - Play and test

3. **Polish UI**
   - Adjust colors
   - Add animations
   - Improve transitions

---

## Quick Commands Reference

```bash
# Start backend
cd backend && python app.py

# Start frontend
cd frontend && npm run dev

# Check database stories
cd backend && python -c "from app import create_app; from models import Story; app = create_app(); 
with app.app_context(): print(f'Stories: {Story.query.count()}')"

# Test API
curl http://localhost:5000/api/stories
curl http://localhost:5000/api/stories/1

# View audio files
ls -lh backend/audio_files/
```

---

## Success Criteria

✅ Stories list loads from database  
✅ Story cards show correct metadata  
✅ Player loads story data  
✅ Audio plays automatically  
✅ Segments advance automatically  
✅ Emotion colors change per segment  
✅ Console logs show transitions  

When all criteria are met, the system is working! 🎉

