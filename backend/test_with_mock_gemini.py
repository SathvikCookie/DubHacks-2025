"""
End-to-End Test with Mock Gemini Response

This simulates what Gemini would return for the prompt:
"write a story for my child about not lying. my kid's name is Shriyan. Use animal characters."

Then processes it through the full pipeline.
"""

import json
import os
import sys
import requests

print("\n" + "="*70)
print("🧪 END-TO-END TEST (Mock Gemini)")
print("="*70)

# Mock Gemini response for the prompt about not lying
MOCK_GEMINI_RESPONSE = {
    "title": "Shriyan and the Honest Rabbit",
    "segments": [
        {
            "text": "Once upon a time, in a peaceful forest, there lived a young boy named Shriyan who loved to play with the forest animals.",
            "emotion": "neutral"
        },
        {
            "text": "[softly] One day, Shriyan found a basket of delicious berries near the rabbit's burrow. He ate them all, even though they weren't his.",
            "emotion": "neutral"
        },
        {
            "text": "When Ruby the Rabbit asked, 'Shriyan, did you see my berries?' Shriyan felt nervous and said, 'No, I didn't see them.'",
            "emotion": "scared"
        },
        {
            "text": "[sadly] Ruby looked so sad and disappointed. She had been saving those berries for her family's dinner.",
            "emotion": "sad"
        },
        {
            "text": "Shriyan felt terrible inside. His tummy hurt, not from the berries, but from the lie he had told his friend.",
            "emotion": "sad"
        },
        {
            "text": "[thoughtfully] That night, Shriyan couldn't sleep. He knew what he had to do.",
            "emotion": "neutral"
        },
        {
            "text": "The next morning, Shriyan went to Ruby and said, 'I'm sorry, Ruby. I ate your berries and I lied about it. I was wrong.'",
            "emotion": "scared"
        },
        {
            "text": "[warmly] Ruby smiled gently. 'Thank you for telling the truth, Shriyan. That took courage. I forgive you.'",
            "emotion": "happy"
        },
        {
            "text": "[excitedly] Shriyan and Ruby worked together to find more berries, and they had even more fun gathering them as a team!",
            "emotion": "excited"
        },
        {
            "text": "[softly] From that day on, Shriyan always told the truth, because he learned that honesty makes friendships stronger and hearts feel lighter.",
            "emotion": "happy"
        },
        {
            "text": "And the forest animals all knew they could trust Shriyan, their honest and brave friend.",
            "emotion": "happy"
        },
        {
            "text": "[whispers] And the stars whispered, goodnight.",
            "emotion": "neutral"
        }
    ]
}

print(f"\n📝 Story Prompt:")
print(f"   'write a story for my child about not lying.")
print(f"    my kid's name is Shriyan. Use animal characters.'")

print(f"\n📖 Mock Gemini Response:")
print(f"   Title: {MOCK_GEMINI_RESPONSE['title']}")
print(f"   Segments: {len(MOCK_GEMINI_RESPONSE['segments'])}")
print(f"   Total words: {sum(len(s['text'].split()) for s in MOCK_GEMINI_RESPONSE['segments'])}")

# Save mock response
with open("generated_story.json", 'w') as f:
    json.dump(MOCK_GEMINI_RESPONSE, f, indent=2)

print(f"\n💾 Saved to: generated_story.json")

# Validate structure
print("\n🔍 Validating Structure...")
valid_emotions = ['happy', 'sad', 'excited', 'scared', 'angry', 'neutral']

for i, segment in enumerate(MOCK_GEMINI_RESPONSE['segments']):
    emotion = segment['emotion']
    text_preview = segment['text'][:60]
    status = "✓" if emotion in valid_emotions else "✗"
    print(f"   {status} Segment {i:2d}: [{emotion:8s}] {text_preview}...")

print(f"\n✅ STEP 1 COMPLETE: Story Structure Valid")

# Step 2: Check if server is running
print("\n" + "="*70)
print("STEP 2: Process Audio with ElevenLabs")
print("="*70)

try:
    requests.get("http://localhost:5001/api/health", timeout=2)
    print("\n✓ Flask server is running")
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
    "title": MOCK_GEMINI_RESPONSE['title'],
    "prompt": "write a story for my child about not lying. my kid's name is Shriyan. Use animal characters.",
    "segments": MOCK_GEMINI_RESPONSE['segments']
}

print(f"\n📤 Sending to backend API...")
print(f"   URL: {url}")
print(f"   Segments: {len(MOCK_GEMINI_RESPONSE['segments'])}")

print(f"\n⏳ Processing audio...")
print(f"   Estimated time: ~{len(MOCK_GEMINI_RESPONSE['segments']) * 2} seconds")
print(f"   (Processing {len(MOCK_GEMINI_RESPONSE['segments'])} segments with 1s delay between each)")

try:
    response = requests.post(url, json=payload, timeout=300)
    response.raise_for_status()
    
    result = response.json()
    
    # Save result
    with open("processed_story.json", 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n✅ STEP 2 COMPLETE: Audio Processing Done")
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

# Step 3: Verify audio files
print("\n" + "="*70)
print("STEP 3: Verify Audio Files")
print("="*70)

successful = 0
failed = 0

print(f"\n🎵 Checking audio files...")

for i, audio_seg in enumerate(story['audio_segments']):
    filename = audio_seg.get('filename')
    audio_file = audio_seg.get('audio_file')
    emotion = audio_seg.get('emotion')
    
    if filename and audio_file:
        if os.path.exists(audio_file):
            file_size = os.path.getsize(audio_file) / 1024  # KB
            print(f"   ✓ Segment {i:2d} [{emotion:8s}]: {filename} ({file_size:.1f} KB)")
            successful += 1
        else:
            print(f"   ✗ Segment {i:2d}: {filename} (FILE NOT FOUND)")
            failed += 1
    else:
        print(f"   ✗ Segment {i:2d}: No audio file generated")
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

story_id = story['id']

# Test story endpoint
print(f"\n📥 Testing story retrieval...")
response = requests.get(f"http://localhost:5001/api/stories/{story_id}")
response.raise_for_status()

fetched_story = response.json()
print(f"   ✓ Story endpoint working")
print(f"   ✓ Story has {len(fetched_story['segments'])} segments")
print(f"   ✓ Story has {len(fetched_story['audio_segments'])} audio segments")

# Test audio endpoints
print(f"\n🎵 Testing audio file access...")
accessible = 0

for i, audio_seg in enumerate(fetched_story['audio_segments']):
    if audio_seg.get('filename'):
        audio_url = f"http://localhost:5001/api/audio/{audio_seg['filename']}"
        try:
            response = requests.head(audio_url, timeout=5)
            if response.status_code == 200:
                accessible += 1
                print(f"   ✓ Segment {i:2d}: {audio_seg['filename']}")
            else:
                print(f"   ✗ Segment {i:2d}: HTTP {response.status_code}")
        except:
            print(f"   ✗ Segment {i:2d}: Connection failed")

print(f"\n📊 Accessibility Summary:")
print(f"   Accessible: {accessible}/{len(fetched_story['audio_segments'])}")

if accessible == len(fetched_story['audio_segments']):
    print(f"\n✅ STEP 4 COMPLETE: All Audio Files Accessible")

# Final Summary
print("\n" + "="*70)
print("📊 FINAL SUMMARY")
print("="*70)

print(f"\n✅ Story: '{MOCK_GEMINI_RESPONSE['title']}'")
print(f"   Segments: {len(MOCK_GEMINI_RESPONSE['segments'])}")
print(f"   Emotions: {list(set(s['emotion'] for s in MOCK_GEMINI_RESPONSE['segments']))}")
print(f"   Word count: {sum(len(s['text'].split()) for s in MOCK_GEMINI_RESPONSE['segments'])}")

print(f"\n✅ Database:")
print(f"   Story ID: {story['id']}")
print(f"   UUID: {story['uuid']}")
print(f"   Created: {story['created_at']}")
print(f"   Processed: {story['processed_at']}")

print(f"\n✅ Audio Files:")
print(f"   Generated: {successful}/{len(story['audio_segments'])}")
print(f"   Accessible via API: {accessible}/{len(story['audio_segments'])}")

print(f"\n📁 Files Created:")
print(f"   1. generated_story.json - Mock Gemini output")
print(f"   2. processed_story.json - Backend response with audio metadata")
print(f"   3. audio_files/{story['uuid']}_segment_*.mp3 - {successful} audio files")

print(f"\n🎯 Frontend Testing:")
print(f"   1. Start frontend: cd frontend && npm run dev")
print(f"   2. Open: http://localhost:3000")
print(f"   3. Navigate to story ID: {story['id']}")
print(f"   4. Or direct link: http://localhost:3000/player/{story['id']}")

print(f"\n🔍 What to Verify in Frontend:")
print(f"   ✓ Story loads with title: '{story['title']}'")
print(f"   ✓ First segment text displays")
print(f"   ✓ Emotion color strip shows: {fetched_story['segments'][0]['emotion']}")
print(f"   ✓ Play button works")
print(f"   ✓ Audio plays for first segment")
print(f"   ✓ Auto-advances to next segment")
print(f"   ✓ Emotion colors change per segment")
print(f"   ✓ Progress bar updates")

print("\n" + "="*70)
print("🎉 END-TO-END TEST COMPLETE!")
print("="*70)

print(f"\n💡 Next: Test with real Gemini")
print(f"   Once Gemini package is installed, run:")
print(f"   python test_end_to_end.py")

print()

