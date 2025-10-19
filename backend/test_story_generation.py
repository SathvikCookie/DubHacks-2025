"""
Test script for story generation with audio processing
"""
import requests
import json

# Test story data (simulating Gemini output)
test_story = {
    "title": "Elara and the Starlight Lily",
    "prompt": "A story about a dream weaver sprite",
    "segments": [
        {
            "text": "Once upon a time, in a land woven from whispers and moonlight, lived a tiny sprite named Elara.",
            "emotion": "neutral"
        },
        {
            "text": "Oh dear, Lily's dream should be bright and full of gentle adventures.",
            "emotion": "sad"
        },
        {
            "text": "I must go there!",
            "emotion": "excited"
        },
        {
            "text": "And so, Elara saved the day and everyone lived happily ever after.",
            "emotion": "happy"
        }
    ]
}

def test_story_generation():
    """Test the /api/stories/generate endpoint"""
    
    print("🧪 Testing Story Generation with Audio Processing\n")
    print(f"Story: {test_story['title']}")
    print(f"Segments: {len(test_story['segments'])}\n")
    
    # Send request to Flask API
    url = "http://localhost:5001/api/stories/generate"
    
    try:
        response = requests.post(url, json=test_story)
        response.raise_for_status()
        
        result = response.json()
        
        print("\n✅ SUCCESS!")
        print(f"\nStory ID: {result['story']['id']}")
        print(f"UUID: {result['story']['uuid']}")
        print(f"Title: {result['story']['title']}")
        print(f"Audio Segments: {len(result['story']['audio_segments'])}")
        
        print("\n📁 Audio Files Generated:")
        for segment in result['story']['audio_segments']:
            status = "✓" if segment.get('audio_file') else "✗"
            print(f"  {status} Segment {segment['segment_index']}: [{segment['emotion']}] {segment.get('filename', 'FAILED')}")
        
        print(f"\n🎵 You can now access audio at:")
        for segment in result['story']['audio_segments']:
            if segment.get('filename'):
                print(f"  http://localhost:5001/api/audio/{segment['filename']}")
        
        return result
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to Flask server")
        print("Make sure the server is running: python app.py")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP ERROR: {e}")
        print(f"Response: {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

def test_get_story(story_id):
    """Test retrieving a story"""
    url = f"http://localhost:5001/api/stories/{story_id}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        story = response.json()
        print(f"\n📖 Retrieved Story:")
        print(f"  Title: {story['title']}")
        print(f"  Segments: {len(story['segments'])}")
        print(f"  Audio Segments: {len(story.get('audio_segments', []))}")
        
        return story
    except Exception as e:
        print(f"Error retrieving story: {e}")
        return None

if __name__ == "__main__":
    # Test story generation
    result = test_story_generation()
    
    if result:
        story_id = result['story']['id']
        
        # Test retrieval
        print("\n" + "="*50)
        test_get_story(story_id)

