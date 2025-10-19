# ElevenLabs Integration Guide

## Overview

The ElevenLabs integration handles text-to-speech generation for story narration using the text-to-dialogue endpoint, which allows for seamless multi-segment audio generation.

## Function: `generate_story_audio_from_gemini`

### Purpose
Converts Gemini API output (text segments with emotions) into a single audio file using your custom voice.

### Input Format
```python
gemini_segments = [
    {
        "text": "Once upon a time, there was a little star.",
        "emotion": "neutral"
    },
    {
        "text": "She felt very sad.",
        "emotion": "sad"
    },
    {
        "text": "But then she found happiness!",
        "emotion": "happy"
    }
]
```

### Usage Example

```python
from utils.elevenlabs_client import generate_story_audio_from_gemini

# Your Gemini output
segments = [
    {"text": "Hello world", "emotion": "happy"},
    {"text": "This is a test", "emotion": "neutral"}
]

# Generate audio
audio_path = generate_story_audio_from_gemini(
    gemini_segments=segments,
    output_filename="my_story.mp3"
)

# audio_path will be: /path/to/backend/my_story.mp3
```

## API Endpoint Usage

### Generate Audio from Segments

**Endpoint:** `POST /api/tts/generate`

**Request:**
```json
{
  "segments": [
    {"text": "Once upon a time...", "emotion": "neutral"},
    {"text": "She was very sad.", "emotion": "sad"}
  ],
  "story_id": 123,
  "filename": "story_123.mp3"
}
```

**Response:**
```json
{
  "success": true,
  "audio_url": "/audio/story_123.mp3",
  "file_path": "/Users/adig/Documents/DubHacks-2025/backend/story_123.mp3",
  "message": "Audio generated successfully"
}
```

### Get Audio File

**Endpoint:** `GET /api/tts/audio/<filename>`

**Example:** `GET /api/tts/audio/story_123.mp3`

Returns the audio file for playback.

## Voice Configuration

Currently using voice ID: `t9aQ9igYdTOv1RmpYub9`

To change the voice, update the `voice_id` variable in the `generate_story_audio_from_gemini` function.

## File Storage

All generated audio files are saved in the `backend/` folder with the specified filename.

Example paths:
- `/Users/adig/Documents/DubHacks-2025/backend/story_1.mp3`
- `/Users/adig/Documents/DubHacks-2025/backend/test_story_output.mp3`

## Testing

Run the test script:
```bash
cd backend/utils
python elevenlabs_client.py
```

This will:
1. Create a test story with 4 segments
2. Generate audio using your voice
3. Save to `backend/test_story_output.mp3`

## Integration with Gemini

When you receive output from Gemini in the format:
```python
gemini_response = [
    {"text": "...", "emotion": "sad"},
    {"text": "...", "emotion": "happy"}
]
```

Simply pass it directly to the function:
```python
audio_path = generate_story_audio_from_gemini(
    gemini_segments=gemini_response,
    output_filename=f"story_{story_id}.mp3"
)
```

## Error Handling

The function returns:
- **Success:** Full path to the audio file
- **Failure:** `None`

Always check the return value:
```python
audio_path = generate_story_audio_from_gemini(segments)
if audio_path:
    print(f"Success! Audio at: {audio_path}")
else:
    print("Failed to generate audio")
```

## Notes

- The emotion field from Gemini is currently not used by ElevenLabs but is preserved for future sentiment analysis
- All segments use the same voice ID (your custom voice)
- The text-to-dialogue endpoint automatically handles timing and transitions between segments
- Audio format is MP3 by default

## Future Enhancements

- [ ] Map emotions to different voice styles or parameters
- [ ] Add voice selection per segment
- [ ] Implement audio streaming for large stories
- [ ] Add progress callbacks for long generations

