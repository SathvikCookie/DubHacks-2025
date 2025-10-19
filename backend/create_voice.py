#!/usr/bin/env python3
"""
Create a new ElevenLabs voice from an audio file using direct API calls
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

load_dotenv()

def create_voice_from_audio(audio_file_path, voice_name, voice_description="Custom voice for storytelling"):
    """
    Create a new voice in ElevenLabs from an audio file
    
    Args:
        audio_file_path: Path to audio file (MP3, WAV, M4A, etc.)
        voice_name: Name for the new voice
        voice_description: Description of the voice
        
    Returns:
        voice_id: The ID of the newly created voice
    """
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("❌ Error: ELEVENLABS_API_KEY not found in .env")
        sys.exit(1)
    
    audio_path = Path(audio_file_path)
    if not audio_path.exists():
        print(f"❌ Error: Audio file not found: {audio_file_path}")
        sys.exit(1)
    
    print(f"🎤 Creating new voice from: {audio_path.name}")
    print(f"   Name: {voice_name}")
    print(f"   Description: {voice_description}")
    
    try:
        # Use ElevenLabs Add Voice API endpoint
        url = "https://api.elevenlabs.io/v1/voices/add"
        
        headers = {
            "xi-api-key": api_key
        }
        
        # Prepare multipart form data
        with open(audio_path, 'rb') as audio_file:
            files = {
                'files': (audio_path.name, audio_file, 'audio/m4a')
            }
            
            data = {
                'name': voice_name,
                'description': voice_description
            }
            
            print("\n📤 Uploading audio and creating voice...")
            print("   (This may take a moment...)")
            
            response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            voice_id = result.get('voice_id')
            
            print(f"\n✅ Voice created successfully!")
            print(f"   Voice ID: {voice_id}")
            print(f"   Voice Name: {voice_name}")
            
            return voice_id
        else:
            error_msg = response.json() if response.text else response.text
            print(f"\n❌ Error creating voice:")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {error_msg}")
            print("\nNote: Voice cloning requires a paid ElevenLabs plan.")
            print("If you're on the free tier, you can use pre-made voices instead.")
            sys.exit(1)
        
    except Exception as e:
        print(f"\n❌ Error creating voice: {e}")
        print("\nNote: Voice cloning requires a paid ElevenLabs plan.")
        sys.exit(1)

if __name__ == "__main__":
    # Configuration
    AUDIO_FILE = "/Users/adig/Desktop/aayan.m4a"
    VOICE_NAME = "Aayan"
    VOICE_DESCRIPTION = "Custom voice for children's storytelling"
    
    voice_id = create_voice_from_audio(AUDIO_FILE, VOICE_NAME, VOICE_DESCRIPTION)
    
    print("\n" + "="*60)
    print("📝 Next Steps:")
    print("="*60)
    print(f"1. Your new voice ID is: {voice_id}")
    print("2. This voice ID will be automatically saved to .env")
    print("3. The code will be updated to use this voice ID")
    print("="*60)

