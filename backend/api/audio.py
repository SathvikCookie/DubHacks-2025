from flask import Blueprint, send_file, jsonify
import os
from pathlib import Path

audio_bp = Blueprint('audio', __name__)

AUDIO_DIR = Path("audio_files")

@audio_bp.route('/<filename>', methods=['GET'])
def serve_audio(filename):
    """
    Serve audio files
    """
    try:
        file_path = AUDIO_DIR / filename
        
        print(f"🎵 Audio request: {filename}")
        print(f"   Looking for: {file_path.absolute()}")
        
        if file_path.exists():
            print(f"   ✓ File found, serving...")
            return send_file(
                file_path, 
                mimetype='audio/mpeg',
                as_attachment=False,
                download_name=filename
            )
        else:
            print(f"   ✗ File not found!")
            return jsonify({'error': 'File not found'}), 404
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return jsonify({'error': str(e)}), 500

