# Storybook MVP - DubHacks 2025

Minimal boilerplate for a story generation app with sentiment analysis and audio narration.

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

## TODO

- [ ] Implement Gemini story generation in `utils/gemini.py`
- [ ] Implement ElevenLabs TTS in `utils/elevenlabs.py`
- [ ] Implement sentiment analysis in `utils/sentiment.py`
- [ ] Add database initialization script
- [ ] Create story generation endpoint
- [ ] Implement audio playback in player
- [ ] Add emotion color transitions
- [ ] Implement auth (later)

## Environment Variables

See `backend/.env.example` for required variables:
- `GEMINI_API_KEY`
- `ELEVENLABS_API_KEY`
- `SECRET_KEY`

