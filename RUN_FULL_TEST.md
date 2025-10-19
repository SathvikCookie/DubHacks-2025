# 🧪 Run Full End-to-End Test

## Quick Start

### Step 1: Start Flask Server

```bash
cd backend
python app.py
```

**Wait for:** `Running on http://127.0.0.1:5000`

### Step 2: Run Test (in another terminal)

```bash
cd backend
python test_with_mock_gemini.py
```

This will:
1. ✅ Create a story about Shriyan learning not to lie
2. ✅ Process 12 segments through ElevenLabs
3. ✅ Save 12 MP3 audio files
4. ✅ Store in database
5. ✅ Verify frontend accessibility

**Expected time:** ~30 seconds

### Step 3: View Results

The test will print:
- Story ID
- UUID
- Audio file locations
- Frontend URL to test

### Step 4: Test Frontend

```bash
cd frontend
npm run dev
```

Then open the URL printed by the test (e.g., `http://localhost:3000/player/1`)

---

## What the Test Does

### Mock Story: "Shriyan and the Honest Rabbit"

**Prompt:** "write a story for my child about not lying. my kid's name is Shriyan. Use animal characters."

**Story Summary:**
- Shriyan eats Ruby the Rabbit's berries
- He lies about it
- Feels terrible
- Tells the truth
- Ruby forgives him
- They become better friends
- Moral: Honesty strengthens friendships

**Segments:** 12
**Emotions:** neutral, scared, sad, happy, excited
**Word count:** ~222 words

---

## Expected Output

```
✅ Story Generated
   Title: Shriyan and the Honest Rabbit
   Segments: 12

✅ Audio Processed
   Story ID: 1
   UUID: abc-123-def
   Audio Files: 12/12

✅ Frontend Ready
   Story URL: http://localhost:3000/player/1
```

---

## Files Created

1. **generated_story.json** - Mock Gemini output
2. **processed_story.json** - Backend response with audio metadata
3. **audio_files/[uuid]_segment_*.mp3** - 12 audio files

---

## Troubleshooting

### "Flask server not running"
**Solution:** Start server in Step 1 first

### "403 Forbidden"
**Solution:** Restart Flask server (CORS fix applied)

### "Audio files not generated"
**Solution:** Check ELEVENLABS_API_KEY in .env

### "Gemini import error"
**Solution:** This test uses mock data, no Gemini needed

---

## Next: Test with Real Gemini

Once Gemini package is installed:

```bash
cd backend
python test_end_to_end.py
```

This will use real Gemini API with the same prompt.

---

## Frontend Verification Checklist

When you open the story in frontend:

- [ ] Story title displays: "Shriyan and the Honest Rabbit"
- [ ] First segment text shows
- [ ] Emotion color strip displays (neutral = gray)
- [ ] Play button works
- [ ] Audio plays
- [ ] Text updates to next segment
- [ ] Emotion color changes (scared = orange, sad = blue, etc.)
- [ ] Auto-advances through all 12 segments
- [ ] Progress bar updates
- [ ] Restart button works

---

## 🎯 Success Criteria

✅ All 12 audio files generated  
✅ All files accessible via API  
✅ Story stored in database  
✅ Frontend can load story  
✅ Audio plays sequentially  
✅ Emotions change per segment  

If all criteria met → **System is working perfectly!** 🎉

