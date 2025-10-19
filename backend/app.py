from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from api.stories import stories_bp
from api.tts import tts_bp
from api.audio import audio_bp
from api.lights import lights_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize database
    db.init_app(app)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    
    app.register_blueprint(stories_bp, url_prefix='/api/stories')
    app.register_blueprint(tts_bp, url_prefix='/api/tts')
    app.register_blueprint(audio_bp, url_prefix='/api/audio')
    app.register_blueprint(lights_bp, url_prefix='/api/lights')
    
    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001, host='0.0.0.0')
