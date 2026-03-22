# Frontend Integration Guide

## Overview

The Travel Planner frontend has been updated to connect with the Flask backend API. This guide shows how to integrate the new API-based functions.

## Quick Start

### Option 1: Use Separate API Integration File (Recommended)

1. **Include the API integration file in your HTML** before the main script.js:

```html
<!-- In index.html, before closing </head> or before script.js -->
<script src="frontend/api-integration.js"></script>
<script src="frontend/script.js"></script>
```

2. **Update your HTML event handlers** to use the new function names:

```html
<!-- Weather -->
<button onclick="fetchWeatherLive()">Search Weather</button>

<!-- Currency -->
<button onclick="convertCurrencyLive()">Convert</button>

<!-- Flights -->
<button onclick="searchFlightsLive()">Search Flights</button>

<!-- Hotels -->
<button onclick="searchHotelsLive()">Search Hotels</button>

<!-- Visa -->
<button onclick="checkVisaLive()">Check Visa</button>
```

### Option 2: Replace Functions Directly in script.js

Open `frontend/script.js` and replace the old functions with the corresponding ones from `api-integration.js`:

- `fetchWeather()` → Replace with `fetchWeatherLive()` code
- `convertCurrency()` → Replace with `convertCurrencyLive()` code  
- `searchFlights()` → Replace with `searchFlightsLive()` code
- `searchHotels()` → Replace with `searchHotelsLive()` code
- `generateItinerary()` → Call `generateItineraryLive()` from the form handler
- `checkVisa()` → Replace with `checkVisaLive()` code

## API Configuration

### Development

In `api-integration.js`, the API_BASE is set to:

```javascript
const API_BASE = 'http://localhost:3001';
```

This assumes the Flask backend is running on `localhost:3001`.

### Production

When deploying to production, update the API_BASE:

```javascript
const API_BASE = 'https://your-api-domain.com'; // Change to production URL
```

Or use an environment variable:

```javascript
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
```

## Available API Functions

### 1. Weather

**Function:** `fetchWeatherLive()`

**HTML:**
```html
<input id="weatherCity" placeholder="Enter city" />
<button onclick="fetchWeatherLive()">Get Weather</button>
<div id="weatherOutput"></div>
```

**Backend Endpoint:**
```
GET http://localhost:3001/api/weather?city=NewYork
```

**Response:**
```json
{
  "temp": 18,
  "feels": 15,
  "humidity": 65,
  "wind": 14,
  "condition": "Partly Cloudy",
  "icon": "⛅",
  "forecast": [
    {"d": "Mon", "i": "🌤️", "t": "19°"},
    {"d": "Tue", "i": "🌧️", "t": "14°"}
  ]
}
```

### 2. Currency

**Function:** `convertCurrencyLive()`

**HTML:**
```html
<input id="convAmount" type="number" />
<select id="convFrom"><option value="USD">USD</option></select>
<select id="convTo"><option value="EUR">EUR</option></select>
<button onclick="convertCurrencyLive()">Convert</button>
<input id="convResult" readonly />
<div id="convRate"></div>
<div id="convAllRates"></div>
```

**Backend Endpoint:**
```
GET http://localhost:3001/api/currency?base=USD
```

### 3. Flights

**Function:** `searchFlightsLive()`

**HTML:**
```html
<input id="flightFrom" placeholder="From (e.g., ORD)" />
<input id="flightTo" placeholder="To (e.g., LAX)" />
<input id="flightDepart" type="date" />
<select id="flightClass"><option>ECONOMY</option></select>
<button onclick="searchFlightsLive()">Search Flights</button>
<div id="flightResults"></div>
```

**Backend Endpoint:**
```
GET http://localhost:3001/api/flights?from=ORD&to=LAX&date=2024-03-15&passengers=1&class=ECONOMY
```

### 4. Hotels

**Function:** `searchHotelsLive()`

**HTML:**
```html
<input id="hotelCity" placeholder="City" />
<input id="hotelCheckin" type="date" />
<input id="hotelCheckout" type="date" />
<select id="hotelStars"><option value="any">Any Stars</option></select>
<button onclick="searchHotelsLive()">Search Hotels</button>
<div id="hotelResults"></div>
```

**Backend Endpoint:**
```
GET http://localhost:3001/api/hotels?city=NewYork&checkin=2024-03-15&checkout=2024-03-18&guests=2&stars=any
```

### 5. Itinerary (AI-Generated)

**Function:** `generateItineraryLive(city, days, style, budget)`

**HTML:**
```html
<form id="itinerary-form" onsubmit="event.preventDefault(); const city=document.getElementById('itinerary-city').value; const days=parseInt(document.getElementById('itinerary-days').value); const style=document.getElementById('travel-style').value; const budget=parseInt(document.getElementById('daily-budget').value); generateItineraryLive(city, days, style, budget);">
  <input id="itinerary-city" placeholder="Destination" />
  <input id="itinerary-days" type="number" min="1" max="30" />
  <select id="travel-style">
    <option value="luxury">Luxury</option>
    <option value="budget">Budget</option>
    <option value="adventure">Adventure</option>
    <option value="cultural">Cultural</option>
  </select>
  <input id="daily-budget" type="number" min="50" />
  <button type="submit">
    <span class="btn-text">Generate Itinerary</span>
    <span class="btn-loader" style="display:none;">Loading...</span>
  </button>
</form>
<div id="itinerary-result" style="display:none;">
  <h3 id="itinerary-title"></h3>
  <div id="itinerary-content"></div>
  <div id="total-cost"></div>
</div>
```

**Backend Endpoint:**
```
POST http://localhost:3001/api/itinerary
Body: {
  "destination": "Paris",
  "days": 5,
  "interests": ["culture", "food"],
  "budget": 200
}
```

### 6. Visa Requirements

**Function:** `checkVisaLive()`

**HTML:**
```html
<select id="visaFrom">
  <option value="US">🇺🇸 USA</option>
  <option value="UK">🇬🇧 UK</option>
</select>
<select id="visaTo">
  <option value="JP">🇯🇵 Japan</option>
  <option value="FR">🇫🇷 France</option>
</select>
<button onclick="checkVisaLive()">Check Visa</button>
<div id="visaOutput"></div>
```

**Backend Endpoint:**
```
GET http://localhost:3001/api/visa?from=US&to=JP
```

**Response:**
```json
{
  "country": "US->JP",
  "status": "VISA FREE",
  "label": "Visa-Free",
  "duration": "90 days",
  "processing": "Automatic",
  "cost": "$0",
  "notes": "Passport must be valid 6+ months"
}
```

### 7. Maps/Geocoding

**Function:** `searchLocationLive(query)`

**Usage:**
```javascript
searchLocationLive("New York airport");
// Returns: { name, type, lat, lon, address }
```

**Backend Endpoint:**
```
GET http://localhost:3001/api/maps/search?q=Denver%20airport
```

### 8. Translation

**Function:** `translatePhraseLive(text, targetLang, sourceLang)`

**Usage:**
```javascript
translatePhraseLive("Hello", "es", "en");
// Returns: "Hola"
```

**Backend Endpoint:**
```
POST http://localhost:3001/api/translate
Body: {
  "text": "Hello",
  "target": "es",
  "source": "en"
}
```

## Testing the Integration

### 1. Start the Backend

```bash
# Activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows or source venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure .env with API keys
# (Create .env from .env.example)

# Start Flask
flask --app backend.app run --debug --port 3001
```

### 2. Test API Health

Open browser console and run:
```javascript
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(data => console.log(data));
```

Expected output:
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

### 3. Test Individual APIs

```javascript
// Test weather
fetch('http://localhost:3001/api/weather?city=NewYork')
  .then(r => r.json())
  .then(d => console.log(d));

// Test currency
fetch('http://localhost:3001/api/currency?base=USD')
  .then(r => r.json())
  .then(d => console.log(d));

// Test visa
fetch('http://localhost:3001/api/visa?from=US&to=JP')
  .then(r => r.json())
  .then(d => console.log(d));
```

## Troubleshooting

### CORS Errors

If you see errors like `Access to XMLHttpRequest blocked by CORS policy`, make sure:

1. Backend is configured with correct FRONTEND_URL in `.env`:
```env
FRONTEND_URL=http://localhost:5500
```

2. Frontend is served from the correct URL (update if needed)

### API Key Errors

If you get "API not configured" errors:

1. Check that `.env` file exists in project root
2. Verify API keys are set correctly
3. Check that API services are active (in paid tiers)

### 404 Errors

If you get 404 errors from backend:

1. Verify Flask is running: `http://localhost:3001/api/health`
2. Check endpoint URLs match exactly
3. Verify parameters are correct (especially API_BASE)

## Production Deployment

When deploying to production:

1. **Update API_BASE** in `api-integration.js`:
```javascript
const API_BASE = 'https://your-travel-api.com';
```

2. **Update FRONTEND_URL** in backend `.env`:
```env
FRONTEND_URL=https://your-travel-website.com
```

3. **Use HTTPS** for all API calls

4. **Add rate limiting** to backend

5. **Monitor API usage** against free tier limits

## API Key Procurement Checklist

Before production, ensure you have:

- [ ] OpenWeatherMap API key (GET https://openweathermap.org/api)
- [ ] ExchangeRate-API key (GET https://www.exchangerate-api.com)
- [ ] Amadeus Client ID & Secret (GET https://developers.amadeus.com)
- [ ] RapidAPI Key (GET https://rapidapi.com)
- [ ] Anthropic API key (GET https://console.anthropic.com)
- [ ] LibreTranslate (free, no key needed)
- [ ] Nominatim/OSM (free, no key needed)

## Support

For issues with API integration:

1. Check browser console for errors
2. Check backend logs for error messages
3. Verify .env configuration
4. Test endpoints with curl:
   ```bash
   curl http://localhost:3001/api/health
   curl 'http://localhost:3001/api/weather?city=NewYork'
   ```

---

**Backend Documentation:** See `SETUP.md` for full backend setup and deployment instructions.
