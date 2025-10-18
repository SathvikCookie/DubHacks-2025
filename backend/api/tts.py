from flask import Blueprint, jsonify, request

tts_bp = Blueprint('tts', __name__)

@tts_bp.route('/generate', methods=['POST'])
def generate_tts():
    """Placeholder for TTS generation"""
    data = request.json
    # TODO: Implement ElevenLabs integration
    return jsonify({
        'message': 'TTS generation endpoint',
        'story_id': data.get('story_id')
    })

@tts_bp.route('/voices', methods=['GET'])
def get_voices():
    """Placeholder for available voices"""
    return jsonify({
        'voices': []
    })

