from flask import Blueprint, jsonify, request
import os
import sys
from werkzeug.utils import secure_filename

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.elevenlabs_client import get_available_voices, client
import requests
from dotenv import load_dotenv

load_dotenv()

voices_bp = Blueprint('voices', __name__)

# Predefined basic ElevenLabs voices (commonly available)
BASIC_VOICES = [
    {
        "voice_id": "21m00Tcm4TlvDq8ikWAM",
        "name": "Rachel",
        "description": "Calm and soothing female voice"
    },
    {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",
        "name": "Bella",
        "description": "Soft and expressive female voice"
    },
    {
        "voice_id": "ErXwobaYiN019PkySvjV",
        "name": "Antoni",
        "description": "Well-rounded male voice"
    },
    {
        "voice_id": "pNInz6obpgDQGcFmaJgB",
        "name": "Adam",
        "description": "Deep and resonant male voice"
    }
]

@voices_bp.route('', methods=['GET'])
def get_voices():
    """
    Get available voices - returns basic voices only
    """
    try:
        return jsonify({
            'success': True,
            'voices': BASIC_VOICES
        })
    except Exception as e:
        print(f"Error fetching voices: {e}")
        return jsonify({'error': str(e)}), 500

@voices_bp.route('/preview/<voice_id>', methods=['GET'])
def preview_voice(voice_id):
    """
    Generate a preview audio sample for a voice
    """
    try:
        from utils.elevenlabs_client import generate_audio
        
        # Preview text
        preview_text = "Hi, this is a voice using ElevenLabs API"
        
        print(f"🎤 Generating preview for voice: {voice_id}")
        
        # Generate audio
        audio_generator = generate_audio(preview_text, voice_id)
        
        if audio_generator:
            # Collect audio chunks
            audio_data = b''
            for chunk in audio_generator:
                audio_data += chunk
            
            # Return audio file
            from flask import Response
            return Response(
                audio_data,
                mimetype='audio/mpeg',
                headers={
                    'Content-Disposition': f'inline; filename="preview_{voice_id}.mp3"',
                    'Cache-Control': 'public, max-age=3600'  # Cache for 1 hour
                }
            )
        else:
            return jsonify({'error': 'Failed to generate preview'}), 500
            
    except Exception as e:
        print(f"Error generating preview: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@voices_bp.route('/create', methods=['POST'])
def create_custom_voice():
    """
    Create a custom voice from uploaded audio file
    
    Expected form data:
    - audio_file: Audio file (MP3, WAV, M4A, etc.)
    - name: Name for the voice
    - description: Optional description
    """
    try:
        # Check if audio file was uploaded
        if 'audio_file' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio_file']
        
        if audio_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get voice name and description
        voice_name = request.form.get('name', 'Custom Voice')
        voice_description = request.form.get('description', 'Custom voice for storytelling')
        
        # Secure the filename
        filename = secure_filename(audio_file.filename)
        
        # Create temporary directory for uploads
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'temp_uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the file temporarily
        temp_filepath = os.path.join(upload_dir, filename)
        audio_file.save(temp_filepath)
        
        print(f"🎤 Creating voice '{voice_name}' from {filename}")
        
        try:
            # Use ElevenLabs API to create voice
            api_key = os.getenv('ELEVENLABS_API_KEY')
            url = "https://api.elevenlabs.io/v1/voices/add"
            
            headers = {
                "xi-api-key": api_key
            }
            
            # Prepare multipart form data
            with open(temp_filepath, 'rb') as f:
                files = {
                    'files': (filename, f, audio_file.content_type or 'audio/mpeg')
                }
                
                data = {
                    'name': voice_name,
                    'description': voice_description
                }
                
                print(f"📤 Uploading to ElevenLabs...")
                response = requests.post(url, headers=headers, files=files, data=data)
            
            # Clean up temp file
            os.remove(temp_filepath)
            
            if response.status_code == 200:
                result = response.json()
                voice_id = result.get('voice_id')
                
                print(f"✓ Voice created: {voice_id}")
                
                return jsonify({
                    'success': True,
                    'voice_id': voice_id,
                    'name': voice_name,
                    'description': voice_description,
                    'message': 'Voice created successfully'
                })
            else:
                error_msg = response.json() if response.text else response.text
                print(f"❌ ElevenLabs API error: {response.status_code}")
                print(f"Response: {error_msg}")
                return jsonify({
                    'error': 'Failed to create voice',
                    'details': error_msg,
                    'note': 'Voice cloning requires a paid ElevenLabs plan'
                }), response.status_code
        
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)
            raise e
        
    except Exception as e:
        print(f"Error creating custom voice: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

