from flask import Blueprint, jsonify, request, send_file
import os
import sys

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.elevenlabs_client import generate_story_audio_from_gemini

tts_bp = Blueprint('tts', __name__)

@tts_bp.route('/generate', methods=['POST'])
def generate_tts():
    """
    Generate TTS audio from Gemini segments
    
    Expected request body:
    {
        "segments": [
            {"text": "...", "emotion": "sad"},
            {"text": "...", "emotion": "happy"}
        ],
        "story_id": 123,
        "filename": "story_123.mp3"  (optional)
    }
    """
    try:
        data = request.json
        segments = data.get('segments', [])
        story_id = data.get('story_id')
        filename = data.get('filename', f'story_{story_id}.mp3')
        
        if not segments:
            return jsonify({'error': 'No segments provided'}), 400
        
        # Generate audio
        audio_path = generate_story_audio_from_gemini(
            gemini_segments=segments,
            output_filename=filename
        )
        
        if audio_path:
            # Return the relative path for frontend to access
            relative_path = f'/audio/{filename}'
            return jsonify({
                'success': True,
                'audio_url': relative_path,
                'file_path': audio_path,
                'message': 'Audio generated successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to generate audio'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tts_bp.route('/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """
    Serve audio files
    """
    try:
        audio_dir = os.path.dirname(os.path.dirname(__file__))
        file_path = os.path.join(audio_dir, filename)
        
        if os.path.exists(file_path):
            return send_file(file_path, mimetype='audio/mpeg')
        else:
            return jsonify({'error': 'File not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tts_bp.route('/voices', methods=['GET'])
def get_voices():
    """Placeholder for available voices"""
    return jsonify({
        'voices': [
            {
                'id': 't9aQ9igYdTOv1RmpYub9',
                'name': 'Default Story Voice',
                'description': 'Custom voice for story narration'
            }
        ]
    })
