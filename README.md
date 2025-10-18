# 📚 Storybook - AI-Powered Emotional Learning for Kids

> **DubHacks 2025 Hackathon Project**
> 
> An interactive storytelling app that helps children ages 3-7 understand emotions through AI-generated stories, real-time sentiment analysis, and color-coded emotional cues.

## 🎯 Overview

Storybook combines visual, auditory, and textual learning methods to teach emotional literacy. Parents can generate custom stories, add their own voice narration, and watch as the app maps emotions to calming colors during playback.

**Demo-ready frontend included** - works without backend setup!

## Structure

```
DubHacks-2025/
├── backend/           # Flask REST API
│   ├── api/          # API endpoints
│   ├── utils/        # Helper functions (Gemini, ElevenLabs, sentiment)
│   └── app.py        # Flask app entry point
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Main pages
        ├── components/
        └── services/ # API client
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

### Frontend (Complete Demo Mode)
✅ **Stories List Page** - Beautiful grid of story cards with emotion previews
✅ **Create Story Page** - AI generation mockup + manual entry
✅ **Full-Screen Player** - Netflix-style player with:
  - Smooth emotion color transitions
  - Progress bar with seeking
  - Play/pause/restart controls
  - Real-time emotion labels
  - Animated background colors
✅ **Demo Stories** - 3 pre-loaded stories with sentiment data
✅ **Context State Management** - No backend needed for demo

### Backend (Boilerplate Ready)
- [ ] Implement Gemini story generation in `utils/gemini.py`
- [ ] Implement ElevenLabs TTS in `utils/elevenlabs.py`
- [ ] Implement sentiment analysis in `utils/sentiment.py`
- [ ] Add database initialization script
- [ ] Create story generation endpoint
- [ ] Connect frontend to backend API
- [ ] Implement auth (later)

## Demo Features

The frontend works standalone with 3 demo stories:
1. **The Brave Little Star** - Journey from sadness to joy
2. **The Magical Garden** - Surprise, fear, calm, and joy
3. **The Friendly Dragon** - Overcoming fear through curiosity

Each story includes:
- Sentiment data with emotion-to-color mapping
- Smooth color transitions during playback
- Emotion labels and timing
- Simulated 40-second narration

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 2 minutes
- **[DESIGN_GUIDE.md](DESIGN_GUIDE.md)** - UI/UX design system and color palette
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete file structure
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** - Presentation guide for judges

## 🔑 Environment Variables

See `backend/.env.example` for required variables:
- `GEMINI_API_KEY` - Google Gemini for story generation
- `ELEVENLABS_API_KEY` - ElevenLabs for text-to-speech
- `SECRET_KEY` - Flask session secret

## 🎨 Emotion Color System

| Emotion | Color | Purpose |
|---------|-------|---------|
| Joy | #FFD700 (Yellow) | Warm, positive |
| Sadness | #87CEEB (Blue) | Calm, reflective |
| Fear | #FF8C69 (Orange) | Alert, not scary |
| Surprise | #FFA500 (Bright Orange) | Energetic |
| Calm | #B0E0E6 (Powder Blue) | Peaceful |
| Neutral | #A0AEC0 (Gray) | Balanced |

## 🤝 Contributing

This is a hackathon project. Team members can:
1. Clone the repo
2. Choose a component (see PROJECT_STRUCTURE.md)
3. Implement your feature
4. Test with demo data
5. Push when ready

## 📝 License

MIT License - feel free to use and modify!

