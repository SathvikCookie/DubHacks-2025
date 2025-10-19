import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Get the base directory (where config.py is located)
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Use absolute path for database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(basedir, "instance", "storybook.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
    
    # Storage
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')

