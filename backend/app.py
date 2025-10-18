from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    # Register blueprints
    from api.stories import stories_bp
    from api.tts import tts_bp
    
    app.register_blueprint(stories_bp, url_prefix='/api/stories')
    app.register_blueprint(tts_bp, url_prefix='/api/tts')
    
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

