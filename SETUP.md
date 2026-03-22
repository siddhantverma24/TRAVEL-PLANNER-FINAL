# Visit USA Travel Planner - Backend Setup Guide

## Project Overview

This is a Flask-based backend API server that integrates with 7 third-party APIs to provide travel information for the "Visit USA" travel website. The backend acts as a Backend-for-Frontend (BFF) pattern, mediating between the frontend and external APIs, handling authentication, caching, and providing fallback data.

### Integrated APIs

1. **Weather** - OpenWeatherMap (Current + 5-day forecast)
2. **Currency** - ExchangeRate-API (Multiple currency conversion)
3. **Flights** - Amadeus (Real-time flight search)
4. **Hotels** - RapidAPI (Hotel booking data)
5. **Itinerary** - Anthropic Claude (AI-generated travel plans)
6. **Maps** - OpenStreetMap Nominatim (Location search and geocoding)
7. **Translations** - LibreTranslate (Language translations)
8. **Visa Info** - Local database (105 country pair combinations)

---

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git (optional)

---

## Installation Steps

### 1. Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd traver-planner

# Or extract the zip file if downloaded
```

### 2. Create Python Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Environment Configuration

Copy the `.env.example` file to `.env` in the project root:

```bash
cp .env.example .env   # macOS/Linux
copy .env.example .env # Windows
```

Edit `.env` and fill in your API keys (see "Getting API Keys" section below).

---

## Getting API Keys

Follow the steps below to obtain free API keys. **Start with free tiers first** - they're sufficient for development and testing.

### 1. OpenWeather API (Weather)

**Cost**: FREE tier available (free: 1000 calls/day)

1. Go to: https://openweathermap.org/api
2. Click "Sign Up" 
3. Create free account
4. Go to "API keys" tab in dashboard
5. Copy the "Default" API key
6. Add to `.env`:
   ```
   OPENWEATHER_KEY=your_copied_key
   ```

**Fallback**: Yes - returns hardcoded data if API fails

---

### 2. ExchangeRate-API (Currency)

**Cost**: FREE tier available (free: 1500 calls/month)

1. Go to: https://www.exchangerate-api.com
2. Click "Get Free Key"
3. Sign up with email
4. Verify email
5. Copy your API key from dashboard
6. Add to `.env`:
   ```
   EXCHANGE_KEY=your_copied_key
   ```

**Fallback**: Yes - returns cached rates if API fails

---

### 3. Amadeus API (Flights)

**Cost**: FREE tier available (free: 10,000 test calls/month)

1. Go to: https://developers.amadeus.com
2. Click "Create an account"
3. Complete registration and email verification
4. Create a new app in the dashboard
5. You'll receive:
   - Client ID
   - Client Secret
6. Add to `.env`:
   ```
   AMADEUS_KEY=your_client_id
   AMADEUS_SECRET=your_client_secret
   ```

**Note**: Default is TEST mode (uses test airport codes like ORD, LAX, JFK)

**Fallback**: Yes - generates random flights if API fails

---

### 4. RapidAPI (Hotels)

**Cost**: FREE tier available (various endpoints with free requests)

1. Go to: https://rapidapi.com
2. Click "Sign Up"
3. Complete registration
4. Search for "Hotels" in the marketplace
5. Subscribe to the Hotels API (free tier)
6. Find your API key in "Dashboard" → "API Keys"
7. Copy the `X-RapidAPI-Key` value
8. Add to `.env`:
   ```
   RAPIDAPI_KEY=your_api_key
   ```

**Fallback**: Yes - returns sample hotels if API fails

---

### 5. Anthropic Claude API (Itinerary)

**Cost**: PAID starting at $0.003 per 1K input tokens

1. Go to: https://console.anthropic.com
2. Click "Sign Up"
3. Complete registration and email verification
4. Add payment method to your account
5. Go to "API Keys" in the dashboard
6. Create a new API key
7. Copy the key (it appears only once)
8. Add to `.env`:
   ```
   ANTHROPIC_KEY=your_api_key
   ```

**Note**: Requires credit card. Keep your key secret - it costs money to use.

**Fallback**: Yes - returns generic itinerary if API fails or key is missing

---

### 6. LibreTranslate (Translations)

**Cost**: FREE (No API key needed)

LibreTranslate API is completely free and open-source. No registration needed.

- Endpoints: https://api.libretranslate.de
- No API key required
- Up to 5000 characters per request
- Supports 30+ languages

**Fallback**: Not needed - uses free public API

---

### 7. OpenStreetMap Nominatim (Maps)

**Cost**: FREE (No API key needed)

OpenStreetMap's Nominatim is free geocoding service. No registration needed.

- Endpoints: https://nominatim.openstreetmap.org
- No API key required
- Usage policy: Max 1 request/second
- For heavy use: Download and self-host

**Fallback**: Reduces accuracy if rate-limited

---

## Environment Configuration

Your `.env` file should look like:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true
PORT=3001
FRONTEND_URL=http://localhost:5500

# API Keys
OPENWEATHER_KEY=abc123def456...
EXCHANGE_KEY=xyz789abc456...
AMADEUS_KEY=amadeus_client_id...
AMADEUS_SECRET=amadeus_client_secret...
RAPIDAPI_KEY=rapidapi_key...
ANTHROPIC_KEY=sk-ant-abc123...
```

**Important**: 
- Never commit `.env` to Git
- Keep API keys secret
- `.gitignore` already includes `.env`

---

## Running the Backend

### Development Mode

```bash
# Make sure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Run development server
flask --app backend.app run --debug --port 3001
```

Output should show:
```
 * Serving Flask app 'backend.app'
 * Debug mode: on
 * Running on http://127.0.0.1:3001
```

The backend is now running at `http://localhost:3001`

### Check Health Endpoint

Test if backend is working:

```bash
# In terminal/PowerShell:
curl http://localhost:3001/api/health

# Or open in browser:
# http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "apis": {
    "weather": true,
    "currency": true,
    "flights": true,
    "hotels": true,
    "itinerary": true,
    "maps": true,
    "translate": true,
    "visa": true
  }
}
```

---

## Production Deployment

### Using Gunicorn

For production, use Gunicorn instead of Flask's development server:

```bash
# Install (already in requirements.txt)
pip install gunicorn

# Run with Gunicorn
gunicorn backend.app:app --bind 0.0.0.0:3001 --workers 4
```

### Environment-Specific Configuration

For production, create a `.env.production` file:

```env
FLASK_ENV=production
FLASK_DEBUG=false
PORT=3001
FRONTEND_URL=https://yourwebsite.com

# API Keys (use prod keys)
OPENWEATHER_KEY=...
EXCHANGE_KEY=...
AMADEUS_KEY=...
AMADEUS_SECRET=...
RAPIDAPI_KEY=...
ANTHROPIC_KEY=...
```

Then load it:
```bash
# Load production config
export $(cat .env.production | xargs)
gunicorn backend.app:app --bind 0.0.0.0:3001
```

### Deployment Platforms

#### Heroku

```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set OPENWEATHER_KEY=your_key
heroku config:set EXCHANGE_KEY=your_key
# ... set all other keys

git push heroku main
```

#### Railway.app

1. Push code to GitHub
2. Go to railway.app, create project
3. Connect GitHub repo
4. Add environment variables in dashboard
5. Deploy with single click

#### Render

1. Go to render.com
2. Connect GitHub repo
3. Create "New Web Service"
4. Add environment variables
5. Deploy

---

## Frontend Integration

The frontend needs to point to the backend API at `http://localhost:3001` (development) or your deployment URL (production).

### Update Frontend Configuration

In your `frontend/script.js`, ensure the API_BASE URL is set:

```javascript
const API_BASE = 'http://localhost:3001';

// Example API calls:
// Weather: GET /api/weather?city=NewYork
// Currency: GET /api/currency?base=USD
// Flights: GET /api/flights?from=ORD&to=LAX&date=2024-03-15&passengers=1
// Hotels: GET /api/hotels?city=NewYork&checkin=2024-03-15&checkout=2024-03-18&guests=2
// Itinerary: POST /api/itinerary { destination, days, interests, budget }
// Maps: GET /api/maps/airport?state=Illinois
// Translate: POST /api/translate { text, target, source }
// Visa: GET /api/visa?from=US&to=UK
```

---

## API Endpoints

### Weather
```
GET /api/weather?city=NewYork
Returns: {temp, feels, humidity, wind, condition, icon, forecast[]}
```

### Currency
```
GET /api/currency?base=USD
Returns: {base, rates{}, lastUpdated}
```

### Flights
```
GET /api/flights?from=ORD&to=LAX&date=2024-03-15&passengers=1&class=ECONOMY
Returns: {flights[]}
```

### Hotels
```
GET /api/hotels?city=NewYork&checkin=2024-03-15&checkout=2024-03-18&guests=2&stars=any
Returns: {hotels[], nights, city, checkin, checkout}
```

### Itinerary
```
POST /api/itinerary
Body: {destination, days, interests[], budget}
Returns: {days[], totalCost, breakdown{}}
```

### Maps
```
GET /api/maps/search?q=Denver%20airport
GET /api/maps/airport?state=Colorado
Returns: {query/name, results[]/result}
```

### Translate
```
POST /api/translate
Body: {text, target, source}
Returns: {text, translation, source, target, sourceLanguage, targetLanguage}

GET /api/languages
Returns: {languages{}, count}
```

### Visa
```
GET /api/visa?from=US&to=UK
Returns: {country, status, label, duration, processing, cost, notes}

GET /api/visa/countries
Returns: {countries[], count}
```

---

## Troubleshooting

### Port 3001 Already in Use

```bash
# Find process using port 3001
Windows: netstat -ano | findstr :3001
macOS/Linux: lsof -i :3001

# Kill the process or use different port
flask --app backend.app run --port 3002
```

### API Key Not Working

1. Verify key is correct in `.env`
2. Check API tier (free tier limits)
3. Verify API is enabled in their dashboard
4. Look at console logs for error messages

### "ModuleNotFoundError" Errors

```bash
# Make sure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Errors in Frontend

Ensure the `FRONTEND_URL` in `.env` matches your frontend URL:

```env
# Development
FRONTEND_URL=http://localhost:5500

# Production
FRONTEND_URL=https://yourwebsite.com
```

### "Cannot find module 'routes'"

Ensure the `/backend/routes/` folder exists with:
- `__init__.py` (can be empty)
- `weather.py`, `currency.py`, `flights.py`, etc.

---

## Performance Tips

1. **Cache results**: APIs implement TTL caching (weather: 10min, currency: 1hr)
2. **Use fallback data**: APIs return fallback if external service is down
3. **Deploy to edge**: Use CDN/edge servers closer to users
4. **Monitor API usage**: Keep track of free tier limits
5. **Use free tiers**: LibreTranslate and Nominatim are completely free

---

## Cost Analysis (Monthly)

| API | Free Tier | Cost |
|-----|-----------|------|
| OpenWeather | 1,000 calls/day ✅ | Free |
| ExchangeRate | 1,500 calls/month ✅ | Free |
| Amadeus | 10,000 test calls/month ✅ | Free (Test) |
| RapidAPI | Varies, most free ✅ | Free |
| LibreTranslate | Unlimited ✅ | Free |
| Nominatim | Unlimited* ✅ | Free |
| Claude API | Pay-per-token | ~$0.003 per 1K tokens |

*Nominatim has rate limits (1 req/sec). For heavy use, self-host or upgrade.

---

## Support & Documentation

- **Flask**: https://flask.palletsprojects.com
- **OpenWeather**: https://openweathermap.org/api
- **ExchangeRate**: https://www.exchangerate-api.com/docs
- **Amadeus**: https://developers.amadeus.com
- **Anthropic Claude**: https://docs.anthropic.com
- **LibreTranslate**: https://docs.libretranslate.com
- **Nominatim**: https://nominatim.org/release-docs

---

## Security Notes

1. **API keys**: Never commit `.env` to Git ✅ (.gitignore configured)
2. **CORS**: Restricted to `FRONTEND_URL` only
3. **HTTPS**: Use in production
4. **Rate limiting**: Add rate limiting middleware for production
5. **Authentication**: Consider adding user authentication for trip saving

---

## Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Create `.env` file with API keys
3. ✅ Start backend: `flask --app backend.app run --debug`
4. ✅ Update frontend API_BASE URL
5. ✅ Test each API endpoint

Happy traveling! 🌍✈️

