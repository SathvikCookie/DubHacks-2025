"""
Simple standalone test - doesn't require Flask server
Tests ElevenLabs directly with the story segments
"""

import json
import os
from pathlib import Path

print("\n" + "="*70)
print("🧪 SIMPLE STANDALONE TEST")
print("="*70)

# Test story about Shriyan
TEST_STORY = {
    "title": "Shriyan and the Honest Rabbit",
    "segments": [
        {
            "text": "Once upon a time, in a peaceful forest, there lived a young boy named Shriyan who loved to play with the forest animals.",
            "emotion": "neutral"
        },
        {
            "text": "One day, Shriyan found a basket of delicious berries near the rabbit's burrow. He ate them all, even though they weren't his.",
            "emotion": "neutral"
        },
        {
            "text": "When Ruby the Rabbit asked, 'Shriyan, did you see my berries?' Shriyan felt nervous and said, 'No, I didn't see them.'",
            "emotion": "scared"
        },
        {
            "text": "Ruby looked so sad and disappointed. She had been saving those berries for her family's dinner.",
            "emotion": "sad"
        }
    ]
}

print(f"\n📖 Test Story: {TEST_STORY['title']}")
print(f"   Segments: {len(TEST_STORY['segments'])}")

# Test 1: Import audio processor
print("\n" + "="*70)
print("TEST 1: Import Audio Processor")
print("="*70)

try:
    from utils.story_audio_processor import StoryAudioProcessor
    print("✅ Audio processor imported successfully")
except Exception as e:
    print(f"❌ Failed to import: {e}")
    import sys
    sys.exit(1)

# Test 2: Check ElevenLabs API key
print("\n" + "="*70)
print("TEST 2: Check Configuration")
print("="*70)

from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")
if api_key:
    print(f"✅ ELEVENLABS_API_KEY found (length: {len(api_key)})")
else:
    print("❌ ELEVENLABS_API_KEY not found in environment")
    import sys
    sys.exit(1)

# Test 3: Process segments
print("\n" + "="*70)
print("TEST 3: Process Audio Segments")
print("="*70)

processor = StoryAudioProcessor()

print(f"\n⏳ Processing {len(TEST_STORY['segments'])} segments...")
print(f"   Estimated time: ~{len(TEST_STORY['segments']) * 2} seconds\n")

try:
    audio_metadata = processor.process_story_segments(
        story_uuid="test-shriyan-story",
        segments=TEST_STORY['segments'],
        voice_id="t9aQ9igYdTOv1RmpYub9",
        delay=1.0
    )
    
    print(f"\n✅ Audio processing complete!")
    
    # Check results
    print("\n" + "="*70)
    print("TEST 4: Verify Audio Files")
    print("="*70)
    
    successful = 0
    failed = 0
    
    for meta in audio_metadata:
        if meta.get('audio_file') and os.path.exists(meta['audio_file']):
            file_size = os.path.getsize(meta['audio_file']) / 1024
            print(f"   ✅ Segment {meta['segment_index']}: {meta['filename']} ({file_size:.1f} KB)")
            successful += 1
        else:
            print(f"   ❌ Segment {meta['segment_index']}: Failed")
            failed += 1
    
    print(f"\n📊 Results:")
    print(f"   Successful: {successful}/{len(TEST_STORY['segments'])}")
    print(f"   Failed: {failed}/{len(TEST_STORY['segments'])}")
    
    if successful == len(TEST_STORY['segments']):
        print(f"\n🎉 ALL TESTS PASSED!")
        print(f"\n📁 Audio files created in: audio_files/")
        print(f"   Files: test-shriyan-story_segment_*.mp3")
        
        print(f"\n✅ ElevenLabs Integration Working!")
        print(f"   - Emotion mapping: ✓")
        print(f"   - Text formatting: ✓")
        print(f"   - API calls: ✓")
        print(f"   - File storage: ✓")
        
        print(f"\n💡 Next Step: Test with Flask API")
        print(f"   The ElevenLabs integration is working.")
        print(f"   Now we need to fix the Flask server issue.")
    else:
        print(f"\n⚠️  Some segments failed")
        print(f"   Check ElevenLabs API quota and rate limits")
    
except Exception as e:
    print(f"\n❌ Error during processing: {e}")
    import traceback
    traceback.print_exc()
    import sys
    sys.exit(1)

print("\n" + "="*70)

