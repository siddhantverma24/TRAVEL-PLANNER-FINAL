// ============================================================
// VISIT USA — script.js  (Complete Final Version)
// Features: Preloader, Navbar, Carousel, Maps, Itinerary,
//   Weather, Currency, Packing, Visa, Flights, Hotels,
//   Quiz, Countdown, Phrases, Budget, Reviews, Toast
// ============================================================

'use strict';

/* ─────────────────────────────────────────────────────────
   0. API CONFIGURATION
───────────────────────────────────────────────────────── */
const API_BASE = window.location.origin; // Dynamically use current origin (localhost or 127.0.0.1)

let fxRates = { USD:1, EUR:0.924, GBP:0.793, JPY:149.82, AUD:1.531, CAD:1.362, INR:83.18, CHF:0.883 };

/* ─────────────────────────────────────────────────────────
   1. TOAST
───────────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ─────────────────────────────────────────────────────────
   3. MODAL HELPERS
───────────────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  el.style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    if (e.target === m) closeModal(m.id);
  });
  const modal = document.getElementById('mapModal');
  const destModal = document.getElementById('destinationMapModal');
  if (e.target === modal) closeMapModal();
  if (e.target === destModal) closeDestinationMap();
});

/* ─────────────────────────────────────────────────────────
   4. NAVBAR
───────────────────────────────────────────────────────── */
let lastScroll = 0;
const navbar = document.getElementById('navbar');

/* ── SCROLL BEHAVIOR ──────────────────────────────────── */
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.pageYOffset > 20);
  }
});

/* ── MOBILE MENU TOGGLE ───────────────────────────────── */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (mobileMenu) {
    mobileMenu.classList.toggle('open');
    if (hamburger) hamburger.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  }
}

/* Close mobile menu on outside click */
document.addEventListener('click', (e) => {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});

/* ── SET ACTIVE NAV LINK ──────────────────────────────── */
function setActiveNavLink() {
  const currentPage = window.location.pathname;
  const currentFile = currentPage.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.nav-link[data-page="${currentFile.replace('.html', '')}"]`) ||
                     document.querySelector(`.nav-link[data-page="index"]`);
  if (activeLink) activeLink.classList.add('active');
}

/* ── DARK MODE TOGGLE ─────────────────────────────────── */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark ? '1' : '0');
}

/* ── INITIALIZE DARK MODE ─────────────────────────────── */
function initDarkMode() {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === '1') {
    document.body.classList.add('dark-mode');
    return;
  }
  if (savedTheme === '0') {
    document.body.classList.remove('dark-mode');
    return;
  }

  // First-time visitors follow OS preference.
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
}

/* ── NAVBAR SEARCH ────────────────────────────────────── */
function toggleNavSearch() {
  const navSearchBar = document.getElementById('navSearchBar');
  const navSearchInput = document.getElementById('navSearchInput');
  if (navSearchBar) {
    navSearchBar.classList.toggle('open');
    if (navSearchBar.classList.contains('open') && navSearchInput) {
      setTimeout(() => navSearchInput.focus(), 100);
    }
  }
}

function handleNavSearch(e) {
  if (e.key !== 'Enter') return;
  
  const searchQuery = e.target.value.trim().toLowerCase();
  if (!searchQuery) return;
  
  // Check for keyword matches
  if (searchQuery.includes('weather')) {
    window.location.href = './tools.html#weather';
  } else if (searchQuery.includes('flight')) {
    window.location.href = './tools.html#flights';
  } else if (searchQuery.includes('hotel')) {
    window.location.href = './tools.html#hotels';
  } else if (searchQuery.includes('visa')) {
    window.location.href = './tools.html#visa';
  } else if (searchQuery.includes('pack') || searchQuery.includes('packing')) {
    window.location.href = './tools.html#packing';
  } else if (searchQuery.includes('currency') || searchQuery.includes('exchange')) {
    window.location.href = './tools.html#currency';
  } else {
    // Default to destinations search
    window.location.href = './destinations.html';
  }
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href !== '#') {
      e.preventDefault();
      const t = document.querySelector(href);
      if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

/* ─────────────────────────────────────────────────────────
   6. HERO SEARCH TABS
───────────────────────────────────────────────────────── */
function setSearchTab(btn, type) {
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const placeholders = {
    flights: 'Where to? Enter a destination, city, or airport…',
    hotels: 'Where to? Enter a destination, city, or hotel…'
  };
  document.getElementById('heroSearch').placeholder = placeholders[type] || 'Where to? Enter a destination, city, or airport…';
}

function handleHeroSearch() {
  const q = document.getElementById('heroSearch').value.trim();
  if (!q) { showToast('Please enter a destination to search', 'warning'); return; }
  // Try matching airport data
  for (const loc in airportData) {
    if (loc.toLowerCase().includes(q.toLowerCase())) {
      showMap(loc); return;
    }
  }
  // Try destination map
  for (const dest in destinationPOIs) {
    if (dest.toLowerCase().includes(q.toLowerCase())) {
      openDestinationMap(dest); return;
    }
  }
  showToast(`Searching for "${q}"…`, 'info');
  setTimeout(() => openModal('flightModal'), 600);
}

/* ─────────────────────────────────────────────────────────
   7. AIRPORT MAP DATA
───────────────────────────────────────────────────────── */
const airportData = {
  'California': [
    { name:'Los Angeles International (LAX)', lat:33.9416, lng:-118.4085 },
    { name:'San Francisco International (SFO)', lat:37.6213, lng:-122.3790 },
    { name:'San Diego International (SAN)', lat:32.7338, lng:-117.1933 },
    { name:'Sacramento International (SMF)', lat:38.6954, lng:-121.5908 }
  ],
  'Texas': [
    { name:'Dallas/Fort Worth International (DFW)', lat:32.8998, lng:-97.0403 },
    { name:'George Bush Intercontinental (IAH)', lat:29.9902, lng:-95.3368 },
    { name:'Austin-Bergstrom International (AUS)', lat:30.1975, lng:-97.6664 }
  ],
  'Florida': [
    { name:'Miami International (MIA)', lat:25.7959, lng:-80.2870 },
    { name:'Orlando International (MCO)', lat:28.4312, lng:-81.3081 },
    { name:'Tampa International (TPA)', lat:27.9755, lng:-82.5332 }
  ],
  'New York': [
    { name:'John F. Kennedy International (JFK)', lat:40.6413, lng:-73.7781 },
    { name:'LaGuardia (LGA)', lat:40.7769, lng:-73.8740 },
    { name:'Buffalo Niagara International (BUF)', lat:42.9405, lng:-78.7322 }
  ],
  'Illinois': [
    { name:"O'Hare International (ORD)", lat:41.9742, lng:-87.9073 },
    { name:'Midway International (MDW)', lat:41.7868, lng:-87.7522 }
  ],
  'Nevada': [
    { name:'Harry Reid International (LAS)', lat:36.0840, lng:-115.1537 },
    { name:'Reno-Tahoe International (RNO)', lat:39.4991, lng:-119.7681 }
  ],
  'Washington': [
    { name:'Seattle-Tacoma International (SEA)', lat:47.4502, lng:-122.3088 },
    { name:'Spokane International (GEG)', lat:47.6199, lng:-117.5339 }
  ],
  'Colorado': [
    { name:'Denver International (DEN)', lat:39.8561, lng:-104.6737 },
    { name:'Colorado Springs (COS)', lat:38.8059, lng:-104.7009 }
  ],
  'Hawaii': [
    { name:'Daniel K. Inouye International (HNL)', lat:21.3187, lng:-157.9225 },
    { name:'Kahului Airport (OGG)', lat:20.8986, lng:-156.4307 }
  ],
  'Arizona': [
    { name:'Phoenix Sky Harbor (PHX)', lat:33.4352, lng:-112.0101 },
    { name:'Tucson International (TUS)', lat:32.1161, lng:-110.9410 }
  ],
  'Massachusetts': [{ name:'Boston Logan International (BOS)', lat:42.3656, lng:-71.0096 }],
  'Georgia':        [{ name:'Hartsfield-Jackson Atlanta (ATL)', lat:33.6407, lng:-84.4277 }],
  'Puerto Rico':    [{ name:'Luis Muñoz Marín International (SJU)', lat:18.4394, lng:-66.0018 }],
  'U.S. Virgin Islands': [{ name:'Cyril E. King Airport (STT)', lat:18.3373, lng:-64.9733 }],
  'Washington D.C.': [
    { name:'Ronald Reagan Washington National (DCA)', lat:38.8512, lng:-77.0402 },
    { name:'Washington Dulles International (IAD)', lat:38.9531, lng:-77.4565 }
  ]
};

let airportMap, currentMarkers = [];

function showMap(location) {
  openModal('mapModal');
  document.getElementById('modalTitle').textContent = `${location} Airports`;
  setTimeout(() => { initAirportMap(location); if (airportMap) airportMap.invalidateSize(); }, 200);
}
function closeMapModal() { closeModal('mapModal'); }

function initAirportMap(location) {
  const airports = airportData[location] || [];
  if (!airports.length) return;
  const lat = airports.reduce((s,a) => s+a.lat, 0) / airports.length;
  const lng = airports.reduce((s,a) => s+a.lng, 0) / airports.length;
  if (!airportMap) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    airportMap = L.map(mapContainer).setView([lat, lng], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(airportMap);
  } else {
    airportMap.setView([lat, lng], 7);
  }
  currentMarkers.forEach(m => m.remove());
  currentMarkers = [];
  const list = document.getElementById('airportList');
  if (!list) return;
  list.innerHTML = '';
  airports.forEach(a => {
    const m = L.marker([a.lat, a.lng]).bindPopup(`<strong>${a.name}</strong>`).addTo(airportMap);
    currentMarkers.push(m);
    const d = document.createElement('div');
    d.className = 'poi-item';
    d.innerHTML = `<h4>${a.name.split('(')[0]}</h4><p>${a.name.match(/\(([^)]+)\)/)?.[1]||''}</p>`;
    d.onclick = () => { airportMap.setView([a.lat, a.lng], 11); m.openPopup(); };
    list.appendChild(d);
  });
}

/* ─────────────────────────────────────────────────────────
   8. DESTINATION MAP (POI)
───────────────────────────────────────────────────────── */
let destMapInstance;
const destinationPOIs = {
  'New York City': {
    center:[40.7128,-74.0060],
    pois:[
      {name:'Statue of Liberty',lat:40.6892,lng:-73.9810,type:'attraction',desc:'Iconic symbol of freedom'},
      {name:'Central Park',lat:40.7829,lng:-73.9654,type:'attraction',desc:'840-acre urban oasis'},
      {name:'Empire State Building',lat:40.7484,lng:-73.9857,type:'attraction',desc:'Art deco skyscraper'},
      {name:'Times Square',lat:40.7580,lng:-73.9855,type:'attraction',desc:'Entertainment & media hub'},
      {name:"Katz's Delicatessen",lat:40.7223,lng:-73.9872,type:'restaurant',desc:'Famous pastrami sandwiches since 1888'},
      {name:'Le Bernardin',lat:40.7614,lng:-73.9776,type:'restaurant',desc:'Three Michelin star seafood'},
      {name:'Peter Luger Steak House',lat:40.7107,lng:-73.9622,type:'restaurant',desc:'Legendary Brooklyn steakhouse'}
    ]
  },
  'San Francisco': {
    center:[37.7749,-122.4194],
    pois:[
      {name:'Golden Gate Bridge',lat:37.8199,lng:-122.4783,type:'attraction',desc:'Iconic suspension bridge'},
      {name:'Alcatraz Island',lat:37.8267,lng:-122.4233,type:'attraction',desc:'Historic island prison'},
      {name:"Fisherman's Wharf",lat:37.8080,lng:-122.4177,type:'attraction',desc:'Vibrant waterfront district'},
      {name:'Golden Gate Park',lat:37.7694,lng:-122.4862,type:'attraction',desc:'1,017-acre urban park'},
      {name:'Gary Danko',lat:37.8056,lng:-122.4205,type:'restaurant',desc:'Fine contemporary cuisine'},
      {name:'Tartine Bakery',lat:37.7611,lng:-122.4242,type:'restaurant',desc:'World-famous artisan bakery'},
      {name:'House of Prime Rib',lat:37.7909,lng:-122.4215,type:'restaurant',desc:'Classic carved prime rib'}
    ]
  },
  'Grand Canyon': {
    center:[36.0544,-112.1401],
    pois:[
      {name:'South Rim Visitor Center',lat:36.0569,lng:-112.1096,type:'attraction',desc:'Main visitor hub'},
      {name:'Mather Point',lat:36.0625,lng:-112.1090,type:'attraction',desc:'Most popular viewpoint'},
      {name:'Bright Angel Trail',lat:36.0570,lng:-112.1410,type:'attraction',desc:'Premier hiking trail'},
      {name:'Desert View Watchtower',lat:36.0419,lng:-111.8281,type:'attraction',desc:'Historic 70-ft stone tower'},
      {name:'El Tovar Dining Room',lat:36.0579,lng:-112.1396,type:'restaurant',desc:'Historic lodge dining since 1905'},
      {name:'Bright Angel Restaurant',lat:36.0568,lng:-112.1398,type:'restaurant',desc:'Casual canyon-view dining'}
    ]
  },
  'Miami': {
    center:[25.7617,-80.1918],
    pois:[
      {name:'South Beach',lat:25.7907,lng:-80.1300,type:'attraction',desc:'World-famous Art Deco beach'},
      {name:'Art Deco Historic District',lat:25.7811,lng:-80.1300,type:'attraction',desc:'1920s–1940s architecture'},
      {name:'Vizcaya Museum & Gardens',lat:25.7443,lng:-80.2106,type:'attraction',desc:'Italian Renaissance estate'},
      {name:'Wynwood Walls',lat:25.8010,lng:-80.1994,type:'attraction',desc:'Iconic street art museum'},
      {name:"Joe's Stone Crab",lat:25.7697,lng:-80.1346,type:'restaurant',desc:'Miami institution since 1913'},
      {name:'Versailles Restaurant',lat:25.7642,lng:-80.2209,type:'restaurant',desc:'Famous Cuban cuisine'},
      {name:'Zuma Miami',lat:25.7712,lng:-80.1889,type:'restaurant',desc:'Upscale Japanese robatayaki'}
    ]
  },
  'Las Vegas': {
    center:[36.1699,-115.1398],
    pois:[
      {name:'The Las Vegas Strip',lat:36.1147,lng:-115.1729,type:'attraction',desc:'4.2-mile entertainment boulevard'},
      {name:'Bellagio Fountains',lat:36.1126,lng:-115.1767,type:'attraction',desc:'Iconic choreographed water show'},
      {name:'High Roller Observation Wheel',lat:36.1177,lng:-115.1682,type:'attraction',desc:'World\'s tallest observation wheel'},
      {name:'Fremont Street Experience',lat:36.1699,lng:-115.1423,type:'attraction',desc:'Historic downtown light canopy'},
      {name:'Joël Robuchon',lat:36.1055,lng:-115.1745,type:'restaurant',desc:'Most Michelin-starred chef'},
      {name:"Gordon Ramsay Hell's Kitchen",lat:36.1094,lng:-115.1738,type:'restaurant',desc:'Celebrity chef restaurant'},
      {name:'é by José Andrés',lat:36.1250,lng:-115.1692,type:'restaurant',desc:'Avant-garde tasting menu'}
    ]
  },
  'Yellowstone': {
    center:[44.4280,-110.5885],
    pois:[
      {name:'Old Faithful Geyser',lat:44.4605,lng:-110.8281,type:'attraction',desc:'World\'s most famous geyser'},
      {name:'Grand Prismatic Spring',lat:44.5250,lng:-110.8382,type:'attraction',desc:'Largest hot spring in the US'},
      {name:'Yellowstone Lake',lat:44.4472,lng:-110.3708,type:'attraction',desc:'Largest high-altitude lake in NA'},
      {name:'Mammoth Hot Springs',lat:44.9763,lng:-110.7030,type:'attraction',desc:'Colorful terraced springs'},
      {name:'Old Faithful Inn Dining',lat:44.4604,lng:-110.8295,type:'restaurant',desc:'Historic 1904 lodge dining room'},
      {name:'Lake Yellowstone Hotel',lat:44.5627,lng:-110.3967,type:'restaurant',desc:'Elegant lakeside dining'}
    ]
  }
};

async function openDestinationMap(name) {
  const modal = document.getElementById('destinationMapModal');
  const title = document.getElementById('destinationMapTitle');
  const sidebar = document.getElementById('destinationPOIs');
  const mapEl = document.getElementById('destinationMap');

  if (!modal || !title || !sidebar || !mapEl || typeof L === 'undefined') return;

  // Open modal (support both legacy .open and .active).
  modal.classList.add('open');
  modal.classList.add('active');
  title.textContent = '📍 ' + name;
  sidebar.innerHTML = '<p style="color:var(--text-muted);padding:1rem">Loading AI info...</p>';

  // 1) Geocode destination via Nominatim.
  let lat = 39.5;
  let lng = -98.35;
  let zoom = 5;
  try {
    const geo = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ' USA')}&format=json&limit=1`
    );
    const geoData = await geo.json();
    if (Array.isArray(geoData) && geoData.length > 0) {
      lat = parseFloat(geoData[0].lat);
      lng = parseFloat(geoData[0].lon);
      zoom = 11;
    }
  } catch (e) {
    // Keep fallback USA center.
  }

  // 2) Init/reset Leaflet map.
  mapEl.style.height = '380px';
  if (window._destMap) {
    window._destMap.remove();
    window._destMap = null;
  }

  const map = L.map('destinationMap').setView([lat, lng], zoom);
  window._destMap = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup(`<b>${name}</b>`).openPopup();

  // 3) Call Groq endpoint for overview + POIs.
  try {
    const res = await fetch('/api/hero-ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Tell me about ${name} as a US travel destination. Give me:\n1. A 2-sentence overview\n2. Exactly 4 must-visit points of interest with their real GPS coordinates\n\nRespond ONLY in this JSON format, no markdown:\n{\n  "overview": "...",\n  "pois": [\n    {"name": "...", "description": "...", "lat": 0.0, "lng": 0.0, "emoji": "..."},\n    {"name": "...", "description": "...", "lat": 0.0, "lng": 0.0, "emoji": "..."},\n    {"name": "...", "description": "...", "lat": 0.0, "lng": 0.0, "emoji": "..."},\n    {"name": "...", "description": "...", "lat": 0.0, "lng": 0.0, "emoji": "..."}\n  ]\n}`
      })
    });

    const raw = await res.json();
    let data = raw;

    // Fallback if endpoint returns hero card array.
    if (Array.isArray(raw)) {
      data = {
        overview: raw.map(r => r.tagline).filter(Boolean).join('. '),
        pois: raw.slice(0, 4).map(r => ({
          name: r.name,
          description: r.description,
          lat: lat + (Math.random() - 0.5) * 0.05,
          lng: lng + (Math.random() - 0.5) * 0.05,
          emoji: r.emoji || '📍'
        }))
      };
    }

    // 4) Add POI markers.
    const pois = Array.isArray(data?.pois) ? data.pois : [];
    pois.forEach((poi) => {
      const pLat = Number(poi.lat);
      const pLng = Number(poi.lng);
      if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return;

      const icon = L.divIcon({
        html: `<div style="font-size:1.6rem;line-height:1">${poi.emoji || '📍'}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([pLat, pLng], { icon })
        .addTo(map)
        .bindPopup(`<b>${poi.emoji || '📍'} ${poi.name || 'POI'}</b><br><small>${poi.description || ''}</small>`);
    });

    const allPoints = [[lat, lng], ...pois
      .filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
      .map((p) => [Number(p.lat), Number(p.lng)])
    ];
    if (allPoints.length > 1) {
      map.fitBounds(allPoints, { padding: [40, 40] });
    }

    // 5) Unsplash photos.
    const photoQueries = [name, `${name} landmark`, `${name} travel`];
    const seed = Date.now();
    const photoUrls = photoQueries.map((q, i) =>
      `https://source.unsplash.com/400x260/?${encodeURIComponent(q)}&sig=${seed + i}`
    );

    const photosHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:1rem">
        ${photoUrls.map((url) => `
          <img src="${url}" alt="${name}"
            style="width:100%;height:90px;object-fit:cover;border-radius:8px;cursor:pointer"
            onerror="this.style.display='none'"
            onclick="window.open('${url}','_blank')"
          >
        `).join('')}
      </div>
    `;

    // 6) Render sidebar.
    const poisHTML = pois.map((poi) => {
      const pLat = Number(poi.lat);
      const pLng = Number(poi.lng);
      const safeLat = Number.isFinite(pLat) ? pLat : lat;
      const safeLng = Number.isFinite(pLng) ? pLng : lng;
      return `
      <div style="padding:0.65rem 0;border-bottom:1px solid var(--border);cursor:pointer"
        onclick="window._destMap && window._destMap.setView([${safeLat},${safeLng}], 14)">
        <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary)">
          ${poi.emoji || '📍'} ${poi.name || 'Point of Interest'}
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem;line-height:1.4">
          ${poi.description || ''}
        </div>
      </div>
    `;
    }).join('');

    sidebar.innerHTML = `
      ${photosHTML}
      <p style="font-size:0.85rem;color:var(--text-primary);line-height:1.6;margin-bottom:0.75rem;padding:0 0.25rem">
        ${data?.overview || ''}
      </p>
      <h4 style="font-size:0.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:0.5rem">
        Must-Visit Spots
      </h4>
      ${poisHTML}
      <a href="https://www.google.com/maps/search/${encodeURIComponent(name)}+USA"
        target="_blank"
        style="display:block;margin-top:1rem;text-align:center;padding:0.6rem;background:var(--honey-bronze);color:#fff;border-radius:8px;font-size:0.82rem;font-weight:700;text-decoration:none">
        Open in Google Maps ↗
      </a>
    `;
  } catch (err) {
    sidebar.innerHTML = `
      <p style="color:var(--text-muted);padding:1rem;font-size:0.85rem">
        Could not load destination info. Please try again.
      </p>`;
  }
}

function closeDestinationMap() {
  const modal = document.getElementById('destinationMapModal');
  if (modal) {
    modal.classList.remove('open');
    modal.classList.remove('active');
  }
  if (window._destMap) {
    window._destMap.remove();
    window._destMap = null;
  }
}

/* ─────────────────────────────────────────────────────────
   AI TOOLS HELPERS + HANDLERS
───────────────────────────────────────────────────────── */
function aiShowLoading(resultId, btnEl, message = 'Getting AI response...') {
  document.getElementById(resultId).innerHTML = `
    <div class="ai-result-loading">
      <div class="ai-result-spinner"></div>
      <span>${message}</span>
    </div>`;
  if (btnEl) btnEl.disabled = true;
}

function aiShowError(resultId, btnEl) {
  document.getElementById(resultId).innerHTML = `
    <div class="ai-error-msg">
      ⚠️ Could not reach AI. Check your connection and try again.
    </div>`;
  if (btnEl) btnEl.disabled = false;
}

async function callAI(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('API error');
  return await res.json();
}

async function runAdventureFinder() {
  const dest = document.getElementById('advDest').value.trim();
  const duration = document.getElementById('advDuration').value;
  const budget = document.getElementById('advBudget').value;
  const family = document.getElementById('advFamily').value;
  const btn = document.querySelector('#cardAdventure .ai-tool-btn');

  if (!dest) {
    document.getElementById('resultAdventure').innerHTML =
      '<div class="ai-error-msg">⚠️ Please describe what you are interested in.</div>';
    return;
  }

  aiShowLoading('resultAdventure', btn, 'Finding family adventures...');

  try {
    const data = await callAI('/ai/adventure', {
      destination: dest,
      duration,
      budget,
      family_type: family
    });

    if (!Array.isArray(data) || data.length === 0) throw new Error();

    const cards = data.map((d) => `
      <div class="adv-card">
        <div class="adv-card-title">${d.emoji || '📍'} ${d.name}</div>
        <div class="adv-card-reason">${d.reason}</div>
        <div class="adv-card-meta">
          <span class="adv-tag">🎯 ${d.top_activity}</span>
          <span class="adv-tag">💵 ${d.daily_cost}</span>
          <span class="adv-tag">🗓️ ${d.best_season}</span>
        </div>
      </div>
    `).join('');

    document.getElementById('resultAdventure').innerHTML =
      `<div class="adv-cards">${cards}</div>`;
  } catch (e) {
    aiShowError('resultAdventure', btn);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function runRoadTripBuilder() {
  const start = document.getElementById('rtStart').value.trim();
  const end = document.getElementById('rtEnd').value.trim();
  const days = document.getElementById('rtDays').value;
  const style = document.getElementById('rtStyle').value;
  const btn = document.querySelector('#cardRoadtrip .ai-tool-btn');

  if (!start || !end) {
    document.getElementById('resultRoadtrip').innerHTML =
      '<div class="ai-error-msg">⚠️ Please enter both a start and end city.</div>';
    return;
  }

  aiShowLoading('resultRoadtrip', btn, 'Planning your road trip...');

  try {
    const data = await callAI('/ai/roadtrip', { start, end, days, style });

    if (!data.days || !Array.isArray(data.days)) throw new Error();

    const dayRows = data.days.map((d) => `
      <div class="rt-day">
        <div class="rt-day-num">${d.day}</div>
        <div class="rt-day-info">
          <div class="rt-day-stop">📍 ${d.stop}</div>
          <div class="rt-day-detail">
            🚗 ${d.drive_time} &nbsp;|&nbsp; 🍽️ ${d.eat}<br>
            🎯 ${d.do}<br>
            <em style="font-size:0.75rem;opacity:0.75">${d.highlight}</em>
          </div>
        </div>
      </div>
    `).join('');

    document.getElementById('resultRoadtrip').innerHTML = `
      <div class="rt-header">
        🗺️ ${data.route_name || start + ' → ' + end}
        <span style="font-weight:400;font-size:0.8rem;margin-left:0.5rem;opacity:0.7">
          ~${data.total_miles || '?'} total
        </span>
      </div>
      ${dayRows}
    `;
  } catch (e) {
    aiShowError('resultRoadtrip', btn);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function runViewsExplorer() {
  const region = document.getElementById('viewRegion').value;
  const type = document.getElementById('viewType').value;
  const season = document.getElementById('viewSeason').value;
  const btn = document.querySelector('#cardViews .ai-tool-btn');

  aiShowLoading('resultViews', btn, 'Discovering scenic spots...');

  try {
    const data = await callAI('/ai/views', { region, type, season });

    if (!Array.isArray(data) || data.length === 0) throw new Error();

    const cards = data.map((d) => `
      <div class="view-card">
        <div class="view-card-title">${d.emoji || '🌄'} ${d.name}</div>
        <div class="view-card-desc">${d.description}</div>
        <div class="view-card-meta">
          <span class="adv-tag">📸 ${d.photo_spot}</span>
          <span class="adv-tag">🏘️ ${d.nearby_town}</span>
          <span class="adv-tag">🥾 ${d.accessibility}</span>
        </div>
      </div>
    `).join('');

    document.getElementById('resultViews').innerHTML =
      `<div class="views-cards">${cards}</div>`;
  } catch (e) {
    aiShowError('resultViews', btn);
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ─────────────────────────────────────────────────────────
   9. TESTIMONIALS CAROUSEL
───────────────────────────────────────────────────────── */
let slideIndex = 0;
const slides = document.querySelectorAll('.testimonial-card');
const dots   = document.querySelectorAll('.dot');
let autoSlide;

function showSlide(i) {
  slides.forEach(s => s.classList.remove('active','prev'));
  dots.forEach(d => d.classList.remove('active'));
  if (i >= slides.length) slideIndex = 0;
  if (i < 0) slideIndex = slides.length - 1;
  slides[slideIndex].classList.add('active');
  if (dots[slideIndex]) dots[slideIndex].classList.add('active');
}
function moveCarousel(dir) { slideIndex += dir; showSlide(slideIndex); resetSlide(); }
function currentSlide(i)  { slideIndex = i; showSlide(i); resetSlide(); }
function resetSlide() { clearInterval(autoSlide); autoSlide = setInterval(() => moveCarousel(1), 5000); }
if (slides.length) { showSlide(0); autoSlide = setInterval(() => moveCarousel(1), 5000); }

/* ─────────────────────────────────────────────────────────
   10. EXPERIENCES FILTER
───────────────────────────────────────────────────────── */
function filterExp(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.exp-card').forEach(c => {
    const show = cat === 'all' || c.dataset.category === cat;
    if (show) {
      c.style.display = 'block';
      setTimeout(() => { c.style.opacity='1'; c.style.transform='translateY(0)'; }, 10);
    } else {
      c.style.opacity='0'; c.style.transform='translateY(20px)';
      setTimeout(() => { c.style.display='none'; }, 300);
    }
  });
}

/* ─────────────────────────────────────────────────────────
   11. BOOK EXPERIENCE
───────────────────────────────────────────────────────── */
function bookExperience(name, price) {
  showToast(`✈️ Booking "${name}" for ${price}…`, 'info');
  setTimeout(() => {
    const city = name.toLowerCase().includes('mountain') ? 'Denver' :
                 name.toLowerCase().includes('rafting') ? 'Colorado Springs' :
                 name.toLowerCase().includes('spa') ? 'Scottsdale' :
                 name.toLowerCase().includes('safari') ? 'Yellowstone' :
                 name.toLowerCase().includes('culinary') ? 'New York' : 'New York';
    document.getElementById('itinerary-city').value = city;
    scrollTo('itinerary-generator');
    showToast(`💡 Tip: Generate a full itinerary for your ${name}!`, 'info');
  }, 1200);
}

/* ─────────────────────────────────────────────────────────
   12. ITINERARY GENERATOR (Groq AI)
───────────────────────────────────────────────────────── */

function handleItinerarySubmit(e) {
  e.preventDefault();
  
  // Validation
  const city = document.getElementById('itinerary-city')?.value?.trim();
  const days = document.getElementById('itinerary-days')?.value;
  const style = document.getElementById('travel-style')?.value;
  const budget = document.getElementById('daily-budget')?.value;
  
  if (!city) {
    showToast('Please enter a destination city', 'error');
    document.getElementById('itinerary-city')?.focus();
    return;
  }
  if (!days) {
    showToast('Please select number of days', 'error');
    document.getElementById('itinerary-days')?.focus();
    return;
  }
  if (!style) {
    showToast('Please select a travel style', 'error');
    document.getElementById('travel-style')?.focus();
    return;
  }
  if (!budget || parseFloat(budget) < 50) {
    showToast('Please enter a valid daily budget (minimum $50)', 'error');
    document.getElementById('daily-budget')?.focus();
    return;
  }

  const btnTxt = e.target.querySelector('.btn-text');
  const btnLdr = e.target.querySelector('.btn-loader');
  btnTxt.style.display = 'none';
  btnLdr.style.display = 'inline';
  
  // Call API
  generateItineraryFromAPI(city, parseInt(days), style, parseInt(budget))
    .then(() => {
      btnTxt.style.display = 'inline';
      btnLdr.style.display = 'none';
    })
    .catch((error) => {
      console.error('API Error:', error);
      btnTxt.style.display = 'inline';
      btnLdr.style.display = 'none';
      showToast(`Error generating itinerary: ${error.message}`, 'error');
    });
}

async function generateItineraryFromAPI(city, days, style, budget) {
  try {
    const payload = {
      destination: city,
      days: days,
      interests: [style],
      budget: style
    };
    
    console.log('[API] Sending itinerary request:', payload);
    
    const response = await fetch(`${API_BASE}/api/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[API] Response received:', data);
    
    // Render the itinerary from API response
    renderItineraryFromAPI(data, days, city, style, budget);
    
  } catch (error) {
    console.error('[ERROR]', error);
    // Fallback to local generation if API fails
    showToast('Using fallback generation (API unavailable)', 'warning');
    const acts = activityDB[style] || activityDB.budget;
    generateLocalItinerary(city, days, style, budget, acts);
  }
}

function renderItineraryFromAPI(data, days, city, style, budget) {
  let html = '';
  
  // If API returned structured days
  if (data.days && Array.isArray(data.days)) {
    data.days.forEach(day => {
      html += `<div class="itinerary-day">
        <h4>📅 Day ${day.day} — ${day.title || city}</h4>`;
      
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach(activity => {
          const actTime = activity.time || '09:00';
          const actName = activity.activity || activity.name || 'Activity';
          const actDesc = activity.description || activity.desc || '';
          const actCost = activity.cost || Math.round(Math.random() * 200);
          
          html += `<div class="itinerary-activity">
            <div class="activity-time">⏰ ${actTime}</div>
            <div class="activity-details">
              <h5>${actName}</h5>
              <p>${actDesc}</p>
            </div>
            <div class="activity-cost">$${actCost}</div>
          </div>`;
        });
      }
      
      if (day.meals) {
        html += `<div class="day-meals">
          <strong>🍽️ Meals:</strong>
          <p>${Object.entries(day.meals).map(([meal, venue]) => `${meal}: ${venue}`).join(' | ')}</p>
        </div>`;
      }
      
      if (day.tips) {
        html += `<div class="day-tips">
          <strong>💡 Tips:</strong> ${day.tips}
        </div>`;
      }
      
      html += '</div>';
    });
  } else {
    // Fallback if API returns text instead of JSON
    html = `<div style="white-space: pre-wrap;">${data.itinerary || JSON.stringify(data, null, 2)}</div>`;
  }
  
  document.getElementById('itinerary-title').textContent = 
    `🌟 ${days}-Day ${city} ${style.charAt(0).toUpperCase()+style.slice(1)} Journey`;
  document.getElementById('itinerary-content').innerHTML = html;
  
  // Calculate and display costs
  const totalCost = data.totalCost || Math.round(budget * days * 0.8);
  const breakdown = data.breakdown || {
    accommodation: Math.round(totalCost * 0.35),
    food: Math.round(totalCost * 0.35),
    activities: Math.round(totalCost * 0.20),
    transport: Math.round(totalCost * 0.10)
  };
  
  document.getElementById('total-cost').innerHTML = `
    $${totalCost.toLocaleString()}
    <div class="cost-breakdown">
      <div class="cost-item">
        <span>🎭 Activities</span>
        <strong>$${breakdown.activities?.toLocaleString() || 0}</strong>
      </div>
      <div class="cost-item">
        <span>🏨 Accommodation</span>
        <strong>$${breakdown.accommodation?.toLocaleString() || 0}</strong>
      </div>
      <div class="cost-item">
        <span>🚗 Transport</span>
        <strong>$${breakdown.transport?.toLocaleString() || 0}</strong>
      </div>
    </div>`;
  
  const result = document.getElementById('itinerary-result');
  result.style.display = 'block';
  result.scrollIntoView({ behavior:'smooth', block:'start' });
  if (window.AOS) AOS.refresh();
  
  showToast(`✨ Your ${days}-day itinerary has been generated!`, 'success');
}

function generateLocalItinerary(city, days, style, budget, acts) {
  let html = '', total = 0;
  const times = ['9:00 AM','12:30 PM','4:00 PM','7:30 PM'];
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  
  for (let d = 1; d <= days; d++) {
    const dayName = dayNames[(d - 1) % 7];
    html += `<div class="itinerary-day">
      <h4>📅 Day ${d} — ${city} (${dayName})</h4>`;
    
    times.slice(0, 3).forEach(t => {
      const a = acts[Math.floor(Math.random() * acts.length)];
      const cost = Math.round(a.cost * (budget / 200));
      total += cost;
      html += `<div class="itinerary-activity">
        <div class="activity-time">⏰ ${t}</div>
        <div class="activity-details">
          <h5>${a.name}</h5>
          <p>${a.desc}</p>
        </div>
        <div class="activity-cost">$${cost}</div>
      </div>`;
    });
    html += '</div>';
  }
  
  document.getElementById('itinerary-title').textContent =
    `🌟 ${days}-Day ${city} ${style.charAt(0).toUpperCase()+style.slice(1)} Journey`;
  document.getElementById('itinerary-content').innerHTML = html;
  
  const activitiesCost = Math.round(total * 0.6);
  const accommodationCost = Math.round(total * 0.28);
  const transportCost = Math.round(total * 0.12);
  
  document.getElementById('total-cost').innerHTML = `
    $${total.toLocaleString()}
    <div class="cost-breakdown">
      <div class="cost-item">
        <span>🎭 Activities</span>
        <strong>$${activitiesCost.toLocaleString()}</strong>
      </div>
      <div class="cost-item">
        <span>🏨 Accommodation</span>
        <strong>$${accommodationCost.toLocaleString()}</strong>
      </div>
      <div class="cost-item">
        <span>🚗 Transport</span>
        <strong>$${transportCost.toLocaleString()}</strong>
      </div>
    </div>`;
  
  const result = document.getElementById('itinerary-result');
  result.style.display = 'block';
  result.scrollIntoView({ behavior:'smooth', block:'start' });
  if (window.AOS) AOS.refresh();
  
  showToast(`✨ Your ${days}-day itinerary has been generated!`, 'success');
}

const activityDB = {
  luxury:[
    {name:'Fine Dining Experience',desc:'Michelin-starred restaurant with stunning views',cost:150},
    {name:'Private City Tour',desc:'Personalised guided tour with expert local knowledge',cost:200},
    {name:'Spa & Wellness Day',desc:'Full-day spa treatment and relaxation package',cost:250},
    {name:'Exclusive Museum Access',desc:'Private after-hours museum tour with curator',cost:180},
    {name:'Helicopter Sightseeing',desc:'Aerial tour of the city and surroundings',cost:350},
    {name:'Private Chef Dinner',desc:'In-suite private chef experience',cost:300}
  ],
  budget:[
    {name:'Street Food Tour',desc:'Explore local cuisine at authentic food stalls',cost:30},
    {name:'Free Walking Tour',desc:'Community-led walking tour of highlights',cost:0},
    {name:'Public Park Picnic',desc:'Relax in beautiful city parks with local produce',cost:15},
    {name:'Local Market Exploration',desc:'Browse and shop at artisan local markets',cost:20},
    {name:'Free Museum Day',desc:'Many world-class museums offer free entry days',cost:0},
    {name:'Sunset Viewpoint',desc:'Best free panoramic viewpoints in the city',cost:5}
  ],
  adventure:[
    {name:'Mountain Hiking',desc:'Challenging trail with panoramic summit views',cost:50},
    {name:'Water Sports',desc:'Kayaking, surfing, or stand-up paddleboarding',cost:75},
    {name:'Rock Climbing',desc:'Indoor or outdoor climbing with expert guide',cost:60},
    {name:'Bike Tour',desc:'Explore the city on two wheels — electric available',cost:40},
    {name:'Zip-Lining',desc:'Adrenaline-pumping zip-line through canopy or canyon',cost:85},
    {name:'Whitewater Rafting',desc:'Class III–IV rapids with safety equipment included',cost:95}
  ],
  cultural:[
    {name:'Museum Visit',desc:'World-class art and history collections',cost:25},
    {name:'Historical Walking Tour',desc:'Explore ancient sites and architectural landmarks',cost:45},
    {name:'Local Cooking Class',desc:'Learn to cook traditional regional dishes',cost:80},
    {name:'Traditional Performance',desc:'Attend local music, theatre or dance show',cost:55},
    {name:'Art Gallery Hop',desc:'Visit three leading contemporary galleries',cost:20},
    {name:'Heritage Site Tour',desc:'UNESCO or national heritage guided visit',cost:40}
  ],
  relaxation:[
    {name:'Beach Day',desc:'Unwind at pristine white sand beaches',cost:20},
    {name:'Morning Yoga Class',desc:'Sunrise yoga session with ocean views',cost:35},
    {name:'Sunset Cruise',desc:'Relaxing evening boat tour with drinks',cost:90},
    {name:'Café Hopping',desc:'Explore the city\'s most charming local cafés',cost:40},
    {name:'Spa Half-Day',desc:'Massage, sauna and relaxation suite',cost:120},
    {name:'Botanical Garden Visit',desc:'Peaceful stroll through world-class gardens',cost:15}
  ]
};

function generateItinerary(city, days, style, budget) {
  // Deprecated - use generateItineraryFromAPI instead
  console.warn('[DEPRECATED] Direct call to generateItinerary - use API');
}

/* ─────────────────────────────────────────────────────────
   13. SAVE / VIEW / DELETE TRIPS
───────────────────────────────────────────────────────── */
function saveTrip() {
  const title   = document.getElementById('itinerary-title').textContent;
  const content = document.getElementById('itinerary-content').innerHTML;
  const cost    = document.getElementById('total-cost').textContent.trim().split('\n')[0];
  const trips   = JSON.parse(localStorage.getItem('wl_trips')||'[]');
  trips.push({ id:Date.now(), title, content, cost, date:new Date().toLocaleDateString(), style:document.getElementById('travel-style').value, days:document.getElementById('itinerary-days').value });
  localStorage.setItem('wl_trips', JSON.stringify(trips));
  showToast('Trip saved successfully! 🎉');
  loadSavedTrips();
}

function loadSavedTrips() {
  const trips = JSON.parse(localStorage.getItem('wl_trips')||'[]');
  const grid  = document.getElementById('saved-trips-grid');
  if (!grid) return;
  if (!trips.length) {
    grid.innerHTML = `<div class="no-trips"><span class="no-trips-icon">✈️</span><h3>No Saved Trips Yet</h3><p>Generate and save your first itinerary to see it here!</p></div>`;
    return;
  }
  grid.innerHTML = trips.map(t => `
    <div class="trip-card">
      <div class="trip-card-header">
        <h4>${t.title}</h4>
        <small>Saved ${t.date}</small>
      </div>
      <div class="trip-card-body">
        <div class="trip-meta"><span>📅 ${t.days} Days</span><span>💰 ${t.cost}</span></div>
        <div class="trip-actions">
          <button class="trip-btn" onclick="viewTrip(${t.id})">👁 View</button>
          <button class="trip-btn" onclick="deleteTrip(${t.id})">🗑 Delete</button>
        </div>
      </div>
    </div>`).join('');
}

function viewTrip(id) {
  const t = JSON.parse(localStorage.getItem('wl_trips')||'[]').find(x => x.id===id);
  if (!t) return;
  document.getElementById('itinerary-title').textContent   = t.title;
  document.getElementById('itinerary-content').innerHTML   = t.content;
  document.getElementById('total-cost').innerHTML          = t.cost;
  document.getElementById('itinerary-result').style.display = 'block';
  scrollTo('itinerary-generator');
}

function deleteTrip(id) {
  if (!confirm('Delete this trip?')) return;
  let trips = JSON.parse(localStorage.getItem('wl_trips')||'[]').filter(t => t.id!==id);
  localStorage.setItem('wl_trips', JSON.stringify(trips));
  loadSavedTrips();
  showToast('Trip deleted', 'info');
}

/* ─────────────────────────────────────────────────────────
   14. EXPORT PDF
───────────────────────────────────────────────────────── */
function exportPDF() {
  const title   = document.getElementById('itinerary-title').textContent;
  const content = document.getElementById('itinerary-result').innerHTML;
  const w = window.open('','','height=900,width=900');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>body{font-family:Georgia,serif;padding:40px;max-width:800px;margin:0 auto}
  h3,h4{color:#2d5a35}
  .itinerary-day{background:#f5f5f0;padding:20px;margin:20px 0;border-left:5px solid #2d5a35;border-radius:10px}
  .itinerary-activity{display:flex;gap:15px;margin:12px 0;padding:12px;background:#fff;border-radius:8px}
  .activity-time{font-weight:bold;color:#2d5a35;min-width:75px}
  .activity-cost{margin-left:auto;font-weight:bold;color:#eca72c}
  .itinerary-actions,.itinerary-pricing{display:none}
  @media print{body{padding:20px}.itinerary-day{break-inside:avoid}}</style>
  </head><body>${content}</body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 600);
}

/* ─────────────────────────────────────────────────────────
   15. SHARE ITINERARY
───────────────────────────────────────────────────────── */
function shareItinerary() {
  const title = document.getElementById('itinerary-title').textContent;
  const url   = window.location.href;
  if (navigator.share) {
    navigator.share({ title, text:'Check out my travel itinerary!', url }).catch(() => fallbackShare(title, url));
  } else { fallbackShare(title, url); }
}
function fallbackShare(title, url) {
  navigator.clipboard.writeText(`${title}\n${url}`)
    .then(() => showToast('Link copied to clipboard! 🔗'));
}

/* ─────────────────────────────────────────────────────────
   17. STAR RATINGS & REVIEW
───────────────────────────────────────────────────────── */
let selectedRating = 0;
const stars = document.querySelectorAll('.star');
stars.forEach(s => {
  s.addEventListener('click', function () {
    selectedRating = parseInt(this.dataset.rating);
    const riv = document.getElementById('rating-value');
    if (riv) riv.value = selectedRating;
    stars.forEach((x,i) => { x.classList.toggle('active', i<selectedRating); x.textContent = i<selectedRating ? '★':'☆'; });
  });
  s.addEventListener('mouseenter', function () {
    const r = parseInt(this.dataset.rating);
    stars.forEach((x,i) => { x.textContent = i<r ? '★':'☆'; });
  });
});
document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
  stars.forEach((s,i) => { s.textContent = i<selectedRating ? '★':'☆'; });
});

document.getElementById('review-photos')?.addEventListener('change', function(e) {
  const prev = document.getElementById('photo-preview');
  prev.innerHTML = '';
  Array.from(e.target.files).forEach(f => {
    const r = new FileReader();
    r.onload = ev => { const img=document.createElement('img'); img.src=ev.target.result; prev.appendChild(img); };
    r.readAsDataURL(f);
  });
});

function submitReview(e) {
  e.preventDefault();
  if (!selectedRating) { showToast('Please select a star rating', 'warning'); return; }
  const review = {
    name: document.getElementById('reviewer-name').value,
    dest: document.getElementById('review-destination').value,
    rating: selectedRating,
    text: document.getElementById('review-text').value,
    date: new Date().toLocaleDateString()
  };
  const reviews = JSON.parse(localStorage.getItem('wl_reviews')||'[]');
  reviews.push(review); localStorage.setItem('wl_reviews', JSON.stringify(reviews));
  showToast('Thank you for your review! ⭐');
  e.target.reset(); selectedRating=0;
  stars.forEach(s => { s.classList.remove('active'); s.textContent='☆'; });
  document.getElementById('photo-preview').innerHTML='';
}

/* ─────────────────────────────────────────────────────────
   18. NEWSLETTER
───────────────────────────────────────────────────────── */
function subscribeNewsletter(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  showToast(`🎉 Subscribed! Travel inspiration coming to ${email}`);
  e.target.reset();
}

/* ─────────────────────────────────────────────────────────
   19. GUIDES
───────────────────────────────────────────────────────── */
const guideContent = {
  'National Parks': {
    text:`<p>America's 63 national parks span over 85 million acres of wilderness. From the geysers of Yellowstone to the red rock formations of Arches, each park offers a unique natural experience.</p>
    <h3>Top Tips for Visiting</h3>
    <ul>
      <li>Book the America the Beautiful annual pass ($80) — covers entry to all national parks</li>
      <li>Reserve campsites 6 months in advance for popular parks like Yosemite</li>
      <li>Arrive at sunrise to beat the crowds and enjoy the best light for photography</li>
      <li>Download offline maps — cell coverage is limited in most parks</li>
      <li>Always carry bear spray in bear-country parks like Glacier and Grand Teton</li>
      <li>The best weather for most parks is May–June and September–October</li>
    </ul>
    <h3>Top 5 Must-Visit Parks</h3>
    <p>Yellowstone, Grand Canyon, Yosemite, Zion, and Great Smoky Mountains attract over 50 million visitors combined each year. Yellowstone alone has more geothermal features than anywhere else on Earth.</p>`
  },
  'Budget Travel': {
    text:`<p>Travelling on a budget doesn't mean sacrificing quality experiences. With the right strategies, you can explore America and the world for a fraction of the typical cost.</p>
    <h3>Money-Saving Strategies</h3>
    <ul>
      <li>Book flights 6–8 weeks ahead for domestic, 3–6 months for international</li>
      <li>Use Google Flights' price tracking alerts to catch fare drops</li>
      <li>Travel shoulder season (May, September) for 30–50% lower prices</li>
      <li>Use credit cards with travel rewards — many offer 50,000+ point sign-up bonuses</li>
      <li>Stay in hostels or use Airbnb for longer stays to save on accommodation</li>
      <li>Eat at local markets, food halls, and lunch specials instead of tourist restaurants</li>
    </ul>
    <h3>Free Activities in Major Cities</h3>
    <p>Most major US cities offer dozens of free world-class experiences — from the Smithsonian museums in DC to the High Line in NYC, Central Park, and Golden Gate Park in SF.</p>`
  },
  'Packing Tips': {
    text:`<p>The art of packing well means having everything you need without the burden of heavy bags. Here's how the experts do it.</p>
    <h3>The Golden Rules</h3>
    <ul>
      <li>Use the 1-2-3-4-5-6 rule: 1 hat, 2 pairs of shoes, 3 bottoms, 4 tops, 5 socks, 6 underwear</li>
      <li>Roll clothes instead of folding to save 30% more space and reduce wrinkles</li>
      <li>Use packing cubes to organise and compress clothing efficiently</li>
      <li>Wear your bulkiest items (boots, jacket) on travel days</li>
      <li>Pack a universal power adapter and a portable charger (10,000mAh+)</li>
      <li>Always keep medications, passport, and one change of clothes in your carry-on</li>
    </ul>
    <h3>Essential Tech for Travellers</h3>
    <p>A good noise-cancelling headset, a compact travel router, and an e-reader can transform long journeys. Don't forget to download offline maps, translation apps, and your airline apps before departure.</p>`
  },
  'Road Trips': {
    text:`<p>America was built for road trips. With 4 million miles of roads crossing every landscape imaginable, the journey often becomes the destination.</p>
    <h3>Top Road Trip Routes</h3>
    <ul>
      <li><strong>Route 66</strong> — 2,400 miles from Chicago to Santa Monica; the classic American road trip</li>
      <li><strong>Pacific Coast Highway (CA-1)</strong> — 650 miles of dramatic coastal scenery from LA to San Francisco</li>
      <li><strong>Blue Ridge Parkway</strong> — 469 miles through the Appalachian Highlands</li>
      <li><strong>Overseas Highway (US-1, Florida)</strong> — 113 miles across 42 bridges over the Florida Keys</li>
      <li><strong>Going-to-the-Sun Road (Montana)</strong> — 50-mile alpine road through Glacier National Park</li>
    </ul>
    <h3>Road Trip Essentials</h3>
    <p>Always carry a physical map as backup, a first-aid kit, jumper cables, and a tyre repair kit. Download road trip playlists and podcasts in advance — rural areas often have no streaming coverage.</p>`
  }
};

function openGuide(name) {
  const g = guideContent[name];
  if (!g) return;
  // Reuse a simple alert-style modal
  const existing = document.getElementById('guideModal');
  if (existing) existing.remove();
  const m = document.createElement('div');
  m.id = 'guideModal';
  m.className = 'modal-overlay';
  m.innerHTML = `
    <div class="modal-box medium">
      <div class="modal-head">
        <h2>${name}</h2>
        <button class="modal-close" onclick="closeModal('guideModal')">X</button>
      </div>
      <div class="modal-body-scroll guide-article">${g.text}</div>
    </div>`;
  document.body.appendChild(m);
  openModal('guideModal');
}

/* ─────────────────────────────────────────────────────────
   20. FEATURE 1: PACKING LIST
───────────────────────────────────────────────────────── */
const packingDB = {
  beach:{
    'Clothing':['Swimsuit / Bikini','Light T-shirts (×4)','Shorts (×3)','Beach cover-up','Light rain jacket','Sandals','Comfortable walking shoes'],
    'Essentials':['Sunscreen SPF 50+','Sunglasses','Wide-brim hat','Beach towel','Insect repellent','Antihistamine'],
    'Tech & Extras':['Waterproof phone case','Portable charger','Camera','Dry bag','Book / e-reader','Bluetooth speaker']
  },
  mountain:{
    'Clothing':['Insulated jacket','Thermal base layers (×2)','Hiking trousers (×2)','Gloves','Beanie','Hiking boots','Merino wool socks (×4)'],
    'Gear':['Daypack (20–30L)','Trail map / compass','Headlamp + extra batteries','Trekking poles','Emergency whistle','Multi-tool'],
    'Safety':['First-aid kit','Emergency blanket','High-altitude sunscreen','Water purification tablets','Bear spray (if required)','Offline maps downloaded']
  },
  city:{
    'Clothing':['Smart casual outfits (×3)','Casual T-shirts (×3)','Versatile jeans (×2)','Light jacket / blazer','Comfortable walking shoes','Dress shoes'],
    'Essentials':['Daypack / tote bag','Travel wallet','TSA-approved luggage lock','Compact umbrella','Pain relievers','City guidebook'],
    'Tech':['Universal power adapter','Portable charger','Laptop + charger','Noise-cancelling headphones','Local SIM card']
  },
  winter:{
    'Clothing':['Heavy-duty winter coat','Thermal scarf','Insulated gloves','Snow boots','Thermal leggings','Wool socks (×5)','Fur-lined hat'],
    'Gear':['Anti-glare snow goggles','Vitamin D supplements','Heavy moisturiser','Lip balm SPF','Pocket hand warmers','Waterproof umbrella'],
    'Safety':['Emergency contact list','Travel insurance documents','Cold & flu medication','Extra phone battery (cold drains fast)']
  },
  business:{
    'Clothing':['Dress shirts (×3)','Business suit (×2)','Ties (×2)','Polished dress shoes','Overcoat','Formal underwear (×5)'],
    'Work Essentials':['Professional laptop bag','Laptop + charger','Portable Wi-Fi hotspot','Notebook & pens','Business cards','Document organiser'],
    'Personal':['Grooming kit','Antacids / vitamins','Travel-size toiletries','Sleep mask + ear plugs (for early flights)']
  }
};

async function generatePackingList() {
  const days = parseInt(document.getElementById('packingDays').value);
  const destination = document.getElementById('packingDestination')?.value.trim();
  
  // Require destination input
  if (!destination) {
    document.getElementById('packingListOutput').innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);"><p>📍 Please enter a destination to generate your packing list</p></div>';
    return;
  }
  
  try {
    document.getElementById('packingListOutput').innerHTML = '<div style="text-align:center;padding:20px;"><p>🔄 Generating AI-powered packing list for ' + destination + '...</p></div>';
    
    const response = await fetch(`${API_BASE}/api/packing/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        destination: destination,
        days: days,
        travelers: 'solo'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    renderPackingFromAPI(data);
    
  } catch (err) {
    console.error('[PACKING] API call failed:', err.message);
    // Show error message instead of fallback
    document.getElementById('packingListOutput').innerHTML = '<div style="background:#f8d7da;border:1px solid #f5c6cb;padding:15px;border-radius:8px;color:#721c24;"><strong>⚠️ Error:</strong> Could not generate packing list. Please check your API key and try again.</div>';
  }
}

function renderPackingFromAPI(data) {
  let html = '';
  
  // Add destination header
  if (data.destination) {
    html += `<div style="background:linear-gradient(135deg, rgba(45, 90, 53, 0.06) 0%, rgba(236, 167, 44, 0.06) 100%);padding:16px;border-radius:12px;margin-bottom:20px;border-left:5px solid var(--spicy-paprika);">
      <h3 style="margin:0;color:var(--spicy-paprika);font-size:1.3rem;font-family:var(--font-display);">📦 Packing List for ${data.destination}</h3>
      <small style="color:var(--text-muted);">AI-personalized for your trip</small>
    </div>`;
  }
  
  // Add warning if present
  if (data.weatherWarning) {
    html += `<div style="background:#fff3cd;border:1px solid #ffc107;padding:14px;border-radius:8px;margin-bottom:18px;color:#856404;border-left:4px solid #ffc107;">
      <strong>⚠️ Important Note:</strong> ${data.weatherWarning}
    </div>`;
  }
  
  // Render categories
  if (data.categories && Array.isArray(data.categories)) {
    data.categories.forEach(cat => {
      html += `<div class="packing-category">
        <h4>${cat.icon} ${cat.name}</h4>`;
      
      if (cat.items && Array.isArray(cat.items)) {
        cat.items.forEach((item, i) => {
          const essential = item.essential ? '⭐ ' : '';
          const quantityText = item.quantity > 1 ? ` (×${item.quantity})` : '';
          html += `<div class="packing-item">
            <input type="checkbox" id="pk${cat.name}${i}" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none'">
            <label for="pk${cat.name}${i}">
              <span style="font-weight:500;">${essential}${item.name}${quantityText}</span>
              <span>${item.reason}</span>
            </label>
          </div>`;
        });
      }
      html += '</div>';
    });
  }
  
  // Add tips section
  if (data.tips && Array.isArray(data.tips)) {
    html += `<div style="background:linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);padding:18px;border-radius:12px;margin-top:22px;border-left:4px solid #4caf50;">
      <h4 style="color:#2e7d32;margin-top:0;margin-bottom:12px;font-family:var(--font-display);">💡 Pro Packing Tips</h4>
      <ul style="margin:0;padding-left:24px;color:#33691e;gap:8px;">`;
    data.tips.forEach(tip => {
      html += `<li style="margin-bottom:10px;line-height:1.5;">${tip}</li>`;
    });
    html += `</ul>
    </div>`;
  }
  
  // Add total items count
  if (data.totalItems) {
    html += `<div style="text-align:center;color:var(--text-muted);font-size:0.9em;margin-top:18px;padding-top:18px;border-top:1px solid var(--border);">
      <small>📋 Total items: <strong>${data.totalItems}</strong> | ✨ Generated by Groq AI</small>
    </div>`;
  }
  
  document.getElementById('packingListOutput').innerHTML = html;
}

function printPackingList() {
  const content = document.getElementById('packingListOutput').innerHTML;
  const w = window.open('','','height=700,width=600');
  w.document.write(`<html><head><title>Packing List</title>
  <style>body{font-family:Arial,sans-serif;padding:30px}h4{color:#2d5a35;margin-bottom:8px;margin-top:20px}
  .packing-item{padding:6px 0;border-bottom:1px solid #eee;display:flex;align-items:center;gap:10px}
  input{width:16px;height:16px}</style>
  </head><body><h2>🎒 My Packing List</h2>${content}</body></html>`);
  w.document.close(); w.print();
}

function copyPackingList() {
  const items = [...document.querySelectorAll('.packing-item label')].map(l => '☐ ' + l.textContent).join('\n');
  navigator.clipboard.writeText(items).then(() => showToast('Packing list copied! 📋'));
}

/* ─────────────────────────────────────────────────────────
   21. FEATURE 2: CURRENCY CONVERTER
───────────────────────────────────────────────────────── */
// Fallback rates (will be updated with live rates from API)

// Load live exchange rates from Flask backend
async function loadLiveRates() {
  try {
    console.log('[CURRENCY] Fetching from:', `${API_BASE}/api/currency?base=USD`);
    const res = await fetch(`${API_BASE}/api/currency?base=USD`);
    
    if (!res.ok) {
      console.error('[CURRENCY] HTTP error:', res.status);
      convertCurrency();
      return;
    }
    
    const data = await res.json();
    console.log('[CURRENCY] Raw response:', data);
    
    // Accept rates whether cached or live
    // Only reject if rates object is missing entirely
    if (data.rates && Object.keys(data.rates).length > 0) {
      fxRates = data.rates;
      console.log('[CURRENCY] Rates loaded successfully:', fxRates);
    } else {
      console.warn('[CURRENCY] No rates in response, using fallback');
    }
    
    // Always call these regardless of where rates came from
    convertCurrency();
    
  } catch (err) {
    console.error('[CURRENCY] Fetch failed:', err.message);
    // Still call convertCurrency so UI shows something
    convertCurrency();
  }
}

function convertCurrency() {
  const amt   = parseFloat(document.getElementById('convAmount')?.value) || 0;
  const from  = document.getElementById('convFrom')?.value;
  const to    = document.getElementById('convTo')?.value;
  if (!from || !to) return;
  
  const result = (amt / (fxRates[from] || 1)) * (fxRates[to] || 1);
  const resEl  = document.getElementById('convResult');
  if (resEl) resEl.value = result.toFixed(2);
  
  const rateEl = document.getElementById('convRate');
  if (rateEl) rateEl.textContent = 
    `1 ${from} = ${((fxRates[to] || 1) / (fxRates[from] || 1)).toFixed(4)} ${to}`;
  
  const allEl = document.getElementById('convAllRates');
  if (allEl) {
    allEl.innerHTML = Object.keys(fxRates)
      .filter(c => c !== from)
      .map(c => `
        <div class="rate-row">
          <span>1 ${from} → ${c}</span>
          <span>${((fxRates[c] || 1) / (fxRates[from] || 1)).toFixed(4)}</span>
        </div>`).join('');
  }
}

function swapCurrencies() {
  const f = document.getElementById('convFrom');
  const t = document.getElementById('convTo');
  [f.value, t.value] = [t.value, f.value];
  convertCurrency();
}

/* ─────────────────────────────────────────────────────────
   22. FEATURE 3: BUDGET TRACKER
───────────────────────────────────────────────────────── */
let budgetEntries = JSON.parse(localStorage.getItem('wl_budget') || '[]');

function initBudget() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('budgetExpenseDate');
  if (dateInput) dateInput.value = today;
  renderBudget();
}

function addBudgetEntry() {
  const tripName = document.getElementById('budgetTripName')?.value?.trim();
  const totalBudget = parseFloat(document.getElementById('totalBudget')?.value) || 0;
  const expenseName = document.getElementById('budgetExpenseName')?.value?.trim();
  const expenseAmount = parseFloat(document.getElementById('budgetExpenseAmount')?.value) || 0;
  const category = document.getElementById('budgetExpenseCategory')?.value || 'other';
  const date = document.getElementById('budgetExpenseDate')?.value || new Date().toISOString().split('T')[0];

  // Validation
  if (!tripName) {
    showToast('Please enter a trip name', 'error');
    document.getElementById('budgetTripName')?.focus();
    return;
  }
  if (totalBudget <= 0) {
    showToast('Please enter a valid total budget', 'error');
    document.getElementById('totalBudget')?.focus();
    return;
  }
  if (!expenseName) {
    showToast('Please enter expense description', 'error');
    document.getElementById('budgetExpenseName')?.focus();
    return;
  }
  if (expenseAmount <= 0) {
    showToast('Please enter a valid amount', 'error');
    document.getElementById('budgetExpenseAmount')?.focus();
    return;
  }

  budgetEntries.push({
    id: Date.now(),
    trip: tripName,
    name: expenseName,
    amount: expenseAmount,
    category: category,
    date: date
  });

  localStorage.setItem('wl_budget', JSON.stringify(budgetEntries));
  
  // Clear inputs
  document.getElementById('budgetExpenseName').value = '';
  document.getElementById('budgetExpenseAmount').value = '';
  document.getElementById('budgetExpenseCategory').value = 'other';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('budgetExpenseDate').value = today;
  
  renderBudget();
  showToast(`Expense "$${expenseAmount.toFixed(2)}" added successfully!`, 'success');
}

function renderBudget() {
  const total = parseFloat(document.getElementById('totalBudget')?.value) || 0;
  const spent = budgetEntries.reduce((s, e) => s + e.amount, 0);
  const remaining = Math.max(total - spent, 0);
  const pct = total ? Math.min((spent / total) * 100, 100) : 0;
  
  // Color coding based on budget usage
  let color, status;
  if (pct >= 100) {
    color = '#e74c3c';
    status = '⚠️ Over Budget!';
  } else if (pct >= 90) {
    color = '#e67e22';
    status = '⚠️ Warning - Near limit';
  } else if (pct >= 70) {
    color = '#f39c12';
    status = '✓ On track';
  } else {
    color = '#27ae60';
    status = '✓ Plenty remaining';
  }

  // Render summary
  const sumEl = document.getElementById('budgetSummary');
  if (sumEl && (total || spent)) {
    sumEl.innerHTML = `
      <div class="budget-cards">
        <div class="budget-card">
          <span class="budget-card-label">Total Budget</span>
          <span class="budget-card-value">$${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="budget-card">
          <span class="budget-card-label">Spent</span>
          <span class="budget-card-value" style="color: ${color};">$${spent.toFixed(2)}</span>
        </div>
        <div class="budget-card">
          <span class="budget-card-label">Remaining</span>
          <span class="budget-card-value" style="color: ${remaining > 0 ? '#27ae60' : '#e74c3c'};">$${remaining.toFixed(2)}</span>
        </div>
      </div>
      <div class="budget-progress">
        <div class="budget-bar">
          <div class="budget-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="budget-bar-info">
          <span>${pct.toFixed(1)}% of budget used</span>
          <span style="color:${color};font-weight:700">${status}</span>
        </div>
      </div>`;
  }

  // Render category breakdown
  const categoryBreakdown = {};
  budgetEntries.forEach(e => {
    if (!categoryBreakdown[e.category]) {
      categoryBreakdown[e.category] = 0;
    }
    categoryBreakdown[e.category] += e.amount;
  });

  // Render expense list
  const list = document.getElementById('budgetCategories');
  if (list) {
    if (budgetEntries.length === 0) {
      list.innerHTML = '<p class="empty-state">No expenses yet — add your first one!</p>';
    } else {
      const sorted = [...budgetEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = sorted.map(e => {
        const categoryEmoji = {
          flight: '✈️',
          hotel: '🏨',
          food: '🍽️',
          transport: '🚗',
          activity: '🎭',
          shopping: '🛍️',
          other: '📌'
        }[e.category] || '📌';
        return `
          <div class="budget-entry">
            <div class="budget-entry-col">
              <span class="budget-entry-category">${categoryEmoji}</span>
              <div class="budget-entry-details">
                <span class="budget-entry-name">${e.name}</span>
                <small class="budget-entry-date">${new Date(e.date).toLocaleDateString()}</small>
              </div>
            </div>
            <div class="budget-entry-col">
              <span class="budget-entry-amount">$${e.amount.toFixed(2)}</span>
              <button class="budget-entry-del" onclick="deleteBudgetEntry(${e.id})" title="Delete">✕</button>
            </div>
          </div>`;
      }).join('');
    }
  }
}

function deleteBudgetEntry(id) {
  budgetEntries = budgetEntries.filter(e => e.id !== id);
  localStorage.setItem('wl_budget', JSON.stringify(budgetEntries));
  renderBudget();
  showToast('Expense deleted', 'info');
}

/* ─────────────────────────────────────────────────────────
   23. FEATURE 4: WEATHER
───────────────────────────────────────────────────────── */
// Simulated weather data (in production, connect to OpenWeatherMap API)
const weatherDB = {
  'new york':   {temp:18,feel:15,humidity:65,wind:14,condition:'Partly Cloudy',icon:'⛅',forecast:[{d:'Mon',i:'🌤️',t:'19°'},{d:'Tue',i:'🌧️',t:'14°'},{d:'Wed',i:'⛅',t:'17°'},{d:'Thu',i:'☀️',t:'22°'},{d:'Fri',i:'🌤️',t:'20°'}]},
  'paris':      {temp:15,feel:12,humidity:72,wind:18,condition:'Light Rain',icon:'🌦️',forecast:[{d:'Mon',i:'🌦️',t:'15°'},{d:'Tue',i:'⛅',t:'17°'},{d:'Wed',i:'☀️',t:'21°'},{d:'Thu',i:'☀️',t:'23°'},{d:'Fri',i:'⛅',t:'19°'}]},
  'tokyo':      {temp:22,feel:20,humidity:70,wind:10,condition:'Sunny',icon:'☀️',forecast:[{d:'Mon',i:'☀️',t:'22°'},{d:'Tue',i:'⛅',t:'20°'},{d:'Wed',i:'🌧️',t:'17°'},{d:'Thu',i:'⛅',t:'19°'},{d:'Fri',i:'☀️',t:'24°'}]},
  'sydney':     {temp:26,feel:24,humidity:60,wind:22,condition:'Clear Skies',icon:'☀️',forecast:[{d:'Mon',i:'☀️',t:'26°'},{d:'Tue',i:'☀️',t:'28°'},{d:'Wed',i:'⛅',t:'24°'},{d:'Thu',i:'🌦️',t:'21°'},{d:'Fri',i:'☀️',t:'27°'}]},
  'dubai':      {temp:35,feel:38,humidity:45,wind:12,condition:'Hot & Sunny',icon:'🌞',forecast:[{d:'Mon',i:'🌞',t:'35°'},{d:'Tue',i:'🌞',t:'36°'},{d:'Wed',i:'🌞',t:'34°'},{d:'Thu',i:'⛅',t:'32°'},{d:'Fri',i:'🌞',t:'35°'}]},
  'london':     {temp:12,feel:9,humidity:80,wind:25,condition:'Overcast',icon:'☁️',forecast:[{d:'Mon',i:'☁️',t:'12°'},{d:'Tue',i:'🌧️',t:'10°'},{d:'Wed',i:'⛅',t:'14°'},{d:'Thu',i:'🌤️',t:'16°'},{d:'Fri',i:'⛅',t:'13°'}]},
  'miami':      {temp:29,feel:31,humidity:78,wind:15,condition:'Sunny & Humid',icon:'🌤️',forecast:[{d:'Mon',i:'🌤️',t:'29°'},{d:'Tue',i:'🌩️',t:'26°'},{d:'Wed',i:'🌦️',t:'27°'},{d:'Thu',i:'☀️',t:'30°'},{d:'Fri',i:'☀️',t:'31°'}]},
  'san francisco':{temp:14,feel:11,humidity:75,wind:20,condition:'Foggy',icon:'🌫️',forecast:[{d:'Mon',i:'🌫️',t:'14°'},{d:'Tue',i:'⛅',t:'16°'},{d:'Wed',i:'☀️',t:'19°'},{d:'Thu',i:'🌤️',t:'17°'},{d:'Fri',i:'⛅',t:'15°'}]},
  'las vegas':  {temp:32,feel:34,humidity:20,wind:8,condition:'Sunny',icon:'☀️',forecast:[{d:'Mon',i:'☀️',t:'32°'},{d:'Tue',i:'☀️',t:'34°'},{d:'Wed',i:'🌤️',t:'30°'},{d:'Thu',i:'☀️',t:'33°'},{d:'Fri',i:'☀️',t:'35°'}]},
};

async function fetchWeather() {
  const city = document.getElementById('weatherCity')?.value?.trim();
  if (!city) { showToast('Enter a city name', 'warning'); return; }
  
  const out = document.getElementById('weatherOutput');
  out.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6">🔍 Fetching weather for ' + city + '...</p>';
  
  try {
    const res = await fetch(`${API_BASE}/api/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    
    if (data.error) {
      out.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--text-muted)">
          <p>⚠️ ${data.error}</p>
          <p style="font-size:.85rem;margin-top:.5rem">
            Try: New York, London, Tokyo, Sydney, Dubai
          </p>
        </div>`;
      return;
    }

    const dispCity = city.replace(/\b\w/g, l => l.toUpperCase());
    out.innerHTML = `
      <div class="weather-card">
        <p style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.3rem">${dispCity}</p>
        <div class="weather-temp">${data.temp}°C</div>
        <p class="weather-desc">${data.condition} · Feels like ${data.feels}°C</p>
        <div class="weather-details">
          <div class="weather-detail">
            <span>Humidity</span>
            <span>${data.humidity}%</span>
          </div>
          <div class="weather-detail">
            <span>Wind</span>
            <span>${data.wind} km/h</span>
          </div>
          <div class="weather-detail">
            <span>Feels Like</span>
            <span>${data.feels}°C</span>
          </div>
        </div>
        <div class="weather-forecast">
          ${data.forecast.map(f => `
            <div class="forecast-day">
              <span class="f-day">${f.d}</span>
              <span class="f-icon">${f.i}</span>
              <span class="f-temp">${f.t}</span>
            </div>`).join('')}
        </div>
      </div>`;

  } catch (err) {
    console.error('[WEATHER]', err);
    out.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text-muted)">
        <p>⚠️ Could not connect to weather service.</p>
        <p style="font-size:.85rem;margin-top:.5rem">
          Make sure Flask server is running on port 3001.
        </p>
      </div>`;
  }
}
function quickWeather(city) {
  document.getElementById('weatherCity').value = city;
  fetchWeather();
}
function loadWeatherModal() {
  setTimeout(() => {
    document.getElementById('weatherCity').value = 'New York';
    fetchWeather();
  }, 100);
}

/* ─────────────────────────────────────────────────────────
   24. FEATURE 5: FLIGHT SEARCH
───────────────────────────────────────────────────────── */
let tripType = 'one';
function setTripType(t) {
  tripType = t;
  document.getElementById('ttOne').classList.toggle('active', t==='one');
  document.getElementById('ttRound').classList.toggle('active', t==='round');
  document.getElementById('returnGroup').style.opacity = t==='round' ? '1':'0.4';
}

function setFlightDates() {
  const t = new Date(); t.setDate(t.getDate()+14);
  const r = new Date(); r.setDate(r.getDate()+21);
  const fmt = d => d.toISOString().split('T')[0];
  setTimeout(() => {
    const fd = document.getElementById('flightDepart');
    const fr = document.getElementById('flightReturn');
    if (fd) fd.value = fmt(t);
    if (fr) fr.value = fmt(r);
  }, 100);
}

const airlines = ['Delta Airlines','American Airlines','United Airlines','Southwest','JetBlue Airways','Alaska Airlines','Spirit Airlines','Frontier Airlines'];
const routes   = {
  'New York (JFK)→Los Angeles (LAX)':   {base:189, dur:'5h 30m'},
  'Los Angeles (LAX)→New York (JFK)':   {base:199, dur:'5h 15m'},
  'New York (JFK)→Miami (MIA)':         {base:129, dur:'3h 10m'},
  'Chicago (ORD)→Las Vegas (LAS)':      {base:109, dur:'3h 45m'},
  'New York (JFK)→London (LHR)':        {base:389, dur:'7h 10m'},
  'Los Angeles (LAX)→Tokyo (NRT)':      {base:699, dur:'11h 30m'},
};

function searchFlights() {
  const from = document.getElementById('flightFrom').value;
  const to   = document.getElementById('flightTo').value;
  const cls  = document.getElementById('flightClass').value;
  const mlt  = {Economy:1,  'Premium Economy':1.6, Business:3.2, 'First Class':5.5}[cls]||1;
  const res  = document.getElementById('flightResults');
  res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">🔍 Searching flights…</p>';
  setTimeout(() => {
    const key = `${from}→${to}`;
    const base = routes[key]?.base || (150 + Math.random()*300|0);
    const dur  = routes[key]?.dur || `${4+Math.floor(Math.random()*8)}h ${Math.floor(Math.random()*59)}m`;
    const results = Array.from({length:5}, (_,i) => ({
      airline: airlines[Math.floor(Math.random()*airlines.length)],
      depart:  `${6+i*2}:${['00','15','30','45'][i%4]} AM`,
      arrive:  `${(6+i*2+parseInt(dur))%24}:${['30','45','00','15'][i%4]} PM`,
      price:   Math.round(base * mlt * (0.88 + Math.random()*.35)),
      stops:   i<2?'Non-stop':i<4?'1 stop':'2 stops',
      dur
    })).sort((a,b) => a.price-b.price);
    res.innerHTML = results.map(f => `
      <div class="flight-card">
        <div>
          <div class="flight-airline">✈️ ${f.airline}</div>
          <div class="flight-route">${from.split('(')[0].trim()} → ${to.split('(')[0].trim()}</div>
          <div class="flight-time">${f.depart} → ${f.arrive} · ${f.stops}</div>
        </div>
        <div class="flight-duration">⏱ ${f.dur}</div>
        <div>
          <div class="flight-price">$${f.price}</div>
          <button class="book-flight-btn" onclick="bookFlight('${f.airline}','${f.price}')">Book →</button>
        </div>
      </div>`).join('');
  }, 1200);
}

function bookFlight(airline, price) {
  showToast(`✈️ Redirecting to ${airline} booking for $${price}…`, 'info');
  setTimeout(() => window.open('https://www.google.com/flights','_blank'), 1000);
}

/* ─────────────────────────────────────────────────────────
   24B. LIVE FLIGHT TRACKER (NEW)
───────────────────────────────────────────────────────── */
function openFlightTracker() {
  openModal('flightTrackerModal');
}

function quickTrack(flightNum) {
  document.getElementById('flightNumberInput').value = flightNum;
  trackFlight();
}

async function trackFlight() {
  const flight = document.getElementById('flightNumberInput')
    ?.value?.trim().toUpperCase().replace(/\s/g, '');
  
  if (!flight) { 
    showToast('Please enter a flight number', 'warning'); 
    return; 
  }

  const out = document.getElementById('flightTrackerOutput');
  out.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6">🔍 Tracking flight ' + flight + '...</p>';

  try {
    const res  = await fetch(`${API_BASE}/api/flights/status?flight=${flight}`);
    const data = await res.json();

    if (data.error) {
      out.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--text-muted)">
          <p>✈️ Flight ${flight} not found</p>
          <p style="font-size:.85rem;margin-top:.5rem">Try: AA100, DL1, UA1, BA112</p>
        </div>`;
      return;
    }

    out.innerHTML = `
      <div style="padding:1.5rem 0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
          <div>
            <h3 style="font-size:1.5rem;margin-bottom:.25rem">${data.flightNumber}</h3>
            <p style="font-size:.9rem;color:var(--text-secondary)">${data.airline}</p>
          </div>
          <div style="background:${data.statusColor};color:#fff;padding:.5rem 1.25rem;border-radius:50px;font-weight:700;font-size:.85rem">
            ${data.statusLabel}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:center;background:var(--bg-sand);padding:1.5rem;border-radius:12px;margin-bottom:1.5rem">
          <div style="text-align:left">
            <div style="font-size:2rem;font-weight:700;color:var(--spicy-paprika)">${data.from.iata}</div>
            <div style="font-size:.85rem;color:var(--text-secondary)">${data.from.city}</div>
            <div style="font-size:.8rem;color:var(--text-muted);margin-top:.25rem">${data.from.terminal || ''} ${data.from.gate ? '· Gate ' + data.from.gate : ''}</div>
            <div style="font-size:.9rem;font-weight:600;margin-top:.5rem">
              ${data.from.actual || data.from.scheduled}
              ${data.from.delay > 0 ? '<span style="color:#e74c3c;font-size:.75rem"> +' + data.from.delay + 'm delay</span>' : ''}
            </div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.5rem">✈️</div>
            <div style="font-size:.75rem;color:var(--text-muted);margin-top:.25rem">${data.duration || ''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:2rem;font-weight:700;color:var(--spicy-paprika)">${data.to.iata}</div>
            <div style="font-size:.85rem;color:var(--text-secondary)">${data.to.city}</div>
            <div style="font-size:.8rem;color:var(--text-muted);margin-top:.25rem">${data.to.terminal || ''} ${data.to.gate ? '· Gate ' + data.to.gate : ''}</div>
            <div style="font-size:.9rem;font-weight:600;margin-top:.5rem">
              ${data.to.estimated || data.to.scheduled}
            </div>
          </div>
        </div>

        <div style="margin-bottom:1.5rem">
          <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-muted);margin-bottom:.4rem">
            <span>${data.from.iata}</span>
            <span>${data.progress || 0}% complete</span>
            <span>${data.to.iata}</span>
          </div>
          <div style="height:8px;background:var(--border);border-radius:50px;overflow:hidden">
            <div style="height:100%;width:${data.progress || 0}%;background:var(--spicy-paprika);border-radius:50px;transition:width 1s ease"></div>
          </div>
          <div style="text-align:center;margin-top:.5rem;font-size:.8rem;color:var(--text-muted)">
            ✈️ ${data.aircraft || 'Aircraft info unavailable'}
          </div>
        </div>
      </div>`;

  } catch (err) {
    console.error('[TRACKER]', err);
    out.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text-muted)">
        <p>⚠️ Could not track flight ${flight}</p>
        <p style="font-size:.85rem;margin-top:.5rem">Make sure Flask server is running on port 3001</p>
      </div>`;
  }
}

/* ─────────────────────────────────────────────────────────
   25. FEATURE 6: HOTEL SEARCH
───────────────────────────────────────────────────────── */
function setHotelDates() {
  const ci = new Date(); ci.setDate(ci.getDate()+14);
  const co = new Date(); co.setDate(co.getDate()+18);
  const fmt = d => d.toISOString().split('T')[0];
  setTimeout(() => {
    const hci = document.getElementById('hotelCheckin');
    const hco = document.getElementById('hotelCheckout');
    if (hci) hci.value = fmt(ci);
    if (hco) hco.value = fmt(co);
  }, 100);
}

const hotelNames = [
  {n:'The Grand Hyatt',img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop',stars:5,desc:'Iconic luxury in the heart of the city',base:380},
  {n:'Marriott Downtown',img:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop',stars:4,desc:'Modern comfort with stunning city views',base:220},
  {n:'Boutique & Co.',img:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=200&fit=crop',stars:4,desc:'Stylish boutique hotel in a vibrant neighbourhood',base:195},
  {n:'The Westin Premier',img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=200&fit=crop',stars:5,desc:'Award-winning wellness and dining experiences',base:450},
  {n:'Holiday Inn Express',img:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=200&fit=crop',stars:3,desc:'Smart, comfortable rooms — great value for money',base:110},
];

async function searchHotels() {
    const city    = document.getElementById('hotelCity')
        ?.value?.trim();
    const ci      = document.getElementById('hotelCheckin')
        ?.value;
    const co      = document.getElementById('hotelCheckout')
        ?.value;
    const guests  = document.getElementById('hotelGuests')
        ?.value;
    const stars   = document.getElementById('hotelStars')
        ?.value;
    const res     = document.getElementById('hotelResults');

    if (!city) {
        showToast('Please enter a destination', 'warning');
        return;
    }
    if (!ci || !co) {
        showToast(
            'Please select check-in and check-out dates', 
            'warning'
        );
        return;
    }
    if (new Date(co) <= new Date(ci)) {
        showToast(
            'Check-out must be after check-in', 
            'error'
        );
        return;
    }

    const guestCount = guests?.includes('4') ? 4 :
                       guests?.includes('3') ? 3 :
                       guests?.includes('2') ? 2 : 1;

    res.innerHTML = `
        <div style="text-align:center;
            padding:2.5rem 1rem">
            <div style="font-size:2.5rem;
                margin-bottom:.75rem;
                animation:spin 2s linear infinite;
                display:inline-block">
                🔍
            </div>
            <p style="opacity:.7;font-size:.95rem">
                Searching hotels in ${city}...
            </p>
            <p style="opacity:.45;font-size:.82rem;
                margin-top:.4rem">
                This may take a few seconds
            </p>
        </div>`;

    try {
        const url = `${API_BASE}/api/hotels?` +
            `city=${encodeURIComponent(city)}` +
            `&checkin=${ci}` +
            `&checkout=${co}` +
            `&guests=${guestCount}` +
            `&stars=${stars}`;

        const response = await fetch(url);
        const data     = await response.json();

        if (!data.hotels?.length) {
            res.innerHTML = `
                <div style="text-align:center;
                    padding:2rem;
                    color:var(--text-muted)">
                    <p style="font-size:2rem;
                        margin-bottom:.75rem">🏨</p>
                    <p>No hotels found for ${city}</p>
                    <p style="font-size:.82rem;
                        margin-top:.5rem">
                        Try different dates or 
                        remove the star filter
                    </p>
                </div>`;
            return;
        }

        const nights = data.nights || 1;

        // Source badge
        const sourceBadge = data.source === 'live'
            ? '<span style="background:rgba(39,174,96,.1);color:#27ae60;border:1px solid rgba(39,174,96,.3);padding:.3rem .8rem;border-radius:50px;font-size:.75rem;font-weight:700">✅ Live hotel data</span>'
            : '<span style="background:rgba(236,167,44,.1);color:var(--honey-bronze);border:1px solid rgba(236,167,44,.3);padding:.3rem .8rem;border-radius:50px;font-size:.75rem;font-weight:700">📋 Sample data</span>';

        // Warning if fallback
        let warningHtml = '';
        if (data.warning) {
            warningHtml = `
                <div style="background:rgba(236,167,44,.08);
                    border:1px solid rgba(236,167,44,.2);
                    padding:.75rem 1rem;
                    border-radius:8px;
                    font-size:.8rem;
                    color:var(--text-secondary);
                    margin-bottom:1rem">
                    ⚠️ ${data.warning}
                </div>`;
        }

        res.innerHTML = `
            <div style="display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:1rem;
                flex-wrap:wrap;gap:.5rem">
                ${sourceBadge}
                <span style="font-size:.82rem;
                    color:var(--text-muted)">
                    ${data.hotels.length} hotels found 
                    · ${nights} night${nights>1?'s':''}
                </span>
            </div>
            ${warningHtml}
            ${data.hotels.map(h => `
                <div class="hotel-card">
                    <div style="position:relative">
                        <img class="hotel-card-img" 
                            src="${h.image}" 
                            alt="${h.name}"
                            onerror="this.src='https://placehold.co/400x200/44355b/ffffff?text=${encodeURIComponent(h.name)}'">
                        ${h.source === 'live' ? `
                            <span style="position:absolute;
                                top:.6rem;right:.6rem;
                                background:rgba(39,174,96,.9);
                                color:#fff;
                                padding:.25rem .6rem;
                                border-radius:50px;
                                font-size:.7rem;
                                font-weight:700">
                                ✅ Live
                            </span>` : ''}
                    </div>
                    <div class="hotel-card-body">
                        <div class="hotel-stars">
                            ${'★'.repeat(h.stars || 0)}${'☆'.repeat(5-(h.stars||0))}
                            ${h.rating ? `
                                <span style="margin-left:.5rem;
                                    font-size:.82rem;
                                    color:var(--text-muted)">
                                    ${h.rating}/10
                                    ${h.reviews ? 
                                        `(${h.reviews} reviews)` 
                                        : ''}
                                </span>` : ''}
                        </div>
                        <div class="hotel-name">
                            ${h.name}
                        </div>
                        <div class="hotel-location">
                            📍 ${h.location || city} · 
                            ${h.amenities || 'Free WiFi'}
                        </div>
                        <div class="hotel-footer">
                            <div class="hotel-price">
                                ${h.pricePerNight > 0 ? 
                                    `$${h.pricePerNight}
                                    <small>/night</small>
                                    <br>
                                    <small style="font-size:.7rem;
                                        opacity:.6">
                                        Total: $${h.totalPrice || 
                                            h.pricePerNight * nights}
                                        (${nights} night${nights>1?'s':''})
                                    </small>` 
                                    : '<small>Price on request</small>'}
                            </div>
                            <button class="book-hotel-btn"
                                onclick="bookHotel(
                                    '${h.name.replace(/'/g,"\\'")}',
                                    '${h.pricePerNight}')">
                                Book →
                            </button>
                        </div>
                    </div>
                </div>`).join('')}`;

        // Show toast
        if (data.source === 'live') {
            showToast(
                `🏨 Found ${data.hotels.length} real hotels in ${city}!`
            );
        }

    } catch (err) {
        console.error('[HOTELS]', err);
        res.innerHTML = `
            <div style="text-align:center;
                padding:2rem;
                color:var(--text-muted)">
                <p>⚠️ Could not search hotels.</p>
                <p style="font-size:.82rem;margin-top:.5rem">
                    Make sure Flask server is running 
                    on port 3001
                </p>
            </div>`;
    }
}

function bookHotel(name, price) {
  showToast(`🏨 Redirecting to book ${name} from $${price}/night…`, 'info');
  setTimeout(() => window.open('https://www.hotels.com','_blank'), 1000);
}

function setHotelCity(city) {
    const input = document.getElementById('hotelCity');
    if (input) {
        input.value = city;
        input.focus();
    }
}

function setHotelDates() {
    const ci = new Date();
    ci.setDate(ci.getDate() + 14);
    const co = new Date();
    co.setDate(co.getDate() + 18);
    const fmt = d => d.toISOString().split('T')[0];
    setTimeout(() => {
        const hci = document.getElementById('hotelCheckin');
        const hco = document.getElementById('hotelCheckout');
        if (hci) hci.value = fmt(ci);
        if (hco) hco.value = fmt(co);
        // Set min dates
        const today = fmt(new Date());
        if (hci) hci.min = today;
        if (hco) hco.min = today;
    }, 100);
}

/* ─────────────────────────────────────────────────────────
   26. FEATURE 7: DESTINATION QUIZ
───────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────
   26. FEATURE 7: DESTINATION QUIZ (AI-Powered)
───────────────────────────────────────────────────────── */

let quizAnswers = {};
let currentQuestion = 0;

const QUIZ_QUESTIONS = [
  {
    id: 'climate',
    question: 'What climate do you prefer?',
    options: [
      { emoji: '☀️', label: 'Hot & Sunny', value: 'hot and sunny' },
      { emoji: '❄️', label: 'Cool & Crisp', value: 'cool and crisp' },
      { emoji: '🌤️', label: 'Mild & Pleasant', value: 'mild and pleasant' },
      { emoji: '🌧️', label: 'Any Weather', value: 'no preference' }
    ]
  },
  {
    id: 'activity',
    question: 'What is your ideal activity?',
    options: [
      { emoji: '🏖️', label: 'Beach & Water', value: 'beach and water sports' },
      { emoji: '🏔️', label: 'Hiking & Nature', value: 'hiking and nature' },
      { emoji: '🏙️', label: 'City & Culture', value: 'city sightseeing and culture' },
      { emoji: '🎉', label: 'Nightlife & Food', value: 'nightlife and fine dining' }
    ]
  },
  {
    id: 'budget',
    question: 'What is your daily budget?',
    options: [
      { emoji: '💸', label: 'Budget ($50-100)', value: 'budget under $100/day' },
      { emoji: '💰', label: 'Moderate ($100-200)', value: 'moderate $100-200/day' },
      { emoji: '💎', label: 'Luxury ($200-400)', value: 'luxury $200-400/day' },
      { emoji: '🤑', label: 'No Limit', value: 'no budget constraint' }
    ]
  },
  {
    id: 'group',
    question: 'Who are you travelling with?',
    options: [
      { emoji: '🧍', label: 'Solo', value: 'solo traveller' },
      { emoji: '👫', label: 'Couple', value: 'couple' },
      { emoji: '👨‍👩‍👧', label: 'Family', value: 'family with children' },
      { emoji: '👯', label: 'Friends', value: 'group of friends' }
    ]
  },
  {
    id: 'style',
    question: 'What is your travel style?',
    options: [
      { emoji: '🗺️', label: 'Explorer', value: 'adventurous explorer' },
      { emoji: '😌', label: 'Relaxed', value: 'relaxed and slow-paced' },
      { emoji: '📸', label: 'Photographer', value: 'photography and scenic viewing' },
      { emoji: '🍽️', label: 'Foodie', value: 'food and culinary experiences' }
    ]
  }
];

function startQuiz() {
  quizAnswers = {};
  currentQuestion = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  if (currentQuestion >= QUIZ_QUESTIONS.length) {
    submitQuiz();
    return;
  }

  const q = QUIZ_QUESTIONS[currentQuestion];
  const progress = Math.round(
    (currentQuestion / QUIZ_QUESTIONS.length) * 100
  );

  const progressDots = QUIZ_QUESTIONS
    .map((_, i) => `
      <div style="width:${i === currentQuestion ? '24px' : '8px'};
        height:8px;border-radius:4px;background:${
        i < currentQuestion 
          ? '#464655' 
          : i === currentQuestion 
            ? '#94958b' 
            : 'rgba(183,182,193,0.25)'
      };transition:all .3s ease"></div>`)
    .join('');

  container.innerHTML = `
    <div style="padding:1rem 0">
      <div style="display:flex;gap:.4rem;margin-bottom:2rem;align-items:center">
        ${progressDots}
        <span style="font-size:.75rem;color:var(--text-muted);margin-left:.5rem;white-space:nowrap">
          ${currentQuestion + 1} / ${QUIZ_QUESTIONS.length}
        </span>
      </div>

      <h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;
        color:var(--text-primary);text-align:center;margin-bottom:.5rem;line-height:1.3">
        ${q.question}
      </h3>
      <p style="text-align:center;color:var(--text-muted);font-size:.85rem;margin-bottom:1.75rem">
        Choose one option
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        ${q.options.map(opt => `
          <div onclick="selectQuizAnswer('${q.id}', '${opt.value}', this)"
            style="background:var(--bg-card);border:2px solid var(--border);border-radius:16px;
              padding:1.25rem 1rem;text-align:center;cursor:pointer;
              transition:all .25s cubic-bezier(.34,1.56,.64,1)">
            <div style="font-size:2rem;margin-bottom:.5rem">
              ${opt.emoji}
            </div>
            <div style="font-size:.88rem;font-weight:700;color:var(--text-primary)">
              ${opt.label}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function selectQuizAnswer(id, value, el) {
  // Store answer
  quizAnswers[id] = value;
  console.log(`[QUIZ] Answer: ${id} = ${value}`);

  // Visual feedback
  el.style.background = '#464655';
  el.style.borderColor = '#464655';
  el.querySelectorAll('div').forEach(d => {
    d.style.color = '#ffffff';
  });

  // Go to next question after short delay
  setTimeout(() => {
    currentQuestion++;
    renderQuizQuestion();
  }, 400);
}

async function submitQuiz() {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:2rem">
      <div style="font-size:3rem;animation:spin 2s linear infinite;
        display:inline-block;margin-bottom:1rem">✨</div>
      <p style="font-weight:700;font-size:1.1rem;color:var(--text-primary);margin-bottom:.5rem">
        AI is finding your perfect destination...
      </p>
      <p style="color:var(--text-muted);font-size:.85rem">
        Analysing your preferences with Groq AI
      </p>
    </div>`;

  console.log('[QUIZ] Submitting answers:', quizAnswers);

  try {
    const res = await fetch(`${API_BASE}/api/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answers: quizAnswers,
        budget: quizAnswers.budget || 'moderate',
        style: quizAnswers.style || 'mixed',
        group: quizAnswers.group || 'couple',
        climate: quizAnswers.climate || 'warm',
        activity: quizAnswers.activity || 'sightseeing'
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log('[QUIZ] Result:', data);

    displayQuizResult(data);

  } catch(err) {
    console.error('[QUIZ] Error:', err);
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text-muted)">
        <p>⚠️ Could not get recommendation.</p>
        <p style="font-size:.85rem;margin-top:.5rem">${err.message}</p>
      </div>`;
  }
}

function displayQuizResult(data) {
  const container = document.getElementById('quizResult');
  if (!container) return;

  const isAI = data.source === 'groq';
  const sourceBadge = isAI
    ? `<span style="background:rgba(107,203,119,0.12);color:#1a7a28;border:1px solid rgba(107,203,119,0.28);padding:.3rem .8rem;border-radius:50px;font-size:.72rem;font-weight:800">✨ AI Matched</span>`
    : `<span style="background:rgba(183,182,193,0.12);color:var(--text-muted);border:1px solid var(--border);padding:.3rem .8rem;border-radius:50px;font-size:.72rem;font-weight:800">📋 Sample</span>`;

  const highlightsHTML = (data.highlights || [])
    .map(h => `
      <div style="display:flex;align-items:center;gap:.6rem;padding:.6rem 0;
        border-bottom:1px solid var(--border);font-size:.88rem;color:var(--text-secondary)">
        <span style="color:#94958b">→</span>
        ${h}
      </div>`)
    .join('');

  const alternativesHTML = (data.alternatives || [])
    .map(a => `
      <span style="background:var(--bg-sand);border:1px solid var(--border);
        padding:.35rem .85rem;border-radius:50px;font-size:.80rem;font-weight:600;color:var(--text-primary)">
        ${a}
      </span>`)
    .join('');

  container.innerHTML = `
    <div style="animation:slideInUp .5s ease">
      <div style="background:linear-gradient(135deg,#33323f,#464655);border-radius:20px;
        padding:2rem;text-align:center;margin-bottom:1rem;position:relative;overflow:hidden">
        <div style="font-size:4rem;margin-bottom:.75rem;display:block">
          ${data.emoji || '🗺️'}
        </div>
        <div style="font-family:var(--font-display);font-size:2rem;font-weight:900;
          color:#fff;margin-bottom:.3rem;letter-spacing:-.03em">
          ${data.destination}
        </div>
        <div style="color:rgba(255,255,255,.6);font-size:.88rem;margin-bottom:1rem">
          ${data.state || 'United States'}
        </div>
        <div style="display:inline-block;background:rgba(255,255,255,.12);color:rgba(255,255,255,.9);
          padding:.4rem 1.2rem;border-radius:50px;font-size:.82rem;font-weight:600;margin-bottom:1rem;
          border:1px solid rgba(255,255,255,.2)">
          ${data.tagline || ''}
        </div>
        <div style="display:flex;justify-content:center;gap:2rem;margin-top:1rem">
          <div style="text-align:center">
            <div style="font-family:var(--font-display);font-size:2rem;font-weight:900;color:#d5cfe1">
              ${data.match || 90}%
            </div>
            <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.10em;color:rgba(255,255,255,.4)">
              Match
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        ${sourceBadge}
        <span style="font-size:.78rem;color:var(--text-muted);font-style:italic">
          ${data.vibe || ''}
        </span>
      </div>

      ${data.why ? `
      <div style="background:rgba(213,207,225,0.10);border:1px solid rgba(183,182,193,0.18);
        border-radius:14px;padding:1.1rem 1.25rem;margin-bottom:1rem">
        <p style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
          color:#94958b;margin-bottom:.5rem">
          Why this matches you
        </p>
        <p style="font-size:.92rem;line-height:1.7;color:var(--text-secondary);margin:0">
          ${data.why}
        </p>
      </div>` : ''}

      ${highlightsHTML ? `
      <div style="margin-bottom:1rem">
        <p style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
          color:#94958b;margin-bottom:.75rem">
          Top highlights
        </p>
        ${highlightsHTML}
      </div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
        <div style="background:var(--bg-sand);border:1px solid var(--border);border-radius:12px;
          padding:1rem;text-align:center">
          <span style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.10em;
            color:var(--text-muted);display:block;margin-bottom:.4rem">
            Daily Budget
          </span>
          <span style="font-family:var(--font-display);font-size:.95rem;font-weight:800;color:var(--text-primary)">
            ${data.budget || 'Varies'}
          </span>
        </div>
        <div style="background:var(--bg-sand);border:1px solid var(--border);border-radius:12px;
          padding:1rem;text-align:center">
          <span style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.10em;
            color:var(--text-muted);display:block;margin-bottom:.4rem">
            Best Time
          </span>
          <span style="font-family:var(--font-display);font-size:.95rem;font-weight:800;color:var(--text-primary)">
            ${data.best_time || 'Year round'}
          </span>
        </div>
      </div>

      ${alternativesHTML ? `
      <div style="margin-bottom:1.25rem">
        <p style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
          color:#94958b;margin-bottom:.75rem">
          You might also like
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem">
          ${alternativesHTML}
        </div>
      </div>` : ''}

      <button onclick="startQuiz()"
        style="width:100%;padding:1rem;background:linear-gradient(135deg,#464655,#33323f);
          color:#fff;border:none;border-radius:14px;font-family:var(--font-display);font-size:.95rem;
          font-weight:700;cursor:pointer;transition:all .25s ease"
        onmouseover="this.style.transform='translateY(-2px)'"
        onmouseout="this.style.transform='none'">
        🔄 Retake Quiz
      </button>
    </div>`;
}

/* ─────────────────────────────────────────────────────────
   27. FEATURE 8: VISA REQUIREMENTS
───────────────────────────────────────────────────────── */
const visaDB = {
  'US→JP': {status:'free',    label:'Visa-Free', duration:'90 days', processing:'N/A',    cost:'Free', notes:'Passport valid 6+ months required. No advance registration needed.'},
  'US→FR': {status:'free',    label:'Visa-Free', duration:'90 days', processing:'N/A',    cost:'Free', notes:'Part of Schengen Area. 90 days in any 180-day period.'},
  'US→TH': {status:'free',    label:'Visa-Free', duration:'30 days', processing:'N/A',    cost:'Free', notes:'Extendable to 30 more days at immigration office.'},
  'US→AE': {status:'free',    label:'Visa-Free', duration:'30 days', processing:'N/A',    cost:'Free', notes:'Extendable on arrival. Passport validity 6+ months required.'},
  'US→SG': {status:'free',    label:'Visa-Free', duration:'30 days', processing:'N/A',    cost:'Free', notes:'Must have onward ticket and proof of accommodation.'},
  'US→MX': {status:'free',    label:'Visa-Free', duration:'180 days',processing:'N/A',    cost:'Free', notes:'Tourist card (FMM) required — usually included with airline ticket.'},
  'US→BR': {status:'free',    label:'Visa-Free', duration:'90 days', processing:'N/A',    cost:'Free', notes:'eVisa required since 2024 — apply online before travel.'},
  'US→ZA': {status:'free',    label:'Visa-Free', duration:'30 days', processing:'N/A',    cost:'Free', notes:'Extendable. Yellow fever vaccine required if arriving from endemic country.'},
  'IN→JP': {status:'required',label:'Visa Required', duration:'15 days',processing:'3–5 business days',cost:'~¥3,000',notes:'Single/multiple entry. Apply at Japanese Embassy with invitation or hotel bookings.'},
  'IN→FR': {status:'required',label:'Schengen Visa', duration:'90 days',processing:'15 days',cost:'€80',notes:'Apply at French consulate with bank statements, insurance, and accommodation proof.'},
  'IN→TH': {status:'free',    label:'Visa-Free (2024)', duration:'30 days',processing:'N/A',cost:'Free',notes:'Thailand extended visa-free to Indian nationals in 2024. Extendable.'},
  'IN→AE': {status:'on-arrival',label:'Visa on Arrival',duration:'14 days',processing:'On arrival',cost:'$50',notes:'Available at Dubai, Abu Dhabi, and Sharjah airports. Extendable.'},
  'UK→JP': {status:'free',    label:'Visa-Free', duration:'90 days',processing:'N/A',cost:'Free',notes:'British nationals get 90 days visa-free. Passport must be valid throughout stay.'},
  'UK→FR': {status:'free',    label:'Visa-Free', duration:'90 days',processing:'N/A',cost:'Free',notes:'Post-Brexit: 90 days in Schengen per 180-day period. Entry via EES system from 2025.'},
  'UK→TH': {status:'free',    label:'Visa-Free', duration:'30 days',processing:'N/A',cost:'Free',notes:'Extendable at immigration offices within Thailand.'},
  'EU→JP': {status:'free',    label:'Visa-Free', duration:'90 days',processing:'N/A',cost:'Free',notes:'All EU member state passport holders get 90 days visa-free.'},
  'CA→JP': {status:'free',    label:'Visa-Free', duration:'90 days',processing:'N/A',cost:'Free',notes:'Canadian passport holders enter Japan visa-free for tourism.'},
  'AU→JP': {status:'free',    label:'Visa-Free', duration:'90 days',processing:'N/A',cost:'Free',notes:'Australian passport holders enter Japan visa-free for tourism and business.'},
};

async function checkVisa() {
  const fromCode = document.getElementById('visaFrom').value.trim();
  const toCode = document.getElementById('visaTo').value.trim();
  const fromSelect = document.getElementById('visaFrom');
  const toSelect = document.getElementById('visaTo');
  const fromName = fromSelect.options[fromSelect.selectedIndex].text.split('🚩 ')[1] || fromCode;
  const toName = toSelect.options[toSelect.selectedIndex].text.split('🚩 ')[1] || toCode;
  const out = document.getElementById('visaOutput');

  if (!fromCode || !toCode) {
    showToast('Please select both passport and destination', 'warning');
    return;
  }

  // Show loading state
  out.innerHTML = `<div class="visa-card"><div style="text-align:center;padding:2rem">
    <div class="spinner" style="width:40px;height:40px;border:3px solid var(--accent-600);border-top:3px solid var(--primary);border-radius:50%;animation:spin 0.8s linear infinite"></div>
    <p style="margin-top:1rem;color:var(--text-secondary)">Checking visa requirements with AI...</p>
  </div></div>`;

  try {
    const response = await fetch(
      `${API_BASE}/api/visa?from=${fromCode}&to=${toCode}&from_name=${encodeURIComponent(fromName)}&to_name=${encodeURIComponent(toName)}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[VISA] HTTP Error:',
        response.status,
        response.statusText,
        errorText
      );
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Map status to color
    const statusColorMap = {
      'VISA FREE': 'free',
      'ON ARRIVAL': 'on-arrival',
      'EVISA': 'evisa',
      'VISA REQUIRED': 'required',
      'DOMESTIC': 'domestic'
    };
    const statusClass = statusColorMap[data.status?.toUpperCase()] || 'required';
    const statusIcon = 
      statusClass === 'free' ? '✓' :
      statusClass === 'on-arrival' ? '◐' :
      statusClass === 'evisa' ? '📱' :
      statusClass === 'domestic' ? '→' : '!';

    // Build requirements list
    const reqsList = (data.requirements || []).map(r => `<li>${r}</li>`).join('');

    // Build insider tips
    const tipsList = (data.insider_tips || []).map(t => `<li>${t}</li>`).join('');

    // Format cost string
    const costStr = data.cost || 'Variable';

    out.innerHTML = `
      <div class="visa-card">
        <div class="visa-status ${statusClass}" style="display:flex;align-items:center;gap:0.75rem">
          <span style="font-size:1.5rem">${statusIcon}</span>
          <div>
            <div style="font-weight:700;font-size:1.1rem">${data.status || 'UNKNOWN'}</div>
            <div style="font-size:0.9rem;opacity:0.9">${data.label || ''}</div>
          </div>
        </div>
        <div class="visa-details">
          <h4 style="margin:1.5rem 0 1rem 0">${fromName} 🔄 ${toName}</h4>
          
          <div class="visa-detail-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.5rem 0">
            <div style="background:var(--bg-card);padding:1rem;border-radius:var(--r-sm)">
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.3rem">Duration of Stay</div>
              <div style="font-weight:600;color:var(--text-primary)">${data.duration || 'N/A'}</div>
            </div>
            <div style="background:var(--bg-card);padding:1rem;border-radius:var(--r-sm)">
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.3rem">Processing Time</div>
              <div style="font-weight:600;color:var(--text-primary)">${data.processing || 'N/A'}</div>
            </div>
            <div style="background:var(--bg-card);padding:1rem;border-radius:var(--r-sm)">
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.3rem">Visa Cost</div>
              <div style="font-weight:600;color:var(--text-primary)">${costStr}</div>
            </div>
            <div style="background:var(--bg-card);padding:1rem;border-radius:var(--r-sm)">
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.3rem">Status</div>
              <div style="font-weight:600;color:${statusClass === 'free' ? 'var(--success)' : statusClass === 'required' ? 'var(--error)' : 'var(--warning)'}">${data.status || 'UNKNOWN'}</div>
            </div>
          </div>

          ${reqsList ? `<div style="margin:1.5rem 0">
            <h5 style="margin:0 0 0.75rem 0;color:var(--text-primary);font-size:0.95rem">📋 Requirements</h5>
            <ul style="list-style:none;padding:0;margin:0">
              ${reqsList}
            </ul>
          </div>` : ''}

          ${tipsList ? `<div style="margin:1.5rem 0;padding:1rem;background:var(--accent-200);border-radius:var(--r-sm);border-left:3px solid var(--accent)">
            <h5 style="margin:0 0 0.75rem 0;color:var(--text-primary);font-size:0.95rem">💡 Insider Tips</h5>
            <ul style="list-style:none;padding:0;margin:0;font-size:0.9rem">
              ${tipsList}
            </ul>
          </div>` : ''}

          ${data.official_apply_link ? `<div style="margin:1.5rem 0;padding:1rem;background:var(--bg-card);border-radius:var(--r-sm);text-align:center">
            <a href="${data.official_apply_link}" target="_blank" rel="noopener noreferrer" 
               style="display:inline-block;background:var(--primary);color:white;padding:0.75rem 1.5rem;border-radius:var(--r-sm);text-decoration:none;font-weight:600;transition:0.3s">
              🔗 Official Application Link
            </a>
          </div>` : ''}

          <p style="font-size:0.75rem;color:var(--text-muted);margin-top:1.5rem;padding:1rem;background:var(--bg-sand);border-radius:var(--r-sm)">
            ⚠️ <strong>Disclaimer:</strong> This information is provided via Groq AI and should be verified with official embassy sources before making travel decisions. Visa requirements change frequently.
          </p>
        </div>
      </div>
    `;
    showToast('Visa information loaded successfully!', 'success');
    
  } catch (error) {
    console.error('Visa check error:', error);
    out.innerHTML = `
      <div class="visa-card">
        <div class="visa-status required">⚠️ Error Loading Visa Info</div>
        <div class="visa-details">
          <h4>Unable to fetch visa information</h4>
          <p style="font-size:0.9rem;color:var(--text-secondary);margin:1rem 0">
            ${error.message || 'An error occurred while checking visa requirements.'}
          </p>
          <p style="font-size:0.85rem;color:var(--text-secondary)">Please try again or check the official embassy website.</p>
          <div style="margin-top:1rem">
            <a href="https://travel.state.gov" target="_blank" 
               style="color:var(--primary);font-weight:600;text-decoration:none">
              Check Official Travel Resources →
            </a>
          </div>
        </div>
      </div>
    `;
    showToast('Error loading visa information', 'error');
  }
}

/* ─────────────────────────────────────────────────────────
   28. FEATURE 9: TRIP COUNTDOWN
───────────────────────────────────────────────────────── */
let countdowns = JSON.parse(localStorage.getItem('wl_countdowns')||'[]');
let countdownInterval;

function addCountdown() {
  const name = document.getElementById('countdownName').value.trim();
  const date = document.getElementById('countdownDate').value;
  if (!name || !date) { showToast('Please enter a trip name and date', 'warning'); return; }
  if (new Date(date) <= new Date()) { showToast('Please select a future date', 'warning'); return; }
  countdowns.push({ id:Date.now(), name, date });
  localStorage.setItem('wl_countdowns', JSON.stringify(countdowns));
  document.getElementById('countdownName').value = '';
  document.getElementById('countdownDate').value = '';
  renderCountdowns();
  showToast(`✈️ Countdown for "${name}" added!`);
}

function renderCountdowns() {
  const list = document.getElementById('countdownList');
  if (!list) return;
  if (!countdowns.length) {
    list.innerHTML = '<p style="text-align:center;opacity:.5;padding:1rem">No countdowns yet — add your next trip!</p>';
    return;
  }
  updateCountdownDisplay();
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdownDisplay, 1000);
}

function updateCountdownDisplay() {
  const list = document.getElementById('countdownList');
  if (!list) return;
  const now = new Date();
  list.innerHTML = countdowns.map(c => {
    const diff = new Date(c.date) - now;
    if (diff <= 0) return `<div class="countdown-item"><h4>🎉 ${c.name}</h4><p>You're there! Enjoy your trip!</p><button class="countdown-del" onclick="deleteCountdown(${c.id})">✕</button></div>`;
    const days  = Math.floor(diff/(1000*60*60*24));
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const mins  = Math.floor((diff%(1000*60*60))/(1000*60));
    const secs  = Math.floor((diff%(1000*60))/1000);
    return `<div class="countdown-item">
      <h4>✈️ ${c.name}</h4>
      <div class="countdown-numbers">
        <div class="countdown-num"><strong>${days}</strong><span>Days</span></div>
        <div class="countdown-num"><strong>${hours}</strong><span>Hours</span></div>
        <div class="countdown-num"><strong>${mins}</strong><span>Mins</span></div>
        <div class="countdown-num"><strong>${secs}</strong><span>Secs</span></div>
      </div>
      <div class="countdown-date">📅 ${new Date(c.date).toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      <button class="countdown-del" onclick="deleteCountdown(${c.id})">✕</button>
    </div>`;
  }).join('');
}

function deleteCountdown(id) {
  countdowns = countdowns.filter(c => c.id!==id);
  localStorage.setItem('wl_countdowns', JSON.stringify(countdowns));
  renderCountdowns();
}

/* ─────────────────────────────────────────────────────────
   29. FEATURE 10: PHRASE BOOK (ENHANCED - v3.0)
───────────────────────────────────────────────────────── */

// Simple Language Translation Tool using Groq

// Toggle All Languages Section
function toggleAllLanguages() {
  const section = document.getElementById('allLanguagesSection');
  const btn = event.target;
  if (section.style.display === 'none') {
    section.style.display = 'block';
    btn.textContent = 'Hide Extra Languages';
    btn.style.background = '#d9534f';
  } else {
    section.style.display = 'none';
    btn.textContent = 'Show All (30+)';
    btn.style.background = 'var(--accent)';
  }
}

// Set Quick Text
function setQuickText(text) {
  const textarea = document.getElementById('translateSentence');
  textarea.value = text;
  textarea.focus();
  updateCharCount();
}

// Update Character Count
function updateCharCount() {
  const textarea = document.getElementById('translateSentence');
  const count = textarea.value.length;
  const charCountEl = document.getElementById('charCount');
  if (charCountEl) {
    charCountEl.textContent = count + ' character' + (count !== 1 ? 's' : '');
  }
}

// Add character count listener
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('translateSentence');
  if (textarea) {
    textarea.addEventListener('input', updateCharCount);
  }
});

async function translateSentence() {
  const sentence = document.getElementById('translateSentence')?.value.trim();
  const output = document.getElementById('translationOutput');
  
  if (!sentence) {
    showToast('⚠️ Please enter a sentence to translate', 'warning');
    return;
  }
  
  // Get selected languages
  const selectedLangs = Array.from(document.querySelectorAll('input[name="transLang"]:checked'))
    .map(checkbox => checkbox.value);
  
  if (selectedLangs.length === 0) {
    showToast('⚠️ Please select at least one language', 'warning');
    return;
  }
  
  try {
    output.innerHTML = '<div style="text-align:center;padding:40px;"><p style="font-size:1rem;color:var(--text-primary);font-weight:600">🔄 Translating to ' + selectedLangs.length + ' language' + (selectedLangs.length !== 1 ? 's' : '') + '...</p><div style="width:80%;height:4px;background:var(--border);border-radius:2px;margin:20px auto;overflow:hidden;"><div style="height:100%;background:linear-gradient(90deg, var(--accent), #ffb300);animation:progress 1.5s infinite;border-radius:2px;"></div></div></div>';
    
    const response = await fetch(`${API_BASE}/api/phrases/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sentence: sentence,
        languages: selectedLangs
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    renderTranslationResults(data);
    showToast('✅ Translation complete!', 'success');
    
  } catch (err) {
    console.error('[TRANSLATE] API call failed:', err.message);
    output.innerHTML = '<div style="background:#f8d7da;border:2px solid #f5c6cb;padding:20px;border-radius:8px;color:#721c24;"><strong>⚠️ Error:</strong> Could not translate. ' + err.message + '</div>';
  }
}

function renderTranslationResults(data) {
  let html = '';
  
  // Header with original sentence
  if (data.original) {
    html += `<div class="translator-result-card" style="margin-bottom:2rem;border-left:4px solid var(--honey-bronze)">
      <p style="margin:0;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;margin-bottom:0.75rem">📌 Original Text</p>
      <h4 style="margin:0;color:var(--text-primary);word-break:break-word;font-size:1.1rem;line-height:1.6;font-weight:700">"${data.original}"</h4>
    </div>`;
  }
  
  // Render translations by language
  if (data.translations && typeof data.translations === 'object') {
    const translationCount = Object.keys(data.translations).length;
    html += `<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.5rem;font-weight:600">📚 ${translationCount} Translation${translationCount !== 1 ? 's' : ''}</p>`;
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:1.5rem;">';
    
    let index = 0;
    for (const [language, transData] of Object.entries(data.translations)) {
      index++;
      const translation = transData.translation || transData;
      const pronunciation = transData.pronunciation || '';
      const tip = transData.tip || '';
      
      html += `<div class="translator-result-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h5 style="margin:0;color:var(--vintage-grape);font-size:1rem;font-weight:700;font-family:var(--font-display)">🌐 ${language}</h5>
          <span style="background:var(--grad-gold);color:white;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:700">${index}/${Object.keys(data.translations).length}</span>
        </div>
        <div class="translator-result-translation">${translation}</div>
        ${pronunciation ? `<div class="translator-result-pronunciation">📢 ${pronunciation}</div>` : ''}
        ${tip ? `<div style="background:rgba(236,167,44,0.1);border:1px solid rgba(236,167,44,0.2);border-radius:var(--r-sm);padding:0.5rem 0.75rem;font-size:0.78rem;color:var(--text-secondary);margin-top:0.5rem;line-height:1.5">💡 ${tip}</div>` : ''}
        <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
          <button class="phrase-copy" data-text="${translation}" title="Copy translation" onclick="copyPhrase(this.dataset.text); event.stopPropagation();" style="flex:1;padding:0.6rem;background:var(--grad-green);color:white;border:none;border-radius:var(--r-sm);cursor:pointer;font-size:0.85rem;font-weight:700;transition:all 0.2s;font-family:var(--font-body)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(68,53,91,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">📋 Copy</button>
          <button class="phrase-speak" data-text="${translation}" title="Hear pronunciation" onclick="speakPhrase(this.dataset.text, '${language}'); event.stopPropagation();" style="flex:1;padding:0.6rem;background:var(--grad-green);color:white;border:none;border-radius:var(--r-sm);cursor:pointer;font-size:0.85rem;font-weight:700;transition:all 0.2s;font-family:var(--font-body)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(68,53,91,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">🔊 Speak</button>
        </div>
      </div>`;
    }
    
    html += '</div>';
  }
  
  html += `<div style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:2.5rem;padding-top:1.5rem;border-top:2px solid var(--border);">
    <small style="font-weight:600;font-family:var(--font-body)">🤖 Powered by Groq AI  |  Instant Multi-Language Translation</small>
  </div>`;
  
  document.getElementById('translationOutput').innerHTML = html;
}

function copyPhrase(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`✅ Copied: "${text}"`, 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

function speakPhrase(text, language) {
  const clean = text.replace(/\(.*?\)/g,'').trim();
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(clean);
    
    const langMap = {
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'Japanese': 'ja-JP',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-BR',
      'Mandarin Chinese': 'zh-CN',
      'Arabic': 'ar-SA',
      'Korean': 'ko-KR',
      'Russian': 'ru-RU'
    };
    
    u.lang = langMap[language] || 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    showToast(`🔊 Playing: "${clean}"`, 'info');
  } else {
    showToast('Speech not supported in your browser', 'warning');
  }
}


/* ─────────────────────────────────────────────────────────
   30. SCROLL ANIMATIONS & COUNTERS
───────────────────────────────────────────────────────── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      const target = parseInt(entry.target.getAttribute('data-target'));
      const inc    = target / (2000/16);
      let cur = 0;
      const tick = () => {
        cur += inc;
        if (cur < target) { entry.target.textContent = Math.floor(cur); requestAnimationFrame(tick); }
        else { entry.target.textContent = target; }
      };
      tick();
      entry.target.classList.add('counted');
    }
  });
}, { threshold:0.5 });
document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }
  });
}, { threshold:0.1, rootMargin:'0px 0px -50px 0px' });
document.querySelectorAll('.destination-card,.exp-card,.step-card,.guide-card,.tool-card').forEach((el,i) => {
  el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition=`opacity .6s ease ${i*.06}s, transform .6s ease ${i*.06}s`;
  fadeObserver.observe(el);
});

/* ─────────────────────────────────────────────────────────
   32. DOMCONTENTLOADED INIT
───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // AOS animations - MUST be first to reveal hidden elements
  if (window.AOS) {
    AOS.init({ 
      duration: 700, 
      easing: 'ease-in-out', 
      once: true, 
      offset: 80 
    });
    console.log('[INIT] AOS initialized successfully');
  } else {
    console.warn('[INIT] AOS library not loaded');
  }

  // Initialize dark mode from localStorage
  initDarkMode();

  // Set active nav link based on current page
  setActiveNavLink();

  // Load live currency rates
  loadLiveRates();

  // Load saved trips
  loadSavedTrips();

  // Set min dates for date pickers
  const today = new Date().toISOString().split('T')[0];
  ['checkin', 'checkout'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });
  
  // Update checkout min date when checkin changes
  document.getElementById('checkin')?.addEventListener('change', function() {
    const co = document.getElementById('checkout');
    if (co) co.min = this.value;
  });

  // Hero video autoplay
  const vid = document.querySelector('.hero-video');
  if (vid) vid.play().catch(() => {});

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open')
        .forEach(m => closeModal(m.id));
      closeMapModal();
      closeDestinationMap();
    }
  });

  // Hero search enter key
  document.getElementById('heroSearch')
    ?.addEventListener('keypress', e => {
      if (e.key === 'Enter') handleHeroSearch();
    });

  // Set active nav link based on current page
  setActiveNavLink();

  console.log('[INIT] Page initialization complete');
});

/* ─────────────────────────────────────────────────────────
   33. LIVE FLIGHT TRACKER
───────────────────────────────────────────────────────── */
let currentTrackerRegion = 'usa';

function switchTrackerTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.tracker-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tracker-tab').forEach(t => t.classList.remove('active'));

  // Show selected
  if (tab === 'livemap') {
    document.getElementById('trackerLivemapTab').style.display = 'block';
    document.getElementById('tabLiveMap').classList.add('active');
  } else if (tab === 'search') {
    document.getElementById('trackerSearchTab').style.display = 'block';
    document.getElementById('tabSearch').classList.add('active');
  } else if (tab === 'airports') {
    document.getElementById('trackerAirportsTab').style.display = 'block';
    document.getElementById('tabAirports').classList.add('active');
    loadAirportGrid();
  }
}

async function loadLiveFlights(region, btnEl) {
  currentTrackerRegion = region;
  
  // Update active button
  document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const list = document.getElementById('liveFlightsList');
  const stats = document.getElementById('trackerStatsBar');
  
  list.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6">🛩️ Loading live flights over ' + region.toUpperCase() + '...</p>';

  try {
    const res = await fetch(`${API_BASE}/api/flighttracker/live?region=${region}`);
    const data = await res.json();

    if (!data.aircraft?.length) {
      list.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6">No aircraft data available right now. Try again in a moment.</p>';
      return;
    }

    // Stats bar
    const avgAlt = Math.round(data.aircraft.reduce((s,a) => s + a.altitude, 0) / data.aircraft.length);
    const avgSpd = Math.round(data.aircraft.reduce((s,a) => s + a.speed, 0) / data.aircraft.length);

    stats.innerHTML = `
      <div class="tracker-stat-box">
        <span class="tracker-stat-number">${data.aircraft.length}</span>
        <span class="tracker-stat-label">Live Aircraft</span>
      </div>
      <div class="tracker-stat-box">
        <span class="tracker-stat-number">${data.total || 0}</span>
        <span class="tracker-stat-label">Total Tracked</span>
      </div>
      <div class="tracker-stat-box">
        <span class="tracker-stat-number">${avgAlt.toLocaleString()}</span>
        <span class="tracker-stat-label">Avg Altitude (m)</span>
      </div>
      <div class="tracker-stat-box">
        <span class="tracker-stat-number">${avgSpd}</span>
        <span class="tracker-stat-label">Avg Speed (kts)</span>
      </div>`;

    // Aircraft list
    list.innerHTML = data.aircraft.map(a => {
      const headingArrow = getHeadingArrow(a.heading);
      const altFt = Math.round(a.altitude * 3.28084);
      return `
        <div class="aircraft-card">
          <div>
            <div class="aircraft-callsign">✈️ ${a.callsign || 'Unknown'}</div>
            <div class="aircraft-country">${a.country}</div>
          </div>
          <div class="aircraft-stats">
            <div class="aircraft-stat-item">
              <span class="aircraft-stat-value">${a.speed} kts</span>
              <span class="aircraft-stat-label">Speed</span>
            </div>
            <div class="aircraft-stat-item">
              <span class="aircraft-stat-value">${altFt.toLocaleString()} ft</span>
              <span class="aircraft-stat-label">Altitude</span>
            </div>
            <div class="aircraft-stat-item">
              <span class="aircraft-stat-value" style="font-size:1.4rem">${headingArrow}</span>
              <span class="aircraft-stat-label">Heading</span>
            </div>
          </div>
          <div class="aircraft-altitude-badge">
            ${a.altitude > 10000 ? 'Cruising' : a.altitude > 3000 ? 'Climbing' : 'Approach'}
          </div>
        </div>`;
    }).join('');

    showToast(`✈️ ${data.aircraft.length} aircraft loaded`, 'info');

  } catch (err) {
    console.error('[TRACKER]', err);
    list.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-muted)">Could not load live flights. Check server is running.</p>';
  }
}

function getHeadingArrow(heading) {
  if (!heading && heading !== 0) return '➡️';
  const dirs = ['⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️'];
  return dirs[Math.round(heading / 45) % 8];
}

function refreshLiveFlights() {
  const activeBtn = document.querySelector('.region-btn.active');
  loadLiveFlights(currentTrackerRegion, activeBtn);
}

async function searchFlightTracker() {
  const flight = document.getElementById('trackFlightInput')?.value?.trim().toUpperCase().replace(/\s/g, '');
  
  if (!flight) {
    showToast('Please enter a flight number', 'warning');
    return;
  }

  const out = document.getElementById('flightSearchResult');
  out.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6">🔍 Searching for flight ' + flight + '...</p>';

  try {
    const res = await fetch(`${API_BASE}/api/flighttracker/search?flight=${flight}`);
    const data = await res.json();

    if (!data.found) {
      out.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--text-muted)">
          <div style="font-size:3rem;margin-bottom:1rem">✈️</div>
          <p>Flight ${flight} not found in current data</p>
          <p style="font-size:.82rem;margin-top:.5rem">
            OpenSky updates every 10 seconds. Try a currently active flight number.
          </p>
        </div>`;
      return;
    }

    out.innerHTML = `
      <div style="background:var(--bg-card);border:1.5px solid var(--honey-bronze);border-radius:var(--r-lg);padding:1.75rem;margin-top:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <div>
            <h3 style="font-size:1.75rem;margin-bottom:.3rem;font-family:var(--font-display)">✈️ ${data.flightNumber}</h3>
            <p style="font-size:.88rem;color:var(--text-muted);font-family:var(--font-body)">Callsign: ${data.callsign}</p>
          </div>
          <div style="background:rgba(39,174,96,.1);border:1px solid rgba(39,174,96,.3);color:#27ae60;padding:.5rem 1.25rem;border-radius:50px;font-weight:700;font-size:.9rem;font-family:var(--font-body)">
            ${data.status}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:center;background:var(--bg-sand);padding:1.25rem;border-radius:var(--r-md);margin-bottom:1rem">
          <div>
            <div style="font-size:2.2rem;font-weight:700;color:var(--spicy-paprika);font-family:var(--font-display)">
              ${data.origin}
            </div>
            <div style="font-size:.8rem;color:var(--text-muted);font-family:var(--font-body)">
              ${data.departureTime}
            </div>
          </div>
          <div style="text-align:center;font-size:1.75rem">✈️</div>
          <div style="text-align:right">
            <div style="font-size:2.2rem;font-weight:700;color:var(--spicy-paprika);font-family:var(--font-display)">
              ${data.destination}
            </div>
            <div style="font-size:.8rem;color:var(--text-muted);font-family:var(--font-body)">
              ${data.arrivalTime}
            </div>
          </div>
        </div>
        <p style="font-size:.78rem;color:var(--text-muted);text-align:center;font-family:var(--font-body)">
          Data from OpenSky Network · Updates every 10 seconds
        </p>
      </div>`;

  } catch (err) {
    console.error('[TRACKER SEARCH]', err);
    out.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-muted)">Could not search for flight. Try again.</p>';
  }
}

function quickTrackFlight(flightNum) {
  document.getElementById('trackFlightInput').value = flightNum;
  searchFlightTracker();
}

async function loadAirportGrid() {
  const grid = document.getElementById('airportGrid');
  if (!grid || grid.innerHTML.trim() !== '') return;

  const airports = ['JFK','LAX','ORD','ATL','DFW','DEN','SFO','SEA','MIA','BOS','LAS','MCO','PHX','HNL'];

  grid.innerHTML = airports.map(code => `
    <div class="airport-card" onclick="lookupAirport('${code}')">
      <div class="airport-code">${code}</div>
      <div class="airport-name" id="airportName_${code}">Loading...</div>
      <div class="airport-city" id="airportCity_${code}"></div>
    </div>`).join('');

  // Load airport details
  for (const code of airports) {
    try {
      const res = await fetch(`${API_BASE}/api/flighttracker/airport?code=${code}`);
      const data = await res.json();
      const nameEl = document.getElementById(`airportName_${code}`);
      const cityEl = document.getElementById(`airportCity_${code}`);
      if (nameEl) nameEl.textContent = data.name;
      if (cityEl) cityEl.textContent = `📍 ${data.city} · ${data.timezone}`;
    } catch (err) {
      console.error(`Airport ${code}:`, err);
    }
  }
}

function lookupAirport(code) {
  switchTrackerTab('search');
  document.getElementById('trackFlightInput').value = '';
  showToast(`Looking up flights from ${code}...`, 'info');
}

/* ─────────────────────────────────────────────────────────
   34. MULTI-STEP FORM WIZARD
───────────────────────────────────────────────────────── */

// Wizard state object
const wizardState = {
  city: '',
  days: '',
  date: '',
  budget: '',
  interests: [],
  travelerType: ''
};

// Initialize wizard event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Duration buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wizardState.days = btn.dataset.days;
      validateStep(1);
    });
  });

  // Budget cards
  document.querySelectorAll('.budget-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.budget-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      wizardState.budget = card.dataset.budget;
      validateStep(2);
    });
  });

  // Destination input
  const cityInput = document.getElementById('wizardCity');
  if (cityInput) {
    cityInput.addEventListener('change', () => {
      wizardState.city = cityInput.value.trim();
    });
  }

  // Date picker
  const dateInput = document.getElementById('wizardDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.addEventListener('change', () => {
      wizardState.date = dateInput.value;
      validateStep(2);
    });
  }

  // Checkboxes (interests)
  document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      wizardState.interests = Array.from(
        document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked')
      ).map(el => el.value);
    });
  });

  // Radio buttons (traveler type)
  document.querySelectorAll('.radio-item input[type="radio"]').forEach(rb => {
    rb.addEventListener('change', () => {
      wizardState.travelerType = rb.value;
    });
  });
});

// Step navigation
function wizardNext() {
  const currentStep = getCurrentStep();
  
  // Validate current step
  if (!validateStep(currentStep)) {
    showToast('Please complete all required fields', 'warning');
    return;
  }

  // Go to next step
  goToStep(currentStep + 1);
  updateProgressBar();
  
  // If moving to step 4, populate review
  if (currentStep + 1 === 4) {
    populateReview();
  }
}

function wizardBack() {
  const currentStep = getCurrentStep();
  if (currentStep > 1) {
    goToStep(currentStep - 1);
    updateProgressBar();
  }
}

function validateStep(step) {
  switch(step) {
    case 1:
      const city = document.getElementById('wizardCity')?.value?.trim();
      const days = wizardState.days;
      if (!city) {
        showToast('Please enter a destination city', 'warning');
        document.getElementById('wizardCity')?.focus();
        return false;
      }
      if (!days) {
        showToast('Please select trip duration', 'warning');
        return false;
      }
      wizardState.city = city;
      return true;

    case 2:
      const date = document.getElementById('wizardDate')?.value;
      const budget = wizardState.budget;
      if (!date) {
        showToast('Please select departure date', 'warning');
        document.getElementById('wizardDate')?.focus();
        return false;
      }
      if (!budget) {
        showToast('Please select budget level', 'warning');
        return false;
      }
      wizardState.date = date;
      return true;

    case 3:
      // Step 3 is optional - user doesn't have to select interests
      return true;

    default:
      return true;
  }
}

function getCurrentStep() {
  const activeStep = document.querySelector('.wizard-step.active');
  return parseInt(activeStep.id.replace('step', ''));
}

function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  
  // Show target step
  const targetStep = document.getElementById(`step${step}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  
  // Update current step indicator
  document.getElementById('currentStep').textContent = step;
}

function updateProgressBar() {
  const currentStep = getCurrentStep();
  const percentage = (currentStep / 4) * 100;
  document.getElementById('progressFill').style.width = percentage + '%';
}

function populateReview() {
  // Display all collected info in step 4
  document.getElementById('reviewCity').textContent = wizardState.city || '-';
  document.getElementById('reviewDays').textContent = (wizardState.days || '-') + ' days';
  
  // Format date
  if (wizardState.date) {
    const dateObj = new Date(wizardState.date);
    document.getElementById('reviewDate').textContent = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  } else {
    document.getElementById('reviewDate').textContent = '-';
  }

  // Budget label
  const budgetLabels = {
    'budget': '💸 Budget ($50-100/day)',
    'midrange': '💳 Mid-Range ($100-250/day)',
    'luxury': '💎 Luxury ($250+/day)'
  };
  document.getElementById('reviewBudget').textContent = budgetLabels[wizardState.budget] || '-';

  // Interests
  const interests = wizardState.interests.length > 0 
    ? wizardState.interests.join(', ') 
    : 'Not specified';
  document.getElementById('reviewInterests').textContent = interests;

  // Traveler type
  document.getElementById('reviewTraveler').textContent = wizardState.travelerType || 'Not specified';
}

function wizardGenerate() {
  // Final validation
  if (!validateStep(1) || !validateStep(2)) {
    showToast('Please complete all required fields', 'warning');
    return;
  }

  // Show loading state
  const genBtn = document.getElementById('generateBtn');
  const btnTxt = genBtn.querySelector('.btn-text');
  const btnLdr = genBtn.querySelector('.btn-loader');
  btnTxt.style.display = 'none';
  btnLdr.style.display = 'inline';
  genBtn.disabled = true;

  // Build proper payload with all wizard data
  const payload = {
    destination: wizardState.city,
    days: parseInt(wizardState.days),
    travel_date: wizardState.date,
    budget: wizardState.budget,
    interests: wizardState.interests.length > 0 ? wizardState.interests : ['general sightseeing'],
    traveler_type: wizardState.travelerType || 'solo'
  };

  console.log('[WIZARD] Generating itinerary with payload:', payload);

  // Call API directly
  fetch(`${API_BASE}/api/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('[WIZARD] Itinerary received:', data);
    renderWizardItinerary(data);
    
    // Scroll to results
    const resultEl = document.getElementById('itinerary-result');
    if (resultEl) {
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  })
  .catch(err => {
    console.error('[ERROR] Itinerary generation failed:', err);
    showToast('Error generating itinerary: ' + err.message, 'error');
  })
  .finally(() => {
    btnTxt.style.display = 'inline';
    btnLdr.style.display = 'none';
    genBtn.disabled = false;
  });
}

// Render wizard itinerary with Groq response
function renderWizardItinerary(data) {
  let html = '';
  
  // Header with trip info
  html += `<div class="itinerary-header">
    <h2>🗺️ Your ${data.days}-Day Itinerary for ${data.destination}</h2>
    <p class="itinerary-meta">💰 Budget: ${data.budget_level} · Estimated Total: $${data.total_estimated_cost || 0}</p>
  </div>`;

  // Render each day
  if (data.days_schedule && Array.isArray(data.days_schedule)) {
    data.days_schedule.forEach(day => {
      html += `<div class="itinerary-day">
        <div class="day-header">
          <h3>📅 Day ${day.day} — ${day.title}</h3>
          <span class="day-cost">💰 $${day.daily_cost || 0}</span>
        </div>
        <p class="day-summary">${day.summary || ''}</p>`;

      // Activities
      if (day.activities && Array.isArray(day.activities)) {
        html += '<div class="day-activities">';
        day.activities.forEach(act => {
          html += `<div class="itinerary-activity">
            <div class="activity-time">⏰ ${act.time}</div>
            <div class="activity-details">
              <h5>${act.activity}</h5>
              <p><strong>Duration:</strong> ${act.duration}</p>
              <p><strong>Cost:</strong> $${act.cost}</p>
              <p class="activity-tips">💡 ${act.tips}</p>
            </div>
          </div>`;
        });
        html += '</div>';
      }

      // Meals
      if (day.meals) {
        html += `<div class="day-meals">
          <strong>🍽️ Meals:</strong>
          <ul>
            <li><strong>Breakfast:</strong> ${day.meals.breakfast}</li>
            <li><strong>Lunch:</strong> ${day.meals.lunch}</li>
            <li><strong>Dinner:</strong> ${day.meals.dinner}</li>
          </ul>
        </div>`;
      }

      // Day tips
      if (day.tips) {
        html += `<div class="day-tips">
          <strong>ℹ️ Tips for today:</strong> ${day.tips}
        </div>`;
      }

      html += '</div>';
    });
  }

  // Cost breakdown
  if (data.cost_breakdown) {
    html += `<div class="cost-breakdown">
      <h3>💵 Cost Breakdown</h3>
      <div class="breakdown-items">
        <div class="breakdown-item">
          <span>Accommodation</span>
          <span>$${data.cost_breakdown.accommodation || 0}</span>
        </div>
        <div class="breakdown-item">
          <span>Food & Dining</span>
          <span>$${data.cost_breakdown.food_and_dining || 0}</span>
        </div>
        <div class="breakdown-item">
          <span>Activities & Attractions</span>
          <span>$${data.cost_breakdown.activities_and_attractions || 0}</span>
        </div>
        <div class="breakdown-item">
          <span>Transportation</span>
          <span>$${data.cost_breakdown.transportation || 0}</span>
        </div>
        <div class="breakdown-item total">
          <span><strong>Total Estimated</strong></span>
          <span><strong>$${data.total_estimated_cost || 0}</strong></span>
        </div>
      </div>
    </div>`;
  }

  // Packing suggestions
  if (data.packing_suggestions && Array.isArray(data.packing_suggestions)) {
    html += `<div class="packing-suggestions">
      <h3>🎒 Packing Suggestions</h3>
      <ul>
        ${data.packing_suggestions.map(item => `<li>✓ ${item}</li>`).join('')}
      </ul>
    </div>`;
  }

  // General tips
  if (data.general_tips) {
    html += `<div class="general-tips">
      <h3>ℹ️ General Tips</h3>
      <p>${data.general_tips}</p>
    </div>`;
  }

  // Add footer note
  html += `<div class="itinerary-footer">
    <small>✨ Itinerary generated by Groq AI · Always check updated travel restrictions and weather before departing</small>
  </div>`;

  // Update result section
  const resultEl = document.getElementById('itinerary-result');
  if (resultEl) {
    resultEl.innerHTML = html;
    resultEl.style.display = 'block';
  }
}