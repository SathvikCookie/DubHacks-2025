# 🎯 Complete Integration Guide - Gemini → ElevenLabs → Frontend

## Overview

This system processes stories from Gemini API output, generates audio for each emotion segment separately, stores everything in a database, and serves it to the frontend for playback.

## Architecture Flow

```
1. Gemini API → Segments with emotions
2. Story created in DB (without audio)
3. Each segment → Separate ElevenLabs API call
4. Audio files saved to disk
5. AudioAsset records created in DB
6. Story marked as processed
7. Frontend fetches and plays segments sequentially
```

## Database Schema

### Story Model
```python
{
    id: Integer (primary key)
    uuid: String (unique identifier)
    title: String
    content: Text (full story)
    prompt: Text
    segments: JSON [{"text": "...", "emotion": "sad"}]
    audio_segments: JSON [{"segment_index": 0, "filename": "...", ...}]
    created_at: DateTime
    processed_at: DateTime
}
```

### AudioAsset Model
```python
{
    id: Integer
    story_id: Integer (foreign key)
    segment_index: Integer
    filename: String
    file_path: String
    emotion: String
    duration: Float
    created_at: DateTime
}
```

## API Endpoints

### 1. Generate Story with Audio

**POST** `/api/stories/generate`

**Request Body:**
```json
{
  "title": "Story Title",
  "prompt": "Original prompt (optional)",
  "segments": [
    {"text": "Once upon a time...", "emotion": "neutral"},
    {"text": "She was sad.", "emotion": "sad"},
    {"text": "Then she was happy!", "emotion": "happy"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "story": {
    "id": 1,
    "uuid": "abc-123-def",
    "title": "Story Title",
    "content": "Once upon a time... She was sad. Then she was happy!",
    "segments": [...],
    "audio_segments": [
      {
        "segment_index": 0,
        "text": "Once upon a time...",
        "emotion": "neutral",
        "audio_file": "/path/to/audio_files/abc-123-def_segment_000.mp3",
        "filename": "abc-123-def_segment_000.mp3",
        "duration": null
      },
      ...
    ],
    "created_at": "2025-10-19T...",
    "processed_at": "2025-10-19T..."
  },
  "message": "Story created with 3 audio segments"
}
```

### 2. Get All Stories

**GET** `/api/stories`

Returns array of all stories with audio metadata.

### 3. Get Single Story

**GET** `/api/stories/<id>`

Returns single story with full details.

### 4. Serve Audio File

**GET** `/api/audio/<filename>`

Returns MP3 audio file for playback.

Example: `http://localhost:5000/api/audio/abc-123-def_segment_000.mp3`

### 5. Delete Story

**DELETE** `/api/stories/<id>`

Deletes story and all associated audio files from disk.

## Audio Processing Logic

### StoryAudioProcessor Class

Located in: `backend/utils/story_audio_processor.py`

**Key Methods:**

1. **`emotion_to_style(emotion)`**
   - Maps emotions to ElevenLabs style markers
   - sad → softly, happy → happily, etc.

2. **`format_text_for_api(text, emotion)`**
   - Formats text with emotion style: `{softly} She was sad.`
   - Removes existing style markers

3. **`process_segment(segment, voice_id)`**
   - Makes single API call to ElevenLabs text-to-dialogue
   - Returns audio bytes

4. **`process_story_segments(story_uuid, segments, voice_id, delay)`**
   - Processes all segments sequentially
   - Saves each audio file separately
   - Returns metadata array
   - Includes 1-second delay between calls (rate limiting)

## File Storage

**Location:** `backend/audio_files/`

**Naming Convention:** `{story_uuid}_segment_{index:03d}.mp3`

**Examples:**
- `abc-123-def_segment_000.mp3`
- `abc-123-def_segment_001.mp3`
- `abc-123-def_segment_002.mp3`

## Frontend Integration

### API Client (`frontend/src/services/api.js`)

```javascript
// Generate story with audio
const result = await generateStory({
  title: "My Story",
  segments: [
    {text: "...", emotion: "sad"},
    {text: "...", emotion: "happy"}
  ]
})

// Get audio URL
const audioUrl = getAudioUrl(filename)
// Returns: http://localhost:5000/api/audio/filename.mp3
```

### Player Component (`frontend/src/pages/PlayerFullScreen.jsx`)

**Features:**
- Loads story with audio segments
- Plays segments sequentially
- Auto-advances to next segment when current finishes
- Shows current segment text
- Displays emotion color strip
- Progress bar tracks segment progress
- Restart button resets to beginning

**Audio Playback Flow:**
1. Load first segment audio
2. User presses play
3. Audio plays for current segment
4. On 'ended' event, advance to next segment
5. Auto-play next segment
6. Repeat until all segments complete

## Testing

### 1. Test Audio Processing (Standalone)

```bash
cd backend/utils
python story_audio_processor.py
```

This will process 3 test segments and save audio files.

### 2. Test Full Integration

```bash
# Terminal 1: Start Flask server
cd backend
python app.py

# Terminal 2: Run test script
cd backend
python test_story_generation.py
```

This will:
- Send a POST request to `/api/stories/generate`
- Process 4 segments through ElevenLabs
- Save audio files
- Store in database
- Print results

### 3. Test Frontend

```bash
cd frontend
npm run dev
```

Then:
1. Generate a story using the test script
2. Open frontend at `http://localhost:3000`
3. Click on the generated story
4. Press play to hear audio segments

## Emotion Mapping

```python
{
    'sad': 'softly',
    'excited': 'excitedly',
    'happy': 'happily',
    'angry': 'angrily',
    'joy': 'happily',
    'fear': 'nervously',
    'surprise': 'excitedly',
    'neutral': '',
    'calm': 'gently'
}
```

## Error Handling

### API Errors
- If ElevenLabs API fails for a segment, metadata is still created with `"error": "Failed to generate audio"`
- Story is still saved, but that segment won't have audio
- Frontend should handle missing audio gracefully

### Rate Limiting
- 1-second delay between API calls (configurable)
- Adjust `delay` parameter in `process_story_segments()`

### File Storage
- Audio directory created automatically if doesn't exist
- Files are deleted when story is deleted

## Configuration

### Voice ID
Currently hardcoded to: `t9aQ9igYdTOv1RmpYub9`

To change, update in:
- `backend/api/stories.py` line ~73
- `backend/utils/story_audio_processor.py` default parameter

### API Key
Set in `.env` file:
```
ELEVENLABS_API_KEY=your_key_here
```

### Database
SQLite by default: `sqlite:///storybook.db`

Change in `backend/config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'postgresql://...'
```

## Example Gemini Integration

```python
# In your Gemini API wrapper
def generate_story_from_gemini(prompt):
    # Call Gemini API
    gemini_response = gemini_api.generate(prompt)
    
    # Parse response into segments
    segments = parse_gemini_response(gemini_response)
    
    # Send to Flask API
    response = requests.post(
        'http://localhost:5000/api/stories/generate',
        json={
            'title': extract_title(gemini_response),
            'prompt': prompt,
            'segments': segments
        }
    )
    
    return response.json()
```

## Troubleshooting

### Issue: Audio files not generating
- Check ElevenLabs API key in `.env`
- Check API quota/rate limits
- Look at console output for error messages

### Issue: Frontend can't play audio
- Check CORS is enabled in Flask
- Verify audio file exists in `audio_files/` directory
- Check browser console for network errors
- Verify audio URL is correct

### Issue: Database errors
- Run `db.create_all()` to create tables
- Check SQLAlchemy connection string
- Verify write permissions

### Issue: Segments not advancing
- Check `handleAudioEnded` is firing
- Verify audio 'ended' event listener is attached
- Check currentSegmentIndex is updating

## Performance Considerations

### Processing Time
- Each segment takes ~2-3 seconds to process
- 10 segments = ~30 seconds total
- Consider background job queue for production

### Storage
- Each audio segment is ~50-150 KB
- 10-segment story = ~1 MB total
- Plan storage accordingly

### Rate Limiting
- Current: 1 request per second
- Adjust delay if you have higher quota
- Consider batch processing for multiple stories

## Next Steps

1. **Integrate with Gemini API** - Replace test data with real Gemini output
2. **Add Progress Indicators** - Show audio generation progress to user
3. **Background Processing** - Use Celery/RQ for async processing
4. **Audio Merging** - Option to merge segments into single file
5. **Caching** - Cache generated audio to avoid regeneration
6. **Analytics** - Track which emotions/stories are most popular

---

## Quick Reference

**Generate Story:**
```bash
curl -X POST http://localhost:5000/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "segments": [{"text": "Hello", "emotion": "happy"}]}'
```

**Get Audio:**
```bash
curl http://localhost:5000/api/audio/story-uuid_segment_000.mp3 --output audio.mp3
```

**Delete Story:**
```bash
curl -X DELETE http://localhost:5000/api/stories/1
```

---

🎉 **You're all set!** The complete pipeline from Gemini → ElevenLabs → Database → Frontend is ready to go!

