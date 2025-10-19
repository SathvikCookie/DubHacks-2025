from flask import Blueprint, jsonify, request
from models import db, Story
from utils.gemini import generate_story
import json

stories_bp = Blueprint('stories', __name__)

@stories_bp.route('', methods=['GET'])
def get_stories():
    stories = Story.query.all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'content': s.content,
        'audio_url': s.audio_url,
        'created_at': s.created_at.isoformat()
    } for s in stories])

@stories_bp.route('/<int:story_id>', methods=['GET'])
def get_story(story_id):
    story = Story.query.get_or_404(story_id)
    return jsonify({
        'id': story.id,
        'title': story.title,
        'content': story.content,
        'prompt': story.prompt,
        'audio_url': story.audio_url,
        'created_at': story.created_at.isoformat()
    })

@stories_bp.route('', methods=['POST'])
def create_story():
    data = request.json
    generated_content = json.loads(generate_story(data['prompt']))
    # TODO: Add audio generation step here, so that audio can be saved with the story in one database commit below
    story = Story(
        title=generated_content['title'],
        content=str(generated_content['segments']),
        prompt=data.get('prompt')
    )
    db.session.add(story)
    db.session.commit()
    print('here')
    return jsonify({'id': story.id, 'message': 'Story created'}), 201

@stories_bp.route('/<int:story_id>', methods=['PUT'])
def update_story(story_id):
    story = Story.query.get_or_404(story_id)
    data = request.json
    
    story.title = data.get('title', story.title)
    story.content = data.get('content', story.content)
    story.sentiment_data = data.get('sentiment_data', story.sentiment_data)
    
    db.session.commit()
    return jsonify({'message': 'Story updated'})

@stories_bp.route('/<int:story_id>', methods=['DELETE'])
def delete_story(story_id):
    story = Story.query.get_or_404(story_id)
    db.session.delete(story)
    db.session.commit()
    return jsonify({'message': 'Story deleted'})

