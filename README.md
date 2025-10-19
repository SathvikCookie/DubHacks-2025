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

Backend runs on `http://localhost:5001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

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

## 📝 License

MIT License - feel free to use and modify!

