import os
import re
import time
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class StoryAudioProcessor:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        self.api_url = "https://api.elevenlabs.io/v1/text-to-dialogue"
        
        # Create audio directory
        self.audio_dir = Path("audio_files")
        self.audio_dir.mkdir(exist_ok=True)
    
    def emotion_to_style(self, emotion):
        """Convert emotion tags to ElevenLabs style markers"""
        emotion_map = {
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
        return emotion_map.get(emotion.lower(), '')
    
    def format_text_for_api(self, text, emotion):
        """Format text with emotion style for ElevenLabs"""
        style = self.emotion_to_style(emotion)
        
        # Remove existing style markers like [softly]
        text = re.sub(r'\[.*?\]', '', text).strip()
        
        if style:
            return f"{{{style}}} {text}"
        return text
    
    def process_segment(self, segment, voice_id="t9aQ9igYdTOv1RmpYub9"):
        """
        Process a single segment through ElevenLabs API
        
        Args:
            segment: Dict with 'text' and 'emotion' keys
            voice_id: ElevenLabs voice ID
            
        Returns:
            Audio content (bytes) or None if failed
        """
        formatted_text = self.format_text_for_api(segment['text'], segment['emotion'])
        
        payload = {
            "inputs": [
                {
                    "text": formatted_text,
                    "voice_id": voice_id
                }
            ]
        }
        
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        try:
            print(f"  Sending to ElevenLabs: [{segment['emotion']}] {segment['text'][:50]}...")
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.content  # Returns audio data
        except requests.exceptions.RequestException as e:
            print(f"  Error processing segment: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"  Response: {e.response.text}")
            return None
    
    def process_story_segments(self, story_uuid, segments, voice_id="t9aQ9igYdTOv1RmpYub9", delay=1.0):
        """
        Process all segments of a story through ElevenLabs API
        
        Args:
            story_uuid: Unique identifier for the story
            segments: List of dicts with 'text' and 'emotion' keys
            voice_id: ElevenLabs voice ID to use
            delay: Delay between API calls to avoid rate limiting
        
        Returns:
            List of audio metadata dicts
        """
        print(f"\n🎵 Processing {len(segments)} segments for story {story_uuid}")
        
        audio_metadata = []
        
        for idx, segment in enumerate(segments):
            print(f"\nSegment {idx + 1}/{len(segments)}:")
            
            # Get audio from API
            audio_content = self.process_segment(segment, voice_id)
            
            if audio_content:
                # Generate filename
                filename = f"{story_uuid}_segment_{idx:03d}.mp3"
                filepath = self.audio_dir / filename
                
                # Save audio file
                with open(filepath, 'wb') as f:
                    f.write(audio_content)
                
                # Store audio metadata
                audio_metadata.append({
                    "segment_index": idx,
                    "text": segment['text'],
                    "emotion": segment['emotion'],
                    "audio_file": str(filepath),
                    "filename": filename,
                    "duration": None  # Could add duration detection if needed
                })
                
                print(f"  ✓ Saved to {filepath}")
            else:
                print(f"  ✗ Failed to process segment {idx}")
                # Still add metadata but mark as failed
                audio_metadata.append({
                    "segment_index": idx,
                    "text": segment['text'],
                    "emotion": segment['emotion'],
                    "audio_file": None,
                    "filename": None,
                    "duration": None,
                    "error": "Failed to generate audio"
                })
            
            # Rate limiting delay (except for last segment)
            if idx < len(segments) - 1:
                time.sleep(delay)
        
        print(f"\n✓ Audio processing complete!")
        print(f"  Successful: {sum(1 for a in audio_metadata if a['audio_file'] is not None)}/{len(segments)}")
        
        return audio_metadata
    
    def get_audio_url(self, filename):
        """Generate URL for accessing audio file"""
        return f"/api/audio/{filename}"


# Standalone test function
if __name__ == "__main__":
    # Test with example story
    example_segments = [
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
        }
    ]
    
    processor = StoryAudioProcessor()
    audio_metadata = processor.process_story_segments(
        story_uuid="test-story-123",
        segments=example_segments
    )
    
    print("\n📊 Results:")
    for meta in audio_metadata:
        status = "✓" if meta['audio_file'] else "✗"
        print(f"{status} Segment {meta['segment_index']}: {meta['emotion']} - {meta['filename']}")

