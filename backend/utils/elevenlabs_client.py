import os
import requests
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)


def generate_audio(text, voice_id):
    """
    Generate audio using ElevenLabs API
    """
    try:
        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_monolingual_v1"
        )
        return audio
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None


def generate_story_audio_from_gemini(gemini_segments, output_filename="story_audio.mp3"):
    """
    Generate audio from Gemini API segments using ElevenLabs text-to-dialogue endpoint.
    
    Args:
        gemini_segments: List of dicts with format [{"text": "...", "emotion": "sad"}, ...]
        output_filename: Name of the output file to save in backend folder
    
    Returns:
        Path to the saved audio file or None if failed
    """
    voice_id = "t9aQ9igYdTOv1RmpYub9"  # Your specified voice ID
    
    # Prepare inputs for ElevenLabs API
    inputs = []
    for segment in gemini_segments:
        inputs.append({
            "text": segment["text"],
            "voice_id": voice_id
        })
    
    # Make API call to text-to-dialogue endpoint
    url = "https://api.elevenlabs.io/v1/text-to-dialogue"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": inputs
    }
    
    try:
        print(f"Sending {len(inputs)} segments to ElevenLabs...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        # Save the audio file
        output_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),  # backend folder
            output_filename
        )
        
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"✓ Audio saved to: {output_path}")
        return output_path
        
    except requests.exceptions.RequestException as e:
        print(f"Error calling ElevenLabs API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None


def get_available_voices():
    """
    Fetch available voices from ElevenLabs
    """
    try:
        voices = client.voices.get_all()
        return voices
    except Exception as e:
        print(f"Error fetching voices: {e}")
        return None


def create_voice_clone(name, audio_file_path):
    """
    Create a voice clone from an audio file
    NOTE: Requires Professional Voice Cloning (PVC) permissions
    This is a paid feature on ElevenLabs
    """
    try:
        voice = client.voices.ivc.create(
            name=name,
            files=[open(audio_file_path, "rb")]
        )
        print(f"Voice created with ID: {voice.voice_id}")
        return voice.voice_id
    except Exception as e:
        print(f"Error creating voice clone: {e}")
        return None


def save_audio_to_file(audio_data, output_path):
    """
    Save audio data to a file
    """
    try:
        with open(output_path, "wb") as f:
            for chunk in audio_data:
                f.write(chunk)
        print(f"Audio saved to: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error saving audio: {e}")
        return None


# Test functions
if __name__ == "__main__":
    print("Testing ElevenLabs integration...\n")
    
    # Test: Generate story audio from Gemini-style segments
    print("Testing story audio generation from Gemini segments...")
    
    # Example Gemini output format
    gemini_output = [
        {
            "text": "Once upon a time, there was a little star named Stella.",
            "emotion": "neutral"
        },
        {
            "text": "She felt very sad because she was smaller than the other stars.",
            "emotion": "sad"
        },
        {
            "text": "But one night, a child made a wish upon her, and she realized she was special!",
            "emotion": "happy"
        },
        {
            "text": "From that day on, Stella shined brighter than ever before.",
            "emotion": "joy"
        }
    ]
    
    # Generate audio
    audio_path = generate_story_audio_from_gemini(
        gemini_segments=gemini_output,
        output_filename="test_story_output.mp3"
    )
    
    if audio_path:
        print(f"\n✓ Success! Audio file created at: {audio_path}")
        print("You can play this file to hear the story!")
    else:
        print("\n✗ Failed to generate audio")
