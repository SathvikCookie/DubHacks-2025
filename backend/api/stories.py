from flask import Blueprint, jsonify, request
from models import db, Story, AudioAsset
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.story_audio_processor import StoryAudioProcessor

stories_bp = Blueprint('stories', __name__)

@stories_bp.route('', methods=['GET'])
def get_stories():
    """Get all stories"""
    stories = Story.query.all()
    return jsonify([{
        'id': s.id,
        'uuid': s.uuid,
        'title': s.title,
        'content': s.content,
        'segments': s.segments,
        'audio_segments': s.audio_segments,
        'voice_id': s.voice_id,
        'created_at': s.created_at.isoformat(),
        'processed_at': s.processed_at.isoformat() if s.processed_at else None
    } for s in stories])

@stories_bp.route('/<int:story_id>', methods=['GET'])
def get_story(story_id):
    """Get single story by ID"""
    story = Story.query.get_or_404(story_id)
    return jsonify({
        'id': story.id,
        'uuid': story.uuid,
        'title': story.title,
        'content': story.content,
        'prompt': story.prompt,
        'segments': story.segments,
        'audio_segments': story.audio_segments,
        'voice_id': story.voice_id,
        'created_at': story.created_at.isoformat(),
        'processed_at': story.processed_at.isoformat() if story.processed_at else None
    })

@stories_bp.route('/generate', methods=['POST'])
def generate_story():
    """
    Generate story from Gemini and process audio
    
    Expected request body:
    {
        "title": "Story Title",
        "prompt": "Original prompt",
        "segments": [
            {"text": "Story text...", "emotion": "sad"},
            {"text": "More text...", "emotion": "happy"}
        ]
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title') or not data.get('segments'):
            return jsonify({'error': 'Missing required fields: title and segments'}), 400
        
        # Extract full text from segments
        full_content = ' '.join([seg['text'] for seg in data['segments']])
        
        # Create story in database (without audio yet)
        story = Story(
            title=data['title'],
            content=full_content,
            prompt=data.get('prompt'),
            segments=data['segments']
        )
        db.session.add(story)
        db.session.commit()
        
        print(f"\n📖 Created story: {story.title} (ID: {story.id}, UUID: {story.uuid})")
        
        # Process audio for each segment
        processor = StoryAudioProcessor()
        audio_metadata = processor.process_story_segments(
            story_uuid=story.uuid,
            segments=data['segments'],
            voice_id="jTk8bSDoiLDLZqAVYKKr"  # Aayan voice
        )
        
        # Store audio metadata in story
        story.audio_segments = audio_metadata
        story.processed_at = datetime.utcnow()
        
        # Create AudioAsset records for each segment
        for meta in audio_metadata:
            if meta.get('audio_file'):  # Only create if audio was successfully generated
                audio_asset = AudioAsset(
                    story_id=story.id,
                    segment_index=meta['segment_index'],
                    filename=meta['filename'],
                    file_path=meta['audio_file'],
                    emotion=meta['emotion'],
                    duration=meta.get('duration')
                )
                db.session.add(audio_asset)
        
        db.session.commit()
        
        print(f"✓ Story saved with {len(audio_metadata)} audio segments")
        
        return jsonify({
            'success': True,
            'story': {
                'id': story.id,
                'uuid': story.uuid,
                'title': story.title,
                'content': story.content,
                'segments': story.segments,
                'audio_segments': story.audio_segments,
                'created_at': story.created_at.isoformat(),
                'processed_at': story.processed_at.isoformat()
            },
            'message': f'Story created with {len(audio_metadata)} audio segments'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error generating story: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stories_bp.route('', methods=['POST'])
def create_story():
    """
    Create story by generating from Gemini AI and processing audio
    
    Expected request body:
    {
        "prompt": "write a story for my child about...",
        "voice_id": "optional_voice_id" (defaults to "jTk8bSDoiLDLZqAVYKKr")
    }
    """
    try:
        import json
        from utils.gemini import generate_story as gemini_generate_story
        
        data = request.json
        
        # Validate prompt
        if not data.get('prompt'):
            return jsonify({'error': 'Missing required field: prompt'}), 400
        
        # Get voice_id from request or use default
        voice_id = data.get('voice_id', 'jTk8bSDoiLDLZqAVYKKr')
        
        print(f"\n🤖 Generating story from prompt: {data['prompt'][:100]}...")
        print(f"🎤 Using voice ID: {voice_id}")
        
        # Generate story using Gemini
        gemini_response = gemini_generate_story(data['prompt'])
        
        # Parse Gemini JSON response
        # Remove markdown code blocks if present
        if gemini_response.strip().startswith('```'):
            # Strip markdown code block wrappers
            lines = gemini_response.strip().split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines[-1].startswith('```'):
                lines = lines[:-1]
            gemini_response = '\n'.join(lines)
        
        generated_content = json.loads(gemini_response)
        
        print(f"✓ Story generated: {generated_content['title']}")
        print(f"  Segments: {len(generated_content['segments'])}")
        
        # Extract full text from segments
        full_content = ' '.join([seg['text'] for seg in generated_content['segments']])
        
        # Create story in database (without audio yet)
        story = Story(
            title=generated_content['title'],
            content=full_content,
            prompt=data.get('prompt'),
            segments=generated_content['segments'],
            voice_id=voice_id
        )
        db.session.add(story)
        db.session.commit()
        
        print(f"📖 Created story: {story.title} (ID: {story.id}, UUID: {story.uuid})")
        
        # Process audio for each segment
        print(f"🎵 Processing audio for {len(generated_content['segments'])} segments...")
        processor = StoryAudioProcessor()
        audio_metadata = processor.process_story_segments(
            story_uuid=story.uuid,
            segments=generated_content['segments'],
            voice_id=voice_id
        )
        
        # Store audio metadata in story
        story.audio_segments = audio_metadata
        story.processed_at = datetime.utcnow()
        
        # Create AudioAsset records for each segment
        for meta in audio_metadata:
            if meta.get('audio_file'):  # Only create if audio was successfully generated
                audio_asset = AudioAsset(
                    story_id=story.id,
                    segment_index=meta['segment_index'],
                    filename=meta['filename'],
                    file_path=meta['audio_file'],
                    emotion=meta['emotion'],
                    duration=meta.get('duration')
                )
                db.session.add(audio_asset)
        
        db.session.commit()
        
        print(f"✓ Story saved with {len(audio_metadata)} audio segments\n")
        
        return jsonify({
            'success': True,
            'id': story.id,
            'uuid': story.uuid,
            'story': {
                'id': story.id,
                'uuid': story.uuid,
                'title': story.title,
                'content': story.content,
                'segments': story.segments,
                'audio_segments': story.audio_segments,
                'created_at': story.created_at.isoformat(),
                'processed_at': story.processed_at.isoformat()
            },
            'message': f'Story created with {len(audio_metadata)} audio segments'
        }), 201
        
    except json.JSONDecodeError as e:
        db.session.rollback()
        print(f"❌ JSON Parse Error: {e}")
        return jsonify({'error': f'Failed to parse Gemini response: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating story: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@stories_bp.route('/<int:story_id>', methods=['PUT'])
def update_story(story_id):
    """Update story"""
    story = Story.query.get_or_404(story_id)
    data = request.json
    
    story.title = data.get('title', story.title)
    story.content = data.get('content', story.content)
    story.segments = data.get('segments', story.segments)
    
    db.session.commit()
    return jsonify({'message': 'Story updated'})

@stories_bp.route('/<int:story_id>', methods=['DELETE'])
def delete_story(story_id):
    """Delete story and associated audio files"""
    story = Story.query.get_or_404(story_id)
    
    # Delete audio files from filesystem
    if story.audio_segments:
        for audio_meta in story.audio_segments:
            if audio_meta.get('audio_file'):
                try:
                    os.remove(audio_meta['audio_file'])
                except:
                    pass
    
    db.session.delete(story)
    db.session.commit()
    return jsonify({'message': 'Story deleted'})
