# ✅ Quick Start Checklist

Follow this checklist to get your Travel Planner up and running in 10 minutes.

## Phase 1: Backend Setup (5 min)

- [ ] **1.1 Create Virtual Environment**
  ```bash
  python -m venv venv
  venv\Scripts\activate  # Windows
  # or: source venv/bin/activate  # macOS/Linux
  ```

- [ ] **1.2 Install Dependencies**
  ```bash
  pip install -r requirements.txt
  ```

- [ ] **1.3 Create .env File**
  ```bash
  cp .env.example .env  # Windows: copy .env.example .env
  ```

- [ ] **1.4 Add API Keys to .env** (Minimum: at least 1-2 keys to test)
  ```env
  OPENWEATHER_KEY=your_key_here
  EXCHANGE_KEY=your_key_here
  # ... add others as needed
  ```

- [ ] **1.5 Start Backend**
  ```bash
  flask --app backend.app run --debug --port 3001
  ```

- [ ] **1.6 Verify Backend is Running**
  - Open browser: `http://localhost:3001/api/health`
  - Should see JSON: `{"status":"ok","apis":{...}}`

## Phase 2: Frontend Setup (3 min)

- [ ] **2.1 Open Frontend**
  - Option A: Direct file - Open `frontend/index.html` in browser
  - Option B: Local server - `python -m http.server 5500 --directory frontend`
  - Then visit: `http://localhost:5500`

- [ ] **2.2 Add API Integration File**
  - In `frontend/index.html`, add before `</head>`:
  ```html
  <script src="api-integration.js"></script>
  ```

- [ ] **2.3 Update Button Handlers**
  - Find button onclick handlers
  - Replace:
    - `fetchWeather()` → `fetchWeatherLive()`
    - `convertCurrency()` → `convertCurrencyLive()`
    - `searchFlights()` → `searchFlightsLive()`
    - `searchHotels()` → `searchHotelsLive()`
    - `checkVisa()` → `checkVisaLive()`

## Phase 3: Test APIs (2 min)

### Test Each API

- [ ] **3.1 Weather API**
  - In browser console:
  ```javascript
  fetch('http://localhost:3001/api/weather?city=NewYork').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: temp, feels, humidity, wind, condition

- [ ] **3.2 Currency API**
  - In browser console:
  ```javascript
  fetch('http://localhost:3001/api/currency?base=USD').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: rates for multiple currencies

- [ ] **3.3 Visa API**
  - In browser console:
  ```javascript
  fetch('http://localhost:3001/api/visa?from=US&to=JP').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: visa requirements

- [ ] **3.4 Flights API** (Fallback demo)
  - In browser console:
  ```javascript
  fetch('http://localhost:3001/api/flights?from=ORD&to=LAX&date=2024-03-15&passengers=1').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: array of flights

- [ ] **3.5 UI Testing**
  - Click weather search button → Should show live data
  - Try currency conversion
  - Try flight search
  - Try visa lookup

## Phase 4: API Keys (Optional but Recommended)

Get free API keys for better testing:

- [ ] **4.1 OpenWeatherMap** (Weather)
  - Go: https://openweathermap.org/api
  - Sign up > Get API key > Add to .env

- [ ] **4.2 ExchangeRate-API** (Currency)
  - Go: https://www.exchangerate-api.com
  - Sign up > Free key > Add to .env

- [ ] **4.3 Anthropic Claude** (Itinerary AI - OPTIONAL, costs $ to use)
  - Go: https://console.anthropic.com
  - Sign up > Create API key > Add to .env

- [ ] **4.4 Verify Keys Work**
  - Frontend: Each API should show ✅ in health check
  - Or refresh `http://localhost:3001/api/health` to see enabled APIs

## Troubleshooting

### Issue: "Cannot GET /api/health"
**Solution:** Backend not running
```bash
flask --app backend.app run --debug --port 3001
```

### Issue: CORS errors in console
**Solution:** Backend CORS not configured for frontend URL
- Edit `.env`: `FRONTEND_URL=http://localhost:5500`
- Restart Flask

### Issue: "API not configured" messages
**Solution:** Missing API keys
- Edit `.env` file and add at least 1-2 API keys
- Most have free tiers - see docs

### Issue: Frontend doesn't connect to backend
**Solution:** API_BASE wrong in `api-integration.js`
```javascript
const API_BASE = 'http://localhost:3001';  // Make sure port is 3001
```

## Next Steps

After everything is working:

1. **Read Full Documentation**
   - [README.md](README.md) - Project overview
   - [SETUP.md](SETUP.md) - Backend detailed guide
   - [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Frontend detailed guide

2. **Get All API Keys** (see SETUP.md)
   - OpenWeatherMap
   - ExchangeRate-API
   - Amadeus (flights)
   - RapidAPI (hotels)
   - Anthropic Claude (AI itinerary)

3. **Test in Browser**
   - Open Frontend at `http://localhost:5500`
   - Try each feature:
     - ☀️ Weather search
     - 💱 Currency converter
     - ✈️ Flight search
     - 🏨 Hotel search
     - 🎒 Itinerary generator
     - ✅ Visa checker

4. **Deploy to Production** (see SETUP.md)
   - Choose platform (Heroku, Railway, Render)
   - Update API_BASE URL
   - Configure environment variables
   - Deploy!

## Important Files to Remember

| File | Purpose | When to Edit |
|------|---------|--------------|
| `.env` | API keys & config | After each API signup |
| `frontend/api-integration.js` | API helper functions | Never (or to customize) |
| `frontend/index.html` | HTML structure | To add new features |
| `frontend/script.js` | Main JavaScript logic | To add new features |
| `backend/app.py` | Flask main app | Already configured |
| `backend/routes/*.py` | API endpoint handlers | Already configured |
| `SETUP.md` | Backend documentation | Reference when stuck |

## Command Reference

```bash
# Backend commands
python -m venv venv                              # Create venv
venv\Scripts\activate                            # Activate venv (Windows)
source venv/bin/activate                         # Activate venv (Mac/Linux)
pip install -r requirements.txt                  # Install packages
flask --app backend.app run --debug --port 3001 # Run dev server
pip freeze > requirements.txt                    # Update dependencies

# Frontend commands
python -m http.server 5500 --directory frontend # Run frontend server
code .                                           # Open in VS Code

# Git commands (if using version control)
git add .
git commit -m "message"
git push origin main
```

## Success Indicators

You'll know everything is working when:

✅ Backend runs without errors on `http://localhost:3001/api/health`
✅ Frontend loads at `http://localhost:5500`
✅ Browser console shows no CORS errors
✅ Weather search returns real data
✅ Currency conversion works
✅ Visa lookup shows results
✅ All buttons are clickable

## Need Help?

1. **Check Logs**: Look at terminal where Flask is running
2. **Check Console**: Open browser DevTools (F12)
3. **Check Docs**: Read SETUP.md or FRONTEND_INTEGRATION.md
4. **Check .env**: Verify all paths and URLs are correct

---

**You're ready to go!** 🎉 Start with Item 1.1 above and work your way through.

Have fun building! 🌍✈️
