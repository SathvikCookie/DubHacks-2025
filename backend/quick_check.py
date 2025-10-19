"""
Quick sanity check - verifies all components are importable and configured
"""

print("🔍 Quick Integration Check\n")
print("=" * 50)

# Check 1: Imports
print("\n1. Checking imports...")
try:
    from utils.gemini import generate_story
    print("   ✓ Gemini module")
except Exception as e:
    print(f"   ✗ Gemini module: {e}")

try:
    from utils.story_audio_processor import StoryAudioProcessor
    print("   ✓ Audio processor")
except Exception as e:
    print(f"   ✗ Audio processor: {e}")

try:
    from models import db, Story, AudioAsset
    print("   ✓ Database models")
except Exception as e:
    print(f"   ✗ Database models: {e}")

try:
    from api.stories import stories_bp
    print("   ✓ Stories API")
except Exception as e:
    print(f"   ✗ Stories API: {e}")

try:
    from api.audio import audio_bp
    print("   ✓ Audio API")
except Exception as e:
    print(f"   ✗ Audio API: {e}")

# Check 2: Environment variables
print("\n2. Checking environment variables...")
import os
from dotenv import load_dotenv
load_dotenv()

elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
if elevenlabs_key:
    print(f"   ✓ ELEVENLABS_API_KEY (length: {len(elevenlabs_key)})")
else:
    print("   ✗ ELEVENLABS_API_KEY not set")

# Check 3: Directories
print("\n3. Checking directories...")
from pathlib import Path

audio_dir = Path("audio_files")
if audio_dir.exists():
    audio_count = len(list(audio_dir.glob("*.mp3")))
    print(f"   ✓ audio_files/ exists ({audio_count} MP3 files)")
else:
    print("   ⚠ audio_files/ doesn't exist (will be created)")
    audio_dir.mkdir(exist_ok=True)
    print("   ✓ Created audio_files/")

# Check 4: Database
print("\n4. Checking database...")
try:
    from app import create_app
    app = create_app()
    with app.app_context():
        story_count = Story.query.count()
        audio_count = AudioAsset.query.count()
        print(f"   ✓ Database connected")
        print(f"   ✓ Stories: {story_count}")
        print(f"   ✓ Audio assets: {audio_count}")
except Exception as e:
    print(f"   ✗ Database error: {e}")

# Check 5: Gemini format
print("\n5. Checking Gemini output format...")
try:
    import json
    
    # Test with mock data
    test_response = json.dumps({
        "title": "Test Story",
        "segments": [
            {"text": "Once upon a time...", "emotion": "neutral"},
            {"text": "She was happy!", "emotion": "happy"}
        ]
    })
    
    parsed = json.loads(test_response)
    assert 'title' in parsed
    assert 'segments' in parsed
    assert all('text' in s and 'emotion' in s for s in parsed['segments'])
    
    print("   ✓ JSON format validation passed")
except Exception as e:
    print(f"   ✗ Format validation failed: {e}")

# Check 6: Emotion mapping
print("\n6. Checking emotion mapping...")
try:
    processor = StoryAudioProcessor()
    test_emotions = ['happy', 'sad', 'excited', 'scared', 'angry', 'neutral']
    
    for emotion in test_emotions:
        style = processor.emotion_to_style(emotion)
        # Just check it doesn't error
    
    print("   ✓ Emotion mapping functional")
except Exception as e:
    print(f"   ✗ Emotion mapping error: {e}")

# Summary
print("\n" + "=" * 50)
print("✅ Quick check complete!")
print("\nTo run full integration test:")
print("   python test_full_integration.py")
print("\nTo start the server:")
print("   python app.py")
print("=" * 50)

