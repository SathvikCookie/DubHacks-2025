import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from io import BytesIO

load_dotenv()

elevenlabs = ElevenLabs(
api_key=os.getenv("ELEVENLABS_API_KEY"),
)


def generate_audio(text, voice_id):
    """
    Generate audio using ElevenLabs API
    TODO: Implement with ELEVENLABS_API_KEY
    """
    pass
    


def get_available_voices():
    """
    Fetch available voices from ElevenLabs
    """
    voice = elevenlabs.voices.ivc.create(
        name="Adi Voice Clone",
        files=[BytesIO(open("/Users/shriyandey/Desktop/adi.m4a", "rb").read())]
    )

    print(voice.voice_id)



