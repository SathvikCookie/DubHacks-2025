from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Story(db.Model):
    __tablename__ = 'stories'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)  # Full story text
    prompt = db.Column(db.Text)
    segments = db.Column(db.JSON, nullable=False)  # Gemini segments: [{"text": "...", "emotion": "sad"}]
    audio_segments = db.Column(db.JSON)  # Audio file metadata: [{"segment_index": 0, "text": "...", "emotion": "sad", "audio_file": "path", "duration": 5.2}]
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime)  # When audio processing completed
    
    # Relationships
    audio_files = db.relationship('AudioAsset', backref='story', lazy=True, cascade='all, delete-orphan')

class AudioAsset(db.Model):
    __tablename__ = 'audio_assets'
    
    id = db.Column(db.Integer, primary_key=True)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'), nullable=False)
    segment_index = db.Column(db.Integer, nullable=False)  # Which segment this audio belongs to
    filename = db.Column(db.String(500), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    emotion = db.Column(db.String(50))
    duration = db.Column(db.Float)  # Duration in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
