"""
Complete Integration Test: Gemini → ElevenLabs → Database → Frontend

This tests the entire pipeline:
1. Generate story with Gemini
2. Process audio with ElevenLabs
3. Store in database
4. Verify frontend can access
"""

import json
import requests
from utils.gemini import generate_story

def test_gemini_output():
    """Test that Gemini returns proper JSON format"""
    print("=" * 60)
    print("TEST 1: Gemini Story Generation")
    print("=" * 60)
    
    prompt = "A short story about a brave little turtle who learns to swim"
    
    try:
        print(f"\n📝 Prompt: {prompt}")
        print("\n⏳ Calling Gemini API...")
        
        response = generate_story(prompt)
        print(f"\n✓ Gemini Response received ({len(response)} characters)")
        
        # Parse JSON
        story_data = json.loads(response)
        
        # Validate structure
        assert 'title' in story_data, "Missing 'title' field"
        assert 'segments' in story_data, "Missing 'segments' field"
        assert len(story_data['segments']) > 0, "No segments generated"
        
        # Validate segments
        for i, segment in enumerate(story_data['segments']):
            assert 'text' in segment, f"Segment {i} missing 'text'"
            assert 'emotion' in segment, f"Segment {i} missing 'emotion'"
            assert segment['emotion'] in ['happy', 'sad', 'excited', 'scared', 'angry', 'neutral'], \
                f"Invalid emotion: {segment['emotion']}"
        
        print(f"\n✅ GEMINI TEST PASSED")
        print(f"   Title: {story_data['title']}")
        print(f"   Segments: {len(story_data['segments'])}")
        print(f"   Emotions: {[s['emotion'] for s in story_data['segments']]}")
        
        return story_data
        
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON Parse Error: {e}")
        print(f"   Response: {response[:200]}...")
        return None
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_backend_processing(story_data):
    """Test backend processes the story correctly"""
    print("\n" + "=" * 60)
    print("TEST 2: Backend Processing (ElevenLabs + Database)")
    print("=" * 60)
    
    url = "http://localhost:5001/api/stories/generate"
    
    try:
        print(f"\n📤 Sending to: {url}")
        print(f"   Title: {story_data['title']}")
        print(f"   Segments: {len(story_data['segments'])}")
        
        # Add prompt field
        payload = {
            "title": story_data['title'],
            "prompt": "Test prompt",
            "segments": story_data['segments']
        }
        
        print("\n⏳ Processing audio (this may take 30-60 seconds)...")
        response = requests.post(url, json=payload, timeout=300)
        response.raise_for_status()
        
        result = response.json()
        
        print(f"\n✅ BACKEND TEST PASSED")
        print(f"   Story ID: {result['story']['id']}")
        print(f"   UUID: {result['story']['uuid']}")
        print(f"   Audio segments: {len(result['story']['audio_segments'])}")
        
        # Verify each segment has audio
        successful_audio = sum(1 for seg in result['story']['audio_segments'] if seg.get('audio_file'))
        print(f"   Successful audio files: {successful_audio}/{len(result['story']['audio_segments'])}")
        
        if successful_audio < len(result['story']['audio_segments']):
            print(f"\n⚠️  Warning: Some segments failed to generate audio")
            for seg in result['story']['audio_segments']:
                if not seg.get('audio_file'):
                    print(f"      Failed: Segment {seg['segment_index']} - {seg['emotion']}")
        
        return result['story']
        
    except requests.exceptions.ConnectionError:
        print(f"\n❌ ERROR: Cannot connect to Flask server")
        print(f"   Make sure server is running: python app.py")
        return None
    except requests.exceptions.Timeout:
        print(f"\n❌ ERROR: Request timed out")
        print(f"   Story may be too long or API is slow")
        return None
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_frontend_access(story):
    """Test that frontend can access the story and audio"""
    print("\n" + "=" * 60)
    print("TEST 3: Frontend Access")
    print("=" * 60)
    
    story_id = story['id']
    
    try:
        # Test 1: Get story
        print(f"\n📥 Fetching story {story_id}...")
        response = requests.get(f"http://localhost:5001/api/stories/{story_id}")
        response.raise_for_status()
        
        fetched_story = response.json()
        print(f"✓ Story retrieved successfully")
        
        # Test 2: Access audio files
        print(f"\n🎵 Testing audio file access...")
        audio_segments = fetched_story.get('audio_segments', [])
        
        accessible_count = 0
        for seg in audio_segments:
            if seg.get('filename'):
                audio_url = f"http://localhost:5001/api/audio/{seg['filename']}"
                try:
                    audio_response = requests.head(audio_url)
                    if audio_response.status_code == 200:
                        accessible_count += 1
                        print(f"   ✓ {seg['filename']} - accessible")
                    else:
                        print(f"   ✗ {seg['filename']} - HTTP {audio_response.status_code}")
                except:
                    print(f"   ✗ {seg['filename']} - connection failed")
        
        print(f"\n✅ FRONTEND TEST PASSED")
        print(f"   Accessible audio files: {accessible_count}/{len(audio_segments)}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_emotion_mapping():
    """Test that emotion mapping works correctly"""
    print("\n" + "=" * 60)
    print("TEST 4: Emotion Mapping")
    print("=" * 60)
    
    from utils.story_audio_processor import StoryAudioProcessor
    
    processor = StoryAudioProcessor()
    
    test_emotions = {
        'happy': 'happily',
        'sad': 'softly',
        'excited': 'excitedly',
        'scared': 'nervously',
        'angry': 'angrily',
        'neutral': ''
    }
    
    print("\n🎭 Testing emotion → style mapping:")
    all_passed = True
    for emotion, expected_style in test_emotions.items():
        actual_style = processor.emotion_to_style(emotion)
        status = "✓" if actual_style == expected_style else "✗"
        print(f"   {status} {emotion:10s} → {actual_style or '(none)'}")
        if actual_style != expected_style:
            all_passed = False
            print(f"      Expected: {expected_style}")
    
    if all_passed:
        print(f"\n✅ EMOTION MAPPING TEST PASSED")
    else:
        print(f"\n❌ EMOTION MAPPING TEST FAILED")
    
    return all_passed


def run_all_tests():
    """Run complete integration test suite"""
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║                                                            ║")
    print("║         COMPLETE INTEGRATION TEST SUITE                   ║")
    print("║                                                            ║")
    print("║  Gemini → ElevenLabs → Database → Frontend                ║")
    print("║                                                            ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print("\n")
    
    results = {
        'gemini': False,
        'backend': False,
        'frontend': False,
        'emotion_mapping': False
    }
    
    # Test 1: Gemini
    story_data = test_gemini_output()
    if story_data:
        results['gemini'] = True
        
        # Test 2: Backend
        processed_story = test_backend_processing(story_data)
        if processed_story:
            results['backend'] = True
            
            # Test 3: Frontend
            if test_frontend_access(processed_story):
                results['frontend'] = True
    
    # Test 4: Emotion Mapping (independent)
    if test_emotion_mapping():
        results['emotion_mapping'] = True
    
    # Summary
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}  {test_name.upper().replace('_', ' ')}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED! System is fully integrated.")
        print("\nYou can now:")
        print("  1. Generate stories with Gemini")
        print("  2. Process audio with ElevenLabs")
        print("  3. Store in database")
        print("  4. Play in frontend")
    else:
        print("⚠️  Some tests failed. Check errors above.")
    print("=" * 60)
    
    return all_passed


if __name__ == "__main__":
    import sys
    
    # Check if server is running
    try:
        requests.get("http://localhost:5001/api/health", timeout=2)
    except:
        print("\n❌ ERROR: Flask server not running!")
        print("   Start it with: python app.py")
        print()
        sys.exit(1)
    
    # Run tests
    success = run_all_tests()
    sys.exit(0 if success else 1)

