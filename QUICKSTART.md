# 🚀 Quick Start Guide

## Get the Demo Running in 2 Minutes

### Frontend Only (No Backend Needed)

The frontend works standalone with demo data - perfect for UI/UX development!

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` and you'll see:
- ✨ 3 demo stories ready to play
- 🎨 Full emotion color system working
- 🎵 Simulated audio playback with progress
- ➕ Create story page with AI mockup

### Full Stack (Backend + Frontend)

#### Terminal 1 - Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## What You Can Do Right Now

### 1. Explore Demo Stories
- Click any story card to open the full-screen player
- Press play to see emotion colors transition smoothly
- Watch the emotion labels change as the story progresses

### 2. Create New Stories
- Click "Create Story" button
- Try the AI generation mockup (simulates 2s delay)
- Or manually write your own story
- New stories get random emotion data assigned

### 3. Test the Player
- **Play/Pause** - Big center button
- **Seek** - Click anywhere on progress bar
- **Restart** - Left circular button
- **Emotion Strip** - Top banner shows current emotion color

## Emotion Color System

The app uses these emotion → color mappings:

| Emotion | Color | Hex Code |
|---------|-------|----------|
| Joy/Happy | Warm Yellow | `#FFD700` |
| Sadness | Soft Blue | `#87CEEB` |
| Fear | Muted Orange | `#FF8C69` |
| Surprise | Bright Orange | `#FFA500` |
| Calm | Light Blue | `#B0E0E6` |
| Neutral | Gray | `#A0AEC0` |

Colors transition smoothly over 1 second using CSS transitions.

## Architecture

```
Frontend (React Context)
├── StoriesContext → In-memory state
├── Demo stories with sentiment data
└── Simulated playback timer

Backend (Flask - Optional)
├── REST API endpoints ready
├── SQLAlchemy models defined
└── Placeholder functions for AI services
```

## Next Steps for Development

1. **Backend Integration**
   - Implement `utils/gemini.py` for story generation
   - Implement `utils/elevenlabs.py` for TTS
   - Implement `utils/sentiment.py` for emotion analysis
   - Connect frontend API calls to backend

2. **Audio System**
   - Replace simulated timer with real Audio element
   - Handle audio file loading and streaming
   - Add audio preloading for smooth playback

3. **Sentiment Analysis**
   - Integrate real sentiment analysis during story generation
   - Map text segments to emotion timestamps
   - Support more nuanced emotion detection

4. **Parent Features** (Later)
   - Authentication system
   - Voice cloning flow
   - Child profiles
   - Story library management

## File Structure

```
frontend/src/
├── pages/
│   ├── StoriesList.jsx      ← Stories grid
│   ├── StoryCreate.jsx      ← Create/generate stories
│   └── PlayerFullScreen.jsx ← Netflix-style player
├── components/
│   ├── StoryCard.jsx        ← Story preview card
│   ├── EmotionStrip.jsx     ← Color banner
│   └── AudioControls.jsx    ← Play/pause/seek
├── context/
│   └── StoriesContext.jsx   ← State management + demo data
└── services/
    └── api.js               ← API client (ready for backend)
```

## Tips for Hackathon

- **Demo-ready**: Frontend works without backend
- **Visual polish**: Gradients, shadows, smooth transitions
- **Easy to show judges**: Just open a story and press play
- **Extensible**: Clean structure for adding features
- **No build complexity**: No Docker, Redis, or auth to set up

Happy hacking! 🎉

