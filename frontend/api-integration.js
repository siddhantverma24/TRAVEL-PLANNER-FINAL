/**
 * API Integration Functions for Visit USA Travel Website
 * Connects frontend to Flask backend at http://localhost:3001
 * 
 * Usage: Include this file in your HTML before script.js or paste functions as needed
 * Replace the hardcoded data functions in script.js with these versions
 */

const API_BASE = 'http://localhost:3001';

/* ==== WEATHER API ==== */
function fetchWeatherLive() {
  const city = document.getElementById('weatherCity').value.trim();
  if (!city) { showToast('Enter a city name', 'warning'); return; }
  const out = document.getElementById('weatherOutput');
  out.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6">🌤️ Fetching weather...</p>';
  
  fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) {
        out.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted)"><p>⚠️ ${data.error}</p></div>`;
        return;
      }
      const forecast = (data.forecast || []).map(f => 
        `<div class="forecast-day"><span class="f-day">${f.d}</span><span class="f-temp">${f.t}</span></div>`
      ).join('');
      out.innerHTML = `
        <div class="weather-card">
          <p style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.3rem">${city}</p>
          <div class="weather-temp">${data.temp}°C</div>
          <p class="weather-desc">${data.condition} · Feels like ${data.feels}°C</p>
          <div class="weather-details">
            <div class="weather-detail"><span>Humidity</span><span>${data.humidity}%</span></div>
            <div class="weather-detail"><span>Wind</span><span>${data.wind} km/h</span></div>
            <div class="weather-detail"><span>Icon</span><span>${data.icon}</span></div>
          </div>
          <div class="weather-forecast">${forecast}</div>
        </div>`;
    })
    .catch(err => {
      console.error('Weather API error:', err);
      out.innerHTML = `<div style="text-align:center;padding:2rem;color:#e74c3c"><p>⚠️ Unable to fetch weather data</p></div>`;
    });
}

/* ==== CURRENCY API ==== */
function convertCurrencyLive() {
  const amt = parseFloat(document.getElementById('convAmount')?.value) || 0;
  const from = document.getElementById('convFrom')?.value;
  const to = document.getElementById('convTo')?.value;
  if (!from || !to) return;
  
  fetch(`${API_BASE}/api/currency?base=${from}`)
    .then(r => r.json())
    .then(data => {
      if (!data.rates) return;
      const fromRate = data.rates[from] || 1;
      const toRate = data.rates[to] || 1;
      const result = (amt / fromRate) * toRate;
      const resEl = document.getElementById('convResult');
      if (resEl) resEl.value = result.toFixed(2);
      const rateEl = document.getElementById('convRate');
      if (rateEl) rateEl.textContent = `1 ${from} = ${(toRate/fromRate).toFixed(4)} ${to}`;
      const allEl = document.getElementById('convAllRates');
      if (allEl) {
        allEl.innerHTML = Object.keys(data.rates).filter(c => c !== from).map(c =>
          `<div class="rate-row"><span>1 ${from} → ${c}</span><span>${(data.rates[c]/fromRate).toFixed(4)}</span></div>`
        ).join('');
      }
    })
    .catch(err => console.error('Currency API error:', err));
}

/* ==== FLIGHTS API ==== */
function searchFlightsLive() {
  const from = document.getElementById('flightFrom').value;
  const to = document.getElementById('flightTo').value;
  const date = document.getElementById('flightDepart').value;
  const cls = document.getElementById('flightClass').value;
  if (!from || !to || !date) { showToast('Please fill in all flight fields', 'warning'); return; }
  const res = document.getElementById('flightResults');
  res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">🔍 Searching flights…</p>';
  
  fetch(`${API_BASE}/api/flights?from=${from}&to=${to}&date=${date}&passengers=1&class=${cls}`)
    .then(r => r.json())
    .then(data => {
      const flights = data.flights || [];
      if (!flights.length) {
        res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">No flights found for this route.</p>';
        return;
      }
      res.innerHTML = flights.map(f => `
        <div class="flight-card">
          <div>
            <div class="flight-airline">✈️ ${f.airline}</div>
            <div class="flight-route">${f.from} → ${f.to}</div>
            <div class="flight-time">${f.depart} → ${f.arrive} · ${f.stops}</div>
          </div>
          <div class="flight-duration">⏱ ${f.duration}</div>
          <div>
            <div class="flight-price">$${f.price}</div>
            <button class="book-flight-btn" onclick="bookFlight('${f.airline}','${f.price}')">Book →</button>
          </div>
        </div>`).join('');
    })
    .catch(err => {
      console.error('Flights API error:', err);
      res.innerHTML = '<p style="color:#e74c3c">Unable to search flights</p>';
    });
}

/* ==== HOTELS API ==== */
function searchHotelsLive() {
  const city = document.getElementById('hotelCity').value;
  const ci = document.getElementById('hotelCheckin').value;
  const co = document.getElementById('hotelCheckout').value;
  const stars = document.getElementById('hotelStars').value;
  if (!city || !ci || !co) { showToast('Please fill in all hotel fields', 'warning'); return; }
  const res = document.getElementById('hotelResults');
  res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">🔍 Searching hotels in ' + city + '…</p>';
  
  fetch(`${API_BASE}/api/hotels?city=${encodeURIComponent(city)}&checkin=${ci}&checkout=${co}&guests=1&stars=${stars}`)
    .then(r => r.json())
    .then(data => {
      const hotels = data.hotels || [];
      if (!hotels.length) {
        res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">No hotels found.</p>';
        return;
      }
      res.innerHTML = hotels.map(h => `
        <div class="hotel-card">
          <img class="hotel-card-img" src="${h.image || 'https://via.placeholder.com/400x200'}" alt="${h.name}">
          <div class="hotel-card-body">
            <div class="hotel-stars">${'★'.repeat(h.stars)}${'☆'.repeat(5-h.stars)}</div>
            <div class="hotel-name">${h.name}</div>
            <div class="hotel-location">📍 ${h.location}</div>
            <div class="hotel-footer">
              <div class="hotel-price">$${h.price}<small>/night</small></div>
              <button class="book-hotel-btn" onclick="bookHotel('${h.name}','${h.price}')">Book →</button>
            </div>
          </div>
        </div>`).join('');
    })
    .catch(err => {
      console.error('Hotels API error:', err);
      res.innerHTML = '<p style="color:#e74c3c">Unable to search hotels</p>';
    });
}

/* ==== ITINERARY API ==== */
function generateItineraryLive(city, days, style, budget) {
  const btnTxt = document.querySelector('#itinerary-form .btn-text');
  const btnLdr = document.querySelector('#itinerary-form .btn-loader');
  if (btnTxt) btnTxt.style.display = 'none';
  if (btnLdr) btnLdr.style.display = 'inline';
  
  fetch(`${API_BASE}/api/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: city,
      days: days,
      interests: style ? [style] : [],
      budget: style === 'luxury' ? 500 : style === 'budget' ? 75 : 200
    })
  })
    .then(r => r.json())
    .then(data => {
      if (!data.days) throw new Error('Invalid itinerary response');
      const html = data.days.map((day, i) => `
        <div class="itinerary-day">
          <h4>📅 Day ${day.day} — ${city}</h4>
          ${(day.activities || []).map(act => `
            <div class="itinerary-activity">
              <div class="activity-details">
                <h5>${act}</h5>
              </div>
            </div>`).join('')}
          <div style="margin-top:1rem;padding:1rem;background:#f5f5f0;border-radius:8px;">
            <div class="cost-item"><span>💰 Est. Cost</span><strong>$${Math.round(data.totalCost/data.days.length)}</strong></div>
          </div>
        </div>`).join('');
      
      document.getElementById('itinerary-title').textContent = `🌟 ${days}-Day ${city} ${style.charAt(0).toUpperCase()+style.slice(1)} Journey`;
      document.getElementById('itinerary-content').innerHTML = html;
      document.getElementById('total-cost').innerHTML = `$${data.totalCost} <div class="cost-breakdown">
        <div class="cost-item"><span>🏨 Accommodation</span><strong>$${data.breakdown.accommodation}</strong></div>
        <div class="cost-item"><span>🍽️ Food</span><strong>$${data.breakdown.food}</strong></div>
        <div class="cost-item"><span>🎭 Activities</span><strong>$${data.breakdown.activities}</strong></div>
        <div class="cost-item"><span>🚗 Transport</span><strong>$${data.breakdown.transport}</strong></div>
      </div>`;
      
      const result = document.getElementById('itinerary-result');
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(`✨ Your ${days}-day itinerary has been generated!`, 'success');
    })
    .catch(err => {
      console.error('Itinerary API error:', err);
      showToast('Failed to generate itinerary', 'error');
    })
    .finally(() => {
      if (btnTxt) btnTxt.style.display = 'inline';
      if (btnLdr) btnLdr.style.display = 'none';
    });
}

/* ==== VISA API ==== */
function checkVisaLive() {
  const from = document.getElementById('visaFrom').value;
  const to = document.getElementById('visaTo').value;
  const out = document.getElementById('visaOutput');
  if (!from || !to) return;
  
  fetch(`${API_BASE}/api/visa?from=${from}&to=${to}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) {
        out.innerHTML = `<div class="visa-card"><div class="visa-status required">⚠️ Information not available</div></div>`;
        return;
      }
      const statusClass = data.status.includes('VISA FREE') ? 'free' : data.status.includes('REQUIRED') ? 'required' : 'on-arrival';
      out.innerHTML = `
        <div class="visa-card">
          <div class="visa-status ${statusClass}">${data.label}</div>
          <div class="visa-details">
            <h4>${from} → ${to}</h4>
            <div class="visa-detail-row"><span>Duration</span><span>${data.duration}</span></div>
            <div class="visa-detail-row"><span>Processing</span><span>${data.processing}</span></div>
            <div class="visa-detail-row"><span>Cost</span><span>${data.cost}</span></div>
            <div style="margin-top:1rem;padding:1rem;background:#f9f6f4;border-radius:8px;font-size:.9rem;">
              <strong>📋 Notes:</strong><br>${data.notes}
            </div>
          </div>
        </div>`;
    })
    .catch(err => {
      console.error('Visa API error:', err);
      out.innerHTML = '<p style="color:#e74c3c">Unable to fetch visa information</p>';
    });
}

/* ==== MAPS API ==== */
function searchLocationLive(query) {
  fetch(`${API_BASE}/api/maps/search?q=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .then(data => {
      console.log('Map search results:', data.results);
      // Use results to populate location dropdown or display on map
      if (data.results && data.results[0]) {
        const result = data.results[0];
        console.log(`Found: ${result.name} at ${result.lat}, ${result.lon}`);
      }
    })
    .catch(err => console.error('Maps API error:', err));
}

/* ==== TRANSLATION API ==== */
function translatePhraseLive(text, targetLang, sourceLang = 'en') {
  fetch(`${API_BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text,
      target: targetLang,
      source: sourceLang
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.translation) {
        console.log(`Translation: ${data.translation}`);
        return data.translation;
      }
    })
    .catch(err => console.error('Translation API error:', err));
}

/* ===== USAGE INSTRUCTIONS ===== 
 * 
 * 1. Replace existing function calls in script.js:
 *    - fetchWeather() → fetchWeatherLive()
 *    - convertCurrency() → convertCurrencyLive()
 *    - searchFlights() → searchFlightsLive()
 *    - searchHotels() → searchHotelsLive()
 *    - generateItinerary(...) → generateItineraryLive(...)
 *    - checkVisa() → checkVisaLive()
 *
 * 2. Or include as separate file and call directly
 *
 * 3. Make sure backend is running:
 *    flask --app backend.app run --debug --port 3001
 *
 * 4. Update API_BASE if deploying to production
 */
