# 🔐 Environment Variables Setup Guide

## Overview

This project uses environment variables to store sensitive API keys and configuration. These files are **not tracked by Git** to keep your credentials safe.

## Quick Setup

### 1. Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` and add your API keys:

```bash
# Open in your editor
nano .env
# or
code .env
# or
vim .env
```

### 2. Add Your API Keys

#### Google Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste into `GEMINI_API_KEY=` in `.env`

#### ElevenLabs API Key
1. Go to https://elevenlabs.io/app/settings/api-keys
2. Sign in or create account
3. Copy your API key
4. Paste into `ELEVENLABS_API_KEY=` in `.env`

### 3. Frontend Environment Variables (Optional)

```bash
cd frontend
cp .env.example .env
```

The frontend `.env` contains the backend API URL. Default is `http://localhost:5001/api`.

## Environment Files Structure

```
DubHacks-2025/
├── .gitignore                    # Ignores .env files
├── backend/
│   ├── .env                      # ❌ NOT in Git (your actual keys)
│   └── .env.example              # ✅ In Git (template)
└── frontend/
    ├── .env                      # ❌ NOT in Git (your config)
    └── .env.example              # ✅ In Git (template)
```

## Backend .env File

```bash
# Google Gemini API Key
GEMINI_API_KEY=AIzaSyD...your_actual_key_here

# ElevenLabs API Key
ELEVENLABS_API_KEY=sk_abc123...your_actual_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=dev-secret-key-change-in-production

# Database
DATABASE_URL=sqlite:///instance/storybook.db

# Server Configuration
HOST=0.0.0.0
PORT=5001
```

## Frontend .env File

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:5001/api

# Development settings
VITE_ENV=development
```

## How It's Used in Code

### Backend

```python
# In backend/utils/gemini.py
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
```

```python
# In backend/utils/elevenlabs_client.py
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('ELEVENLABS_API_KEY')
```

### Frontend

```javascript
// In frontend/src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
```

## Verify Setup

### Check Backend Environment Variables

```bash
cd backend
python -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('GEMINI_API_KEY:', 'Set ✓' if os.getenv('GEMINI_API_KEY') else 'Missing ✗')
print('ELEVENLABS_API_KEY:', 'Set ✓' if os.getenv('ELEVENLABS_API_KEY') else 'Missing ✗')
"
```

Expected output:
```
GEMINI_API_KEY: Set ✓
ELEVENLABS_API_KEY: Set ✓
```

### Test API Keys Work

```bash
cd backend
python test_end_to_end.py
```

Should generate a story with audio if keys are valid.

## Troubleshooting

### Error: "Missing key inputs argument"
**Cause:** GEMINI_API_KEY not set  
**Solution:** Add key to `backend/.env`

### Error: "Unauthorized" from ElevenLabs
**Cause:** ELEVENLABS_API_KEY invalid or missing  
**Solution:** Check key at https://elevenlabs.io/app/settings/api-keys

### .env file not being read
**Cause:** `python-dotenv` not installed  
**Solution:**
```bash
cd backend
pip install python-dotenv
```

### Environment variables not updating
**Cause:** Python cached the old values  
**Solution:** Restart Flask server (Ctrl+C and run again)

## Security Best Practices

### ✅ DO:
- Keep `.env` files **local only**
- Use `.env.example` as a template (no real keys)
- Add `.env` to `.gitignore`
- Rotate API keys if accidentally committed
- Use different keys for dev/staging/production

### ❌ DON'T:
- Commit `.env` files to Git
- Share `.env` files via Slack/email
- Hard-code API keys in source files
- Use production keys in development
- Push `.env` to GitHub/GitLab

## For Team Members

When cloning this repo:

1. **Copy example files:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Get API keys:**
   - Ask team lead for shared dev keys
   - Or create your own at the provider websites

3. **Add keys to `.env`**

4. **Test:**
   ```bash
   cd backend
   python test_end_to_end.py
   ```

## Production Deployment

For production (Render, Heroku, etc.):

1. **Don't use `.env` files**
2. **Set environment variables in hosting dashboard:**
   - Render: Environment → Add Environment Variable
   - Heroku: Settings → Config Vars
   - Vercel: Settings → Environment Variables

3. **Use production keys** (not dev keys)

4. **Set secure SECRET_KEY:**
   ```python
   import secrets
   secrets.token_hex(32)
   ```

## Getting API Keys

### Google Gemini
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and save securely
5. Free tier: 60 requests/minute

### ElevenLabs
1. Visit: https://elevenlabs.io
2. Sign up for account
3. Go to Settings → API Keys
4. Click "Create API Key"
5. Copy and save securely
6. Free tier: 10,000 characters/month

## Example .env Files

### Development (Local)
```bash
GEMINI_API_KEY=AIzaSyDev_key_for_local_testing
ELEVENLABS_API_KEY=sk_dev_key_for_local_testing
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5001
```

### Production
```bash
GEMINI_API_KEY=AIzaSyProd_key_for_production
ELEVENLABS_API_KEY=sk_prod_key_for_production
FLASK_ENV=production
FLASK_DEBUG=0
PORT=8080
SECRET_KEY=actual_random_secure_key_here
```

---

## Quick Reference

| Variable | Required | Where to Get | Used In |
|----------|----------|--------------|---------|
| `GEMINI_API_KEY` | Yes | https://aistudio.google.com/app/apikey | Story generation |
| `ELEVENLABS_API_KEY` | Yes | https://elevenlabs.io/app/settings/api-keys | Audio narration |
| `SECRET_KEY` | Yes (prod) | Generate random | Flask sessions |
| `PORT` | No | Default: 5001 | Flask server |

---

🔐 **Remember: Never commit `.env` files to Git!**

