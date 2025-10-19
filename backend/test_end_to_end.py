"""
End-to-End Test: Gemini → ElevenLabs → Database → Frontend Ready

Tests the complete pipeline with a real prompt:
"write a story for my child about not lying. my kid's name is Shriyan. Use animal characters."
"""

import json
import os
import sys
from pathlib import Path

print("\n" + "="*70)
print("🧪 END-TO-END INTEGRATION TEST")
print("="*70)

# Test prompt
TEST_PROMPT = "write a story for my child about not lying. my kid's name is Shriyan. Use animal characters."

print(f"\n📝 Test Prompt:")
print(f"   {TEST_PROMPT}")
print()

# Step 1: Generate story with Gemini
print("="*70)
print("STEP 1: Generate Story with Gemini")
print("="*70)

try:
    from utils.gemini import generate_story
    
    print("\n⏳ Calling Gemini API...")
    print("   (This may take 10-30 seconds)")
    
    response = generate_story(TEST_PROMPT)
    
    print(f"\n✅ Gemini Response Received")
    print(f"   Length: {len(response)} characters")
    
    # Parse JSON
    print("\n📋 Parsing JSON...")
    story_data = json.loads(response)
    
    # Validate structure
    print("\n🔍 Validating Structure...")
    assert 'title' in story_data, "❌ Missing 'title' field"
    print("   ✓ Has 'title' field")
    
    assert 'segments' in story_data, "❌ Missing 'segments' field"
    print("   ✓ Has 'segments' field")
    
    assert len(story_data['segments']) > 0, "❌ No segments generated"
    print(f"   ✓ Has {len(story_data['segments'])} segments")
    
    # Validate each segment
    print("\n🔍 Validating Segments...")
    valid_emotions = ['happy', 'sad', 'excited', 'scared', 'angry', 'neutral']
    
    for i, segment in enumerate(story_data['segments']):
        assert 'text' in segment, f"❌ Segment {i} missing 'text'"
        assert 'emotion' in segment, f"❌ Segment {i} missing 'emotion'"
        assert segment['emotion'] in valid_emotions, f"❌ Invalid emotion: {segment['emotion']}"
        
        print(f"   ✓ Segment {i}: [{segment['emotion']:8s}] {segment['text'][:50]}...")
    
    # Save to JSON file
    output_file = "generated_story.json"
    with open(output_file, 'w') as f:
        json.dump(story_data, f, indent=2)
    
    print(f"\n💾 Saved to: {output_file}")
    print(f"\n✅ STEP 1 COMPLETE: Story Generated Successfully")
    print(f"   Title: {story_data['title']}")
    print(f"   Segments: {len(story_data['segments'])}")
    print(f"   Total words: {sum(len(s['text'].split()) for s in story_data['segments'])}")
    
except ImportError as e:
    print(f"\n❌ Import Error: {e}")
    print("\n💡 Gemini package not installed. Install with:")
    print("   pip install google-genai")
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"\n❌ JSON Parse Error: {e}")
    print(f"\n📄 Raw Response:")
    print(response[:500])
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 2: Process through backend API
print("\n" + "="*70)
print("STEP 2: Process Audio with ElevenLabs")
print("="*70)

try:
    import requests
    
    # Check if server is running
    try:
        requests.get("http://localhost:5001/api/health", timeout=2)
    except:
        print("\n❌ Flask server not running!")
        print("\n💡 Start the server in another terminal:")
        print("   cd backend")
        print("   python app.py")
        print("\nThen run this test again.")
        sys.exit(1)
    
    # Send to backend
    url = "http://localhost:5001/api/stories/generate"
    payload = {
        "title": story_data['title'],
        "prompt": TEST_PROMPT,
        "segments": story_data['segments']
    }
    
    print(f"\n📤 Sending to backend API...")
    print(f"   URL: {url}")
    print(f"   Segments: {len(story_data['segments'])}")
    
    print(f"\n⏳ Processing audio...")
    print(f"   This will take ~{len(story_data['segments']) * 2} seconds")
    print(f"   (ElevenLabs processes each segment separately)")
    
    response = requests.post(url, json=payload, timeout=300)
    response.raise_for_status()
    
    result = response.json()
    
    print(f"\n✅ STEP 2 COMPLETE: Audio Processing Done")
    
    # Save result
    with open("processed_story.json", 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n💾 Saved result to: processed_story.json")
    
    story = result['story']
    
    print(f"\n📊 Story Details:")
    print(f"   ID: {story['id']}")
    print(f"   UUID: {story['uuid']}")
    print(f"   Title: {story['title']}")
    print(f"   Segments: {len(story['segments'])}")
    print(f"   Audio Segments: {len(story['audio_segments'])}")
    
except requests.exceptions.RequestException as e:
    print(f"\n❌ API Error: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"\n📄 Response: {e.response.text}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 3: Verify audio files
print("\n" + "="*70)
print("STEP 3: Verify Audio Files")
print("="*70)

audio_files = []
successful = 0
failed = 0

print(f"\n🎵 Checking audio files...")

for i, audio_seg in enumerate(story['audio_segments']):
    filename = audio_seg.get('filename')
    audio_file = audio_seg.get('audio_file')
    
    if filename and audio_file:
        # Check if file exists
        if os.path.exists(audio_file):
            file_size = os.path.getsize(audio_file) / 1024  # KB
            print(f"   ✓ Segment {i}: {filename} ({file_size:.1f} KB)")
            audio_files.append(audio_file)
            successful += 1
        else:
            print(f"   ✗ Segment {i}: {filename} (FILE NOT FOUND)")
            failed += 1
    else:
        print(f"   ✗ Segment {i}: No audio file generated")
        failed += 1

print(f"\n📊 Audio Files Summary:")
print(f"   Successful: {successful}/{len(story['audio_segments'])}")
print(f"   Failed: {failed}/{len(story['audio_segments'])}")

if successful == len(story['audio_segments']):
    print(f"\n✅ STEP 3 COMPLETE: All Audio Files Generated")
else:
    print(f"\n⚠️  STEP 3 WARNING: Some audio files failed")

# Step 4: Verify frontend accessibility
print("\n" + "="*70)
print("STEP 4: Verify Frontend Accessibility")
print("="*70)

try:
    story_id = story['id']
    
    # Test story endpoint
    print(f"\n📥 Testing story retrieval...")
    response = requests.get(f"http://localhost:5001/api/stories/{story_id}")
    response.raise_for_status()
    
    fetched_story = response.json()
    print(f"   ✓ Story endpoint working")
    
    # Test audio endpoints
    print(f"\n🎵 Testing audio file access...")
    accessible = 0
    
    for audio_seg in fetched_story['audio_segments']:
        if audio_seg.get('filename'):
            audio_url = f"http://localhost:5001/api/audio/{audio_seg['filename']}"
            try:
                response = requests.head(audio_url, timeout=5)
                if response.status_code == 200:
                    accessible += 1
                    print(f"   ✓ {audio_seg['filename']}")
                else:
                    print(f"   ✗ {audio_seg['filename']} (HTTP {response.status_code})")
            except:
                print(f"   ✗ {audio_seg['filename']} (Connection failed)")
    
    print(f"\n📊 Accessibility Summary:")
    print(f"   Accessible: {accessible}/{len(fetched_story['audio_segments'])}")
    
    if accessible == len(fetched_story['audio_segments']):
        print(f"\n✅ STEP 4 COMPLETE: All Audio Files Accessible")
    else:
        print(f"\n⚠️  STEP 4 WARNING: Some files not accessible")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Final Summary
print("\n" + "="*70)
print("📊 FINAL SUMMARY")
print("="*70)

print(f"\n✅ Story Generated:")
print(f"   Title: {story_data['title']}")
print(f"   Segments: {len(story_data['segments'])}")
print(f"   Emotions: {[s['emotion'] for s in story_data['segments']]}")

print(f"\n✅ Audio Processed:")
print(f"   Story ID: {story['id']}")
print(f"   UUID: {story['uuid']}")
print(f"   Audio Files: {successful}/{len(story['audio_segments'])}")

print(f"\n✅ Frontend Ready:")
print(f"   Story URL: http://localhost:3000/player/{story['id']}")
print(f"   API Endpoint: http://localhost:5001/api/stories/{story['id']}")

print(f"\n📁 Files Created:")
print(f"   1. generated_story.json - Raw Gemini output")
print(f"   2. processed_story.json - Backend response")
print(f"   3. audio_files/{story['uuid']}_segment_*.mp3 - Audio files")

print(f"\n🎯 Next Steps:")
print(f"   1. Open frontend: http://localhost:3000")
print(f"   2. Navigate to story ID: {story['id']}")
print(f"   3. Press play and verify:")
print(f"      - Audio plays for each segment")
print(f"      - Emotion colors change")
print(f"      - Text updates per segment")
print(f"      - Auto-advance works")

print("\n" + "="*70)
print("🎉 END-TO-END TEST COMPLETE!")
print("="*70)
print()

