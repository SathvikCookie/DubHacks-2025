"""
Example integration showing how to use Gemini + ElevenLabs together
"""

# Example 1: Simple story generation flow
def generate_and_narrate_story(prompt, story_id):
    """
    Complete flow: Prompt -> Gemini -> ElevenLabs -> Audio file
    """
    # Step 1: Get story from Gemini (you'll implement this)
    # from utils.gemini import generate_story
    # gemini_response = generate_story(prompt)
    
    # For now, mock Gemini response
    gemini_response = [
        {
            "text": "Once upon a time, in a magical forest, there lived a brave little fox.",
            "emotion": "neutral"
        },
        {
            "text": "One day, the fox felt very scared when she heard a loud noise.",
            "emotion": "fear"
        },
        {
            "text": "But she gathered her courage and discovered it was just a friendly bear!",
            "emotion": "surprise"
        },
        {
            "text": "They became the best of friends and lived happily ever after.",
            "emotion": "joy"
        }
    ]
    
    # Step 2: Generate audio from the story segments
    from utils.elevenlabs_client import generate_story_audio_from_gemini
    
    audio_path = generate_story_audio_from_gemini(
        gemini_segments=gemini_response,
        output_filename=f"story_{story_id}.mp3"
    )
    
    # Step 3: Return the audio path and segments for frontend
    return {
        "story_id": story_id,
        "segments": gemini_response,
        "audio_url": f"/api/tts/audio/story_{story_id}.mp3",
        "audio_path": audio_path
    }


# Example 2: Flask endpoint that does everything
"""
Add this to your backend/api/stories.py:

@stories_bp.route('/<int:story_id>/generate-audio', methods=['POST'])
def generate_story_audio(story_id):
    '''
    Generate audio for an existing story
    '''
    try:
        # Get the story from database
        story = Story.query.get_or_404(story_id)
        
        # Assume story.content is in Gemini format or convert it
        segments = story.sentiment_data  # This should be your Gemini output
        
        # Generate audio
        from utils.elevenlabs_client import generate_story_audio_from_gemini
        audio_path = generate_story_audio_from_gemini(
            gemini_segments=segments,
            output_filename=f"story_{story_id}.mp3"
        )
        
        if audio_path:
            # Update story with audio URL
            story.audio_url = f"/api/tts/audio/story_{story_id}.mp3"
            db.session.commit()
            
            return jsonify({
                'success': True,
                'audio_url': story.audio_url,
                'message': 'Audio generated successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to generate audio'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
"""


# Example 3: Testing the integration
if __name__ == "__main__":
    print("Testing complete story generation flow...\n")
    
    result = generate_and_narrate_story(
        prompt="A story about a brave little fox",
        story_id=999
    )
    
    print("✓ Story generated!")
    print(f"  Story ID: {result['story_id']}")
    print(f"  Segments: {len(result['segments'])}")
    print(f"  Audio URL: {result['audio_url']}")
    print(f"  Audio Path: {result['audio_path']}")
    print("\nYou can now play the audio file!")

