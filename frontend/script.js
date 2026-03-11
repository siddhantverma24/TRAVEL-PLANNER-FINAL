// ============================================================
// WANDERLUST — script.js  (Complete Final Version)
// Features: Preloader, Navbar, Carousel, Maps, Itinerary,
//   Weather, Currency, Packing, Visa, Flights, Hotels,
//   Quiz, Countdown, Phrases, Budget, Diary, Reviews, Toast
// ============================================================

'use strict';

/* ─────────────────────────────────────────────────────────
   1. PRELOADER
───────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) setTimeout(() => pre.classList.add('hidden'), 800);
});

/* ─────────────────────────────────────────────────────────
   2. TOAST
───────────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const icon = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  document.getElementById('toastIcon').textContent = icon[type] || '✅';
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
   4. CURRENCY TICKER
───────────────────────────────────────────────────────── */
const tickerRates = {
  USD:1, EUR:0.92, GBP:0.79, JPY:149.5, AUD:1.53,
  CAD:1.36, INR:83.1, CHF:0.88, SGD:1.34, AED:3.67
};
function buildTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const items = Object.entries(tickerRates).map(([c, r]) =>
    `<span>1 USD = <strong>${r} ${c}</strong></span>`
  ).join('');
  track.innerHTML = items + items; // duplicate for seamless loop
}
buildTicker();

/* ─────────────────────────────────────────────────────────
   5. NAVBAR
───────────────────────────────────────────────────────── */
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  const cur = window.pageYOffset;
  navbar.classList.toggle('scrolled', cur > 80);
  if (cur > lastScroll && cur > 200) navbar.classList.add('nav-hidden');
  else if (cur < lastScroll) navbar.classList.remove('nav-hidden');
  lastScroll = cur <= 0 ? 0 : cur;
});

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
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
    flights: 'Search flights — e.g. New York to London…',
    hotels: 'Search hotels — e.g. Paris, Eiffel Tower area…',
    experiences: 'Search experiences — e.g. Grand Canyon hiking…'
  };
  document.getElementById('heroSearch').placeholder = placeholders[type];
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
    airportMap = L.map('map').setView([lat, lng], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap' }).addTo(airportMap);
  } else {
    airportMap.setView([lat, lng], 7);
  }
  currentMarkers.forEach(m => airportMap.removeLayer(m));
  currentMarkers = [];
  const list = document.getElementById('airportList');
  list.innerHTML = '';
  airports.forEach(a => {
    const m = L.marker([a.lat, a.lng]).addTo(airportMap).bindPopup(`<strong>${a.name}</strong>`);
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

function openDestinationMap(cityName) {
  openModal('destinationMapModal');
  document.getElementById('destinationMapTitle').textContent = `Explore ${cityName}`;
  setTimeout(() => { initDestMap(cityName); if (destMapInstance) destMapInstance.invalidateSize(); }, 200);
}
function closeDestinationMap() {
  closeModal('destinationMapModal');
  if (destMapInstance) { destMapInstance.remove(); destMapInstance = null; }
}
function initDestMap(city) {
  const d = destinationPOIs[city];
  if (!d) return;
  if (destMapInstance) destMapInstance.remove();
  destMapInstance = L.map('destinationMap').setView(d.center, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap', maxZoom:18 }).addTo(destMapInstance);

  const mkAttr = L.divIcon({ className:'', html:'<div style="background:#2d5a35;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,.3)">📍</div>', iconSize:[34,34], iconAnchor:[17,34] });
  const mkRest = L.divIcon({ className:'', html:'<div style="background:#c9a84c;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,.3)">🍽️</div>', iconSize:[34,34], iconAnchor:[17,34] });

  const sidebar = document.getElementById('destinationPOIs');
  sidebar.innerHTML = '';
  d.pois.forEach(p => {
    const m = L.marker([p.lat, p.lng], { icon: p.type==='attraction' ? mkAttr : mkRest })
      .addTo(destMapInstance).bindPopup(`<strong>${p.name}</strong><br>${p.desc}`);
    const el = document.createElement('div');
    el.className = 'poi-item';
    el.innerHTML = `<h4>${p.type==='attraction'?'📍':'🍽️'} ${p.name}</h4><p>${p.desc}</p>`;
    el.onclick = () => { destMapInstance.setView([p.lat, p.lng], 15); m.openPopup(); };
    sidebar.appendChild(el);
  });
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
   12. ITINERARY GENERATOR
───────────────────────────────────────────────────────── */
function handleItinerarySubmit(e) {
  e.preventDefault();
  const city   = document.getElementById('itinerary-city').value;
  const days   = parseInt(document.getElementById('itinerary-days').value);
  const style  = document.getElementById('travel-style').value;
  const budget = parseInt(document.getElementById('daily-budget').value);
  const btnTxt = e.target.querySelector('.btn-text');
  const btnLdr = e.target.querySelector('.btn-loader');
  btnTxt.style.display = 'none';
  btnLdr.style.display = 'inline';
  setTimeout(() => {
    generateItinerary(city, days, style, budget);
    btnTxt.style.display = 'inline';
    btnLdr.style.display = 'none';
  }, 1800);
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
  const acts = activityDB[style] || activityDB.budget;
  let html = '', total = 0;
  const times = ['9:00 AM','12:30 PM','4:00 PM'];
  for (let d = 1; d <= days; d++) {
    html += `<div class="itinerary-day"><h4>Day ${d} — ${city}</h4>`;
    times.forEach(t => {
      const a = acts[Math.floor(Math.random() * acts.length)];
      const cost = Math.round(a.cost * (budget / 200));
      total += cost;
      html += `<div class="itinerary-activity">
        <div class="activity-time">${t}</div>
        <div class="activity-details"><h5>${a.name}</h5><p>${a.desc}</p></div>
        <div class="activity-cost">$${cost}</div>
      </div>`;
    });
    html += '</div>';
  }
  document.getElementById('itinerary-title').textContent =
    `${days}-Day ${city} ${style.charAt(0).toUpperCase()+style.slice(1)} Journey`;
  document.getElementById('itinerary-content').innerHTML = html;
  document.getElementById('total-cost').innerHTML = `
    $${total.toLocaleString()}
    <div class="cost-breakdown">
      <div class="cost-item"><span>Activities</span><strong>$${Math.round(total*.6).toLocaleString()}</strong></div>
      <div class="cost-item"><span>Accommodation</span><strong>$${Math.round(total*.28).toLocaleString()}</strong></div>
      <div class="cost-item"><span>Transport</span><strong>$${Math.round(total*.12).toLocaleString()}</strong></div>
    </div>`;
  const result = document.getElementById('itinerary-result');
  result.style.display = 'block';
  result.scrollIntoView({ behavior:'smooth', block:'start' });
  if (window.AOS) AOS.refresh();
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
  .activity-cost{margin-left:auto;font-weight:bold;color:#c9a84c}
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
   16. TRIP PLANNING FORM
───────────────────────────────────────────────────────── */
function submitTripForm(e) {
  e.preventDefault();
  const dest = document.getElementById('destination').value;
  showToast(`✅ Request received for ${dest}! Our team will contact you within 24 hours.`);
  e.target.reset();
  setTimeout(() => {
    document.getElementById('itinerary-city').value = dest.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase());
    scrollTo('itinerary-generator');
  }, 1500);
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
    icon:'🏞️',
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
    icon:'💸',
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
    icon:'🎒',
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
    icon:'🚗',
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
        <h2>${g.icon} ${name}</h2>
        <button class="modal-close" onclick="closeModal('guideModal')">✕</button>
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
    'Clothing':['👙 Swimsuit / Bikini','👕 Light T-shirts (×4)','🩳 Shorts (×3)','👗 Beach cover-up','🌂 Light rain jacket','👡 Sandals','👟 Comfortable walking shoes'],
    'Essentials':['🧴 Sunscreen SPF 50+','😎 Sunglasses','🧢 Wide-brim hat','🏖️ Beach towel','💊 Insect repellent','💊 Antihistamine'],
    'Tech & Extras':['📱 Waterproof phone case','🔋 Portable charger','📷 Camera','🎒 Dry bag','📖 Book / e-reader','🎵 Bluetooth speaker']
  },
  mountain:{
    'Clothing':['🧥 Insulated jacket','🧣 Thermal base layers (×2)','👖 Hiking trousers (×2)','🧤 Gloves','🧢 Beanie','🥾 Hiking boots','🧦 Merino wool socks (×4)'],
    'Gear':['🎒 Daypack (20–30L)','🗺️ Trail map / compass','🔦 Headlamp + extra batteries','⛏️ Trekking poles','🆘 Emergency whistle','🔪 Multi-tool'],
    'Safety':['💊 First-aid kit','🌡️ Emergency blanket','🧴 High-altitude sunscreen','💧 Water purification tablets','🐻 Bear spray (if required)','📡 Offline maps downloaded']
  },
  city:{
    'Clothing':['👔 Smart casual outfits (×3)','👕 Casual T-shirts (×3)','👖 Versatile jeans (×2)','🧥 Light jacket / blazer','👞 Comfortable walking shoes','🩴 Dress shoes'],
    'Essentials':['🎒 Daypack / tote bag','💳 Travel wallet','🔒 TSA-approved luggage lock','☂️ Compact umbrella','💊 Pain relievers','📍 City guidebook'],
    'Tech':['🔌 Universal power adapter','🔋 Portable charger','💻 Laptop + charger','🎧 Noise-cancelling headphones','📱 Local SIM card']
  },
  winter:{
    'Clothing':['🧥 Heavy-duty winter coat','🧣 Thermal scarf','🧤 Insulated gloves','🎿 Snow boots','👖 Thermal leggings','🧦 Wool socks (×5)','🎩 Fur-lined hat'],
    'Gear':['🕶️ Anti-glare snow goggles','💊 Vitamin D supplements','🧴 Heavy moisturiser','💋 Lip balm SPF','🌡️ Pocket hand warmers','☂️ Waterproof umbrella'],
    'Safety':['🆘 Emergency contact list','🏥 Travel insurance documents','💊 Cold & flu medication','🔋 Extra phone battery (cold drains fast)']
  },
  business:{
    'Clothing':['👔 Dress shirts (×3)','🤵 Business suit (×2)','👔 Ties (×2)','👞 Polished dress shoes','🧥 Overcoat','🩲 Formal underwear (×5)'],
    'Work Essentials':['💼 Professional laptop bag','💻 Laptop + charger','🖨️ Portable Wi-Fi hotspot','📒 Notebook & pens','💳 Business cards','📁 Document organiser'],
    'Personal':['🪥 Grooming kit','💊 Antacids / vitamins','🧴 Travel-size toiletries','😴 Sleep mask + ear plugs (for early flights)']
  }
};

function generatePackingList() {
  const type = document.getElementById('packingDestType').value;
  const days = parseInt(document.getElementById('packingDays').value);
  const data = packingDB[type] || packingDB.city;
  let html = '';
  Object.entries(data).forEach(([cat, items]) => {
    html += `<div class="packing-category"><h4>${cat}</h4>`;
    items.forEach((item, i) => {
      html += `<div class="packing-item">
        <input type="checkbox" id="pk${cat}${i}" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none'">
        <label for="pk${cat}${i}">${item}${days>7&&cat==='Clothing'?' (×'+Math.ceil(days/7)+' weeks)':''}</label>
      </div>`;
    });
    html += '</div>';
  });
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
// Simulated live rates relative to USD (updated values)
const fxRates = { USD:1, EUR:0.924, GBP:0.793, JPY:149.82, AUD:1.531, CAD:1.362, INR:83.18, CHF:0.883 };

function convertCurrency() {
  const amt  = parseFloat(document.getElementById('convAmount')?.value) || 0;
  const from = document.getElementById('convFrom')?.value;
  const to   = document.getElementById('convTo')?.value;
  if (!from || !to) return;
  const result = (amt / fxRates[from]) * fxRates[to];
  const resEl = document.getElementById('convResult');
  if (resEl) resEl.value = result.toFixed(2);
  const rateEl = document.getElementById('convRate');
  if (rateEl) rateEl.textContent = `1 ${from} = ${(fxRates[to]/fxRates[from]).toFixed(4)} ${to}`;
  // Show all rates for the 'from' currency
  const allEl = document.getElementById('convAllRates');
  if (allEl) {
    allEl.innerHTML = Object.keys(fxRates).filter(c=>c!==from).map(c =>
      `<div class="rate-row"><span>1 ${from} → ${c}</span><span>${(fxRates[c]/fxRates[from]).toFixed(4)}</span></div>`
    ).join('');
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
  renderBudget();
}

function addBudgetEntry() {
  const name  = document.getElementById('budgetTripName').value || 'Expense';
  const total = parseFloat(document.getElementById('totalBudget').value) || 0;
  const entryName = prompt('Expense name (e.g. Hotel, Food, Transport):') || 'Expense';
  const entryAmt  = parseFloat(prompt('Amount ($):')) || 0;
  const cat       = prompt('Category (food/hotel/transport/activity/other):') || 'other';
  if (entryAmt <= 0) { showToast('Please enter a valid amount', 'warning'); return; }
  budgetEntries.push({ id:Date.now(), trip:name, name:entryName, amount:entryAmt, category:cat, date:new Date().toLocaleDateString() });
  localStorage.setItem('wl_budget', JSON.stringify(budgetEntries));
  renderBudget();
}

function renderBudget() {
  const total = parseFloat(document.getElementById('totalBudget')?.value) || 0;
  const spent = budgetEntries.reduce((s,e) => s+e.amount, 0);
  const pct   = total ? Math.min((spent/total)*100, 100) : 0;
  const color = pct > 90 ? '#e74c3c' : pct > 70 ? '#f39c12' : '#2d5a35';
  const list  = document.getElementById('budgetCategories');
  if (list) {
    list.innerHTML = budgetEntries.map(e => `
      <div class="budget-entry">
        <span class="budget-entry-name">📌 ${e.name} <small style="opacity:.6">${e.category}</small></span>
        <span class="budget-entry-amount">$${e.amount.toFixed(2)}</span>
        <button class="budget-entry-del" onclick="deleteBudgetEntry(${e.id})">✕</button>
      </div>`).join('') || '<p style="opacity:.5;font-size:.9rem">No expenses yet — add your first one!</p>';
  }
  const sumEl = document.getElementById('budgetSummary');
  if (sumEl && (total||spent)) {
    sumEl.innerHTML = `
      <p>💰 Budget: <strong>$${total.toLocaleString()}</strong> &nbsp; Spent: <strong>$${spent.toFixed(2)}</strong> &nbsp; Remaining: <strong style="color:${color}">$${Math.max(total-spent,0).toFixed(2)}</strong></p>
      <div class="budget-bar"><div class="budget-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <p style="font-size:.82rem;opacity:.8">${pct.toFixed(1)}% of budget used</p>`;
  }
}

function deleteBudgetEntry(id) {
  budgetEntries = budgetEntries.filter(e => e.id !== id);
  localStorage.setItem('wl_budget', JSON.stringify(budgetEntries));
  renderBudget();
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

function fetchWeather() {
  const city = document.getElementById('weatherCity').value.trim().toLowerCase();
  if (!city) { showToast('Enter a city name', 'warning'); return; }
  const data = weatherDB[city] || weatherDB[city.split(',')[0].trim()];
  const out  = document.getElementById('weatherOutput');
  if (!data) {
    out.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted)">
      <p>⚠️ Weather data not available for "${city}".</p>
      <p style="font-size:.85rem;margin-top:.5rem">Try: New York, Paris, Tokyo, Sydney, Dubai, or London</p>
    </div>`;
    return;
  }
  const dispCity = city.replace(/\b\w/g, l => l.toUpperCase());
  out.innerHTML = `
    <div class="weather-card">
      <span class="weather-icon">${data.icon}</span>
      <p style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.3rem">${dispCity}</p>
      <div class="weather-temp">${data.temp}°C</div>
      <p class="weather-desc">${data.condition} · Feels like ${data.feel}°C</p>
      <div class="weather-details">
        <div class="weather-detail"><span>💧 Humidity</span><span>${data.humidity}%</span></div>
        <div class="weather-detail"><span>💨 Wind</span><span>${data.wind} km/h</span></div>
        <div class="weather-detail"><span>🌡️ Feels Like</span><span>${data.feel}°C</span></div>
      </div>
      <div class="weather-forecast">
        ${data.forecast.map(f=>`<div class="forecast-day"><span class="f-day">${f.d}</span><span class="f-icon">${f.i}</span><span class="f-temp">${f.t}</span></div>`).join('')}
      </div>
    </div>`;
}
function quickWeather(city) {
  document.getElementById('weatherCity').value = city;
  fetchWeather();
}
function loadWeatherModal() {
  // Pre-load New York on open
  setTimeout(() => { document.getElementById('weatherCity').value='New York'; fetchWeather(); }, 100);
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

function searchHotels() {
  const city   = document.getElementById('hotelCity').value;
  const stars  = document.getElementById('hotelStars').value;
  const ci     = document.getElementById('hotelCheckin').value;
  const co     = document.getElementById('hotelCheckout').value;
  const nights = ci && co ? Math.max(1, (new Date(co)-new Date(ci))/(1000*60*60*24)) : 4;
  const res    = document.getElementById('hotelResults');
  res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">🔍 Searching hotels in ' + city + '…</p>';
  setTimeout(() => {
    const filtered = hotelNames.filter(h => stars==='any' || h.stars >= parseInt(stars));
    res.innerHTML = filtered.map(h => `
      <div class="hotel-card">
        <img class="hotel-card-img" src="${h.img}" alt="${h.n}">
        <div class="hotel-card-body">
          <div class="hotel-stars">${'★'.repeat(h.stars)}${'☆'.repeat(5-h.stars)}</div>
          <div class="hotel-name">${h.n}</div>
          <div class="hotel-location">📍 ${city} · Free WiFi · Breakfast included</div>
          <div class="hotel-footer">
            <div class="hotel-price">$${h.base}<small>/night</small><br><small style="font-size:.7rem;opacity:.6">Total: $${(h.base*nights).toLocaleString()} (${nights} nights)</small></div>
            <button class="book-hotel-btn" onclick="bookHotel('${h.n}','${h.base}')">Book →</button>
          </div>
        </div>
      </div>`).join('');
    if (!filtered.length) res.innerHTML = '<p style="text-align:center;padding:1rem;opacity:.6">No hotels found — try adjusting your filters.</p>';
  }, 1000);
}

function bookHotel(name, price) {
  showToast(`🏨 Redirecting to book ${name} from $${price}/night…`, 'info');
  setTimeout(() => window.open('https://www.hotels.com','_blank'), 1000);
}

/* ─────────────────────────────────────────────────────────
   26. FEATURE 7: DESTINATION QUIZ
───────────────────────────────────────────────────────── */
const quizQuestions = [
  {
    q:'What type of scenery do you love most?',
    opts:[{e:'🏖️',l:'Beaches & Oceans'},{e:'🏔️',l:'Mountains & Forests'},{e:'🏙️',l:'Cities & Culture'},{e:'🌵',l:'Deserts & Canyons'}]
  },
  {
    q:'How do you like to spend your days?',
    opts:[{e:'🏄',l:'Active & Outdoorsy'},{e:'🍽️',l:'Eating & Drinking'},{e:'🏛️',l:'Museums & History'},{e:'🧘',l:'Relaxing & Unwinding'}]
  },
  {
    q:"What's your ideal trip length?",
    opts:[{e:'⚡',l:'Long Weekend (3–4 days)'},{e:'📅',l:'1 Week'},{e:'🗓️',l:'2 Weeks'},{e:'🌍',l:'1 Month+'}]
  },
  {
    q:'What matters most to you when travelling?',
    opts:[{e:'💰',l:'Best Value for Money'},{e:'✨',l:'Luxury & Comfort'},{e:'🌿',l:'Eco-Friendly & Sustainable'},{e:'🔮',l:'Hidden Gems & Unique Finds'}]
  },
  {
    q:"What's your travel style?",
    opts:[{e:'🎯',l:'Planned & Organised'},{e:'🎲',l:'Spontaneous & Flexible'},{e:'👨‍👩‍👧',l:'Family-Friendly'},{e:'💑',l:'Romantic & Couples'}]
  }
];

const quizResults = [
  {dest:'Hawaii 🌺', desc:'White sand beaches, volcanic landscapes, and aloha spirit — Hawaii is your perfect match. You love the outdoors but also appreciate luxury and relaxation.', icon:'🌺'},
  {dest:'New York City 🗽', desc:'You crave culture, world-class food, and non-stop energy. NYC\'s neighbourhoods, museums, and iconic skyline were made for you.', icon:'🗽'},
  {dest:'Grand Canyon 🏜️', desc:'You seek awe-inspiring natural wonders and adventure. The Grand Canyon will blow your mind with its sheer scale and beauty.', icon:'🏜️'},
  {dest:'San Francisco 🌉', desc:'Creative, diverse, and beautiful — SF\'s blend of coastal scenery, incredible food, and vibrant culture suits you perfectly.', icon:'🌉'},
  {dest:'Yellowstone 🦬', desc:'A nature-lover at heart, you\'ll find paradise in Yellowstone\'s geysers, wildlife, and pristine wilderness.', icon:'🦬'},
];

let quizStep = 0, quizAnswers = [];

function startQuiz() {
  quizStep = 0; quizAnswers = [];
  const c = document.getElementById('quizContent');
  c.innerHTML = `
    <div class="quiz-intro">
      <h3>🧭 Find Your Perfect Destination</h3>
      <p>Answer 5 quick questions and we'll reveal your ideal travel match.</p>
      <button class="btn btn-primary" onclick="renderQuizQuestion()">Let's Go →</button>
    </div>`;
}

function renderQuizQuestion() {
  if (quizStep >= quizQuestions.length) { showQuizResult(); return; }
  const q = quizQuestions[quizStep];
  const c = document.getElementById('quizContent');
  const progress = quizQuestions.map((_,i) =>
    `<div class="quiz-progress-step${i<quizStep?' done':''}"></div>`).join('');
  c.innerHTML = `
    <div class="quiz-progress">${progress}</div>
    <p style="font-size:.82rem;color:var(--text-muted);text-align:center;margin-bottom:.5rem">Question ${quizStep+1} of ${quizQuestions.length}</p>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.opts.map((o,i) => `<button class="quiz-opt" onclick="answerQuiz(${i})"><span>${o.e}</span>${o.l}</button>`).join('')}
    </div>`;
}

function answerQuiz(i) {
  quizAnswers.push(i); quizStep++;
  renderQuizQuestion();
}

function showQuizResult() {
  const r = quizResults[quizAnswers.reduce((s,a)=>s+a,0) % quizResults.length];
  const c = document.getElementById('quizContent');
  c.innerHTML = `
    <div class="quiz-result">
      <span class="quiz-result-icon">${r.icon}</span>
      <h3>Your Perfect Destination Is…<br>${r.dest}</h3>
      <p>${r.desc}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="closeModal('quizModal'); scrollTo('destinations')">🗺️ Explore Now</button>
        <button class="btn btn-outline" onclick="startQuiz()">🔄 Try Again</button>
      </div>
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

function checkVisa() {
  const from = document.getElementById('visaFrom').value;
  const to   = document.getElementById('visaTo').value;
  const key  = `${from}→${to}`;
  const data = visaDB[key];
  const out  = document.getElementById('visaOutput');
  if (!data) {
    out.innerHTML = `<div class="visa-card">
      <div class="visa-status required">⚠️ Please verify requirements</div>
      <div class="visa-details">
        <h4>Requirements for ${from} → ${to}</h4>
        <p style="font-size:.88rem;color:var(--text-secondary)">We don't have specific data for this combination. Please check the official embassy website or a service like iVisa.com for the most current requirements.</p>
        <div style="margin-top:1rem"><a href="https://www.iata.org/en/publications/timatic/" target="_blank" style="color:var(--green-mid);font-weight:700">Check IATA Timatic (Official) →</a></div>
      </div>
    </div>`;
    return;
  }
  const countryNames = {US:'🇺🇸 USA',UK:'🇬🇧 UK',EU:'🇪🇺 EU',IN:'🇮🇳 India',CN:'🇨🇳 China',AU:'🇦🇺 Australia',CA:'🇨🇦 Canada',JP:'🇯🇵 Japan',FR:'🇫🇷 France',TH:'🇹🇭 Thailand',AE:'🇦🇪 UAE',SG:'🇸🇬 Singapore',MX:'🇲🇽 Mexico',BR:'🇧🇷 Brazil',ZA:'🇿🇦 South Africa'};
  out.innerHTML = `
    <div class="visa-card">
      <div class="visa-status ${data.status}">${data.status==='free'?'✅':data.status==='on-arrival'?'🟡':'❗'} ${data.label}</div>
      <div class="visa-details">
        <h4>${countryNames[from]||from} → ${countryNames[to]||to}</h4>
        <div class="visa-detail-row"><span>Duration of Stay</span><span>${data.duration}</span></div>
        <div class="visa-detail-row"><span>Processing Time</span><span>${data.processing}</span></div>
        <div class="visa-detail-row"><span>Visa Cost</span><span>${data.cost}</span></div>
        <div style="margin-top:1rem;padding:1rem;background:var(--bg-sand);border-radius:var(--r-sm);font-size:.88rem;color:var(--text-secondary)">
          <strong style="color:var(--text-primary)">📋 Important Notes:</strong><br><br>${data.notes}
        </div>
        <p style="font-size:.75rem;color:var(--text-muted);margin-top:.75rem">⚠️ Information is indicative only. Always verify with the official embassy before travel.</p>
      </div>
    </div>`;
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
   29. FEATURE 10: PHRASE BOOK
───────────────────────────────────────────────────────── */
const phrasesDB = {
  es:{
    essentials:[
      ['Hello','Hola'],['Thank you','Gracias'],['Please','Por favor'],['Excuse me','Perdone'],
      ['Yes / No','Sí / No'],["I don't understand",'No entiendo'],['Do you speak English?','¿Habla inglés?'],
      ['Where is the bathroom?','¿Dónde está el baño?'],['How much does it cost?','¿Cuánto cuesta?']
    ],
    food:[['The menu, please','La carta, por favor'],['I am vegetarian','Soy vegetariano/a'],['Water, please','Agua, por favor'],['The bill, please','La cuenta, por favor'],['Delicious!','¡Delicioso!'],['Cheers!','¡Salud!']],
    transport:[['Where is the metro?','¿Dónde está el metro?'],['A ticket to…','Un billete a…'],['How far is it?','¿A qué distancia está?'],['Turn left/right','Gire a la izquierda/derecha'],['Stop here, please','Para aquí, por favor']],
    hotel:[['I have a reservation','Tengo una reserva'],['Check-in / Check-out','Entrada / Salida'],['Room service, please','Servicio de habitaciones'],['Do you have Wi-Fi?','¿Tiene Wi-Fi?'],['The key, please','La llave, por favor']],
    emergency:[['Help!','¡Socorro!'],['Call the police!','¡Llame a la policía!'],['I need a doctor','Necesito un médico'],['Fire!','¡Fuego!'],["I'm lost",'Estoy perdido/a']]
  },
  fr:{
    essentials:[['Hello','Bonjour'],['Thank you','Merci'],['Please','S\'il vous plaît'],['Excuse me','Excusez-moi'],['Yes / No','Oui / Non'],["I don't understand",'Je ne comprends pas'],['Do you speak English?','Parlez-vous anglais?'],['Where is the toilet?','Où sont les toilettes?'],['How much?','Combien ça coûte?']],
    food:[['The menu, please','La carte, s\'il vous plaît'],['I am vegetarian','Je suis végétarien(ne)'],['Water, please','De l\'eau, s\'il vous plaît'],['The bill, please','L\'addition, s\'il vous plaît'],['Delicious!','Délicieux!'],['Cheers!','Santé!']],
    transport:[['Where is the metro?','Où est le métro?'],['A ticket to…','Un billet pour…'],['How far?','C\'est loin?'],['Turn left/right','Tournez à gauche/droite'],['Stop here, please','Arrêtez ici, s\'il vous plaît']],
    hotel:[['I have a reservation','J\'ai une réservation'],['Check-in / Check-out','Arrivée / Départ'],['Room service','Service en chambre'],['Do you have Wi-Fi?','Avez-vous le Wi-Fi?'],['The key, please','La clé, s\'il vous plaît']],
    emergency:[['Help!','Au secours!'],['Call the police!','Appelez la police!'],['I need a doctor','J\'ai besoin d\'un médecin'],['Fire!','Au feu!'],["I'm lost",'Je suis perdu(e)']]
  },
  jp:{
    essentials:[['Hello','Konnichiwa (こんにちは)'],['Thank you','Arigatou gozaimasu (ありがとうございます)'],['Please','Onegaishimasu (おねがいします)'],['Excuse me','Sumimasen (すみません)'],['Yes / No','Hai / Iie (はい / いいえ)'],["I don't understand",'Wakarimasen (わかりません)'],['Do you speak English?','Eigo wo hanasemasuka? (英語を話せますか？)'],['Where is the toilet?','Toire wa doko desu ka? (トイレはどこですか？)'],['How much?','Ikura desu ka? (いくらですか？)']],
    food:[['The menu, please','Menyu wo kudasai (メニューをください)'],['I have allergies','Arerugi ga arimasu (アレルギーがあります)'],['Water, please','Mizu wo kudasai (水をください)'],['The bill, please','Okaikei onegaishimasu (お会計おねがいします)'],['Delicious!','Oishii! (おいしい！)'],['Cheers!','Kanpai! (乾杯！)']],
    transport:[['Where is the station?','Eki wa doko desu ka? (駅はどこですか？)'],['One ticket to…','…made ichi-mai (…まで一枚)'],['How far?','Dono kurai tooi desu ka? (どのくらい遠いですか？)'],['Turn left/right','Hidari/Migi ni magatte (左/右に曲がって)'],['Stop here, please','Koko de tomete kudasai (ここで止めてください)']],
    hotel:[['I have a reservation','Yoyaku ga arimasu (予約があります)'],['Check-in','Chekku in (チェックイン)'],['Room service','Rumu saabisu (ルームサービス)'],['Wi-Fi password?','Wi-Fi no pasuwaado wa? (Wi-Fiのパスワードは？)'],['The key, please','Kagi wo kudasai (鍵をください)']],
    emergency:[['Help!','Tasukete! (助けて！)'],['Call the police!','Keisatsu wo yonde! (警察を呼んで！)'],['I need a doctor','Isha ga hitsuyou desu (医者が必要です)'],['Fire!','Kaji! (火事！)'],["I'm lost",'Michi ni mayoimashita (道に迷いました)']]
  },
  de:{
    essentials:[['Hello','Hallo'],['Thank you','Danke schön'],['Please','Bitte'],['Excuse me','Entschuldigung'],['Yes / No','Ja / Nein'],["I don't understand",'Ich verstehe nicht'],['Do you speak English?','Sprechen Sie Englisch?'],['Where is the toilet?','Wo ist die Toilette?'],['How much?','Wie viel kostet das?']],
    food:[['The menu, please','Die Speisekarte, bitte'],['I am vegetarian','Ich bin Vegetarier/in'],['Water, please','Wasser, bitte'],['The bill, please','Die Rechnung, bitte'],['Delicious!','Lecker!'],['Cheers!','Prost!']],
    transport:[['Where is the station?','Wo ist der Bahnhof?'],['A ticket to…','Eine Fahrkarte nach…'],['How far?','Wie weit ist es?'],['Turn left/right','Links/Rechts abbiegen'],['Stop here, please','Hier anhalten, bitte']],
    hotel:[['I have a reservation','Ich habe eine Reservierung'],['Check-in / Check-out','Ein-/Auschecken'],['Room service','Zimmerservice'],['Do you have Wi-Fi?','Haben Sie WLAN?'],['The key, please','Den Schlüssel, bitte']],
    emergency:[['Help!','Hilfe!'],['Call the police!','Rufen Sie die Polizei!'],['I need a doctor','Ich brauche einen Arzt'],['Fire!','Feuer!'],["I'm lost",'Ich habe mich verlaufen']]
  },
  it:{ essentials:[['Hello','Ciao / Buongiorno'],['Thank you','Grazie'],['Please','Per favore'],['Excuse me','Mi scusi'],['Yes / No','Sì / No'],["I don't understand",'Non capisco'],['Do you speak English?','Parla inglese?'],['Where is the toilet?','Dov\'è il bagno?'],['How much?','Quanto costa?']], food:[['The menu, please','Il menù, per favore'],['I am vegetarian','Sono vegetariano/a'],['Water, please','Acqua, per favore'],['The bill, please','Il conto, per favore'],['Delicious!','Delizioso!'],['Cheers!','Salute!']], transport:[['Where is the station?','Dov\'è la stazione?'],['A ticket to…','Un biglietto per…'],['How far?','Quanto è lontano?'],['Turn left/right','Giri a sinistra/destra'],['Stop here, please','Si fermi qui, per favore']], hotel:[['I have a reservation','Ho una prenotazione'],['Check-in / Check-out','Check-in / Check-out'],['Room service','Servizio in camera'],['Do you have Wi-Fi?','Avete il Wi-Fi?'],['The key, please','La chiave, per favore']], emergency:[['Help!','Aiuto!'],['Call the police!','Chiami la polizia!'],['I need a doctor','Ho bisogno di un medico'],['Fire!','Fuoco!'],["I'm lost",'Mi sono perso/a']] },
  pt:{ essentials:[['Hello','Olá'],['Thank you','Obrigado/a'],['Please','Por favor'],['Excuse me','Com licença'],['Yes / No','Sim / Não'],["I don't understand",'Não entendo'],['Do you speak English?','Fala inglês?'],['Where is the toilet?','Onde é o banheiro?'],['How much?','Quanto custa?']], food:[['The menu, please','O cardápio, por favor'],['I am vegetarian','Sou vegetariano/a'],['Water, please','Água, por favor'],['The bill, please','A conta, por favor'],['Delicious!','Delicioso!'],['Cheers!','Saúde!']], transport:[['Where is the station?','Onde é a estação?'],['A ticket to…','Uma passagem para…'],['How far?','Qual a distância?'],['Turn left/right','Vire à esquerda/direita'],['Stop here, please','Pare aqui, por favor']], hotel:[['I have a reservation','Tenho uma reserva'],['Check-in / Check-out','Check-in / Check-out'],['Room service','Serviço de quarto'],['Do you have Wi-Fi?','Tem Wi-Fi?'],['The key, please','A chave, por favor']], emergency:[['Help!','Socorro!'],['Call the police!','Chame a polícia!'],['I need a doctor','Preciso de um médico'],['Fire!','Fogo!'],["I'm lost",'Estou perdido/a']] },
  zh:{ essentials:[['Hello','Nǐ hǎo (你好)'],['Thank you','Xièxiè (谢谢)'],['Please','Qǐng (请)'],['Excuse me','Láojià (劳驾)'],['Yes / No','Shì / Bù (是/不)'],["I don't understand",'Wǒ bù dǒng (我不懂)'],['Do you speak English?','Nǐ huì shuō Yīngyǔ ma? (你会说英语吗？)'],['Where is the toilet?','Cèsuǒ zài nǎlǐ? (厕所在哪里？)'],['How much?','Duōshǎo qián? (多少钱？)']], food:[['The menu, please','Càidān, qǐng (菜单，请)'],['I am vegetarian','Wǒ chī sù (我吃素)'],['Water, please','Shuǐ, qǐng (水，请)'],['The bill, please','Mǎidān (买单)'],['Delicious!','Hǎochī! (好吃！)'],['Cheers!','Gānbēi! (干杯！)']], transport:[['Where is the metro?','Dìtiě zài nǎlǐ? (地铁在哪里？)'],['A ticket to…','Yī zhāng qù…de piào (一张去…的票)'],['How far?','Yǒu duō yuǎn? (有多远？)'],['Turn left/right','Zhuǎn zuǒ/yòu (转左/右)'],['Stop here','Zài zhèlǐ tíng (在这里停)']], hotel:[['I have a reservation','Wǒ yǒu yùdìng (我有预订)'],['Check-in','Rùzhù (入住)'],['Room service','Kèfáng fúwù (客房服务)'],['Wi-Fi password?','Wi-Fi mìmǎ? (Wi-Fi密码？)'],['The key, please','Yàoshi, qǐng (钥匙，请)']], emergency:[['Help!','Jiùmìng! (救命！)'],['Call the police!','Jiào jǐngchá! (叫警察！)'],['I need a doctor','Wǒ xūyào yīshēng (我需要医生)'],['Fire!','Zháohuǒ! (着火！)'],["I'm lost",'Wǒ mílù le (我迷路了)']] },
  ar:{ essentials:[['Hello','Marhaba (مرحبا)'],['Thank you','Shukran (شكراً)'],['Please','Min fadlak (من فضلك)'],['Excuse me','Ma\'adhira (معذرة)'],['Yes / No','Na\'am / La (نعم / لا)'],["I don't understand",'La afham (لا أفهم)'],['Do you speak English?','Hal tatakallam al-ingliziyya? (هل تتكلم الإنجليزية؟)'],['Where is the toilet?','Ayna al-hammam? (أين الحمام؟)'],['How much?','Bikam? (بكم؟)']], food:[['The menu, please','Al-qāʾima, min fadlak (القائمة، من فضلك)'],['I am vegetarian','Ana nabati (أنا نباتي)'],['Water, please','Maa, min fadlak (ماء، من فضلك)'],['The bill, please','Al-hisab, min fadlak (الحساب، من فضلك)'],['Delicious!','Ladhidh! (لذيذ!)'],['Cheers!','Fi sahitak! (في صحتك!)']], transport:[['Where is the metro?','Ayna al-metro? (أين المترو؟)'],['A ticket to…','Tadhkara ila… (تذكرة إلى…)'],['How far?','Kam yab\'ud? (كم يبعد؟)'],['Turn left/right','Ilfa yasaran/yameenan (إلفع يساراً/يميناً)'],['Stop here','Qif huna (قف هنا)']], hotel:[['I have a reservation','Ladaya hajz (لدي حجز)'],['Check-in / Check-out','Tadsjil dukhul/khuruj (تسجيل دخول/خروج)'],['Room service','Khadmat al-ghurfa (خدمة الغرفة)'],['Do you have Wi-Fi?','Hal ladaykum Wi-Fi? (هل لديكم Wi-Fi؟)'],['The key, please','Al-miftah, min fadlak (المفتاح، من فضلك)']], emergency:[['Help!','Najdah! (نجدة!)'],['Call the police!','Ittasil bialshurta! (اتصل بالشرطة!)'],['I need a doctor','Ahtaj tabib (أحتاج طبيب)'],['Fire!','Hareeq! (حريق!)'],["I'm lost",'Ana da\'il (أنا ضائع)']] }
};

function loadPhrases() {
  const lang = document.getElementById('phraseLanguage')?.value;
  const cat  = document.getElementById('phraseCategory')?.value;
  const out  = document.getElementById('phraseOutput');
  if (!lang || !cat || !out) return;
  const data = phrasesDB[lang]?.[cat] || [];
  if (!data.length) { out.innerHTML='<p>No phrases available.</p>'; return; }
  out.innerHTML = data.map(([en, tr], i) => `
    <div class="phrase-item" onclick="speakPhrase('${tr.replace(/\(.*?\)/g,'').trim()}')">
      <span class="phrase-en">${en}</span>
      <span class="phrase-tr">${tr}</span>
      <button class="phrase-speak" title="Hear pronunciation">🔊</button>
    </div>`).join('');
}

function speakPhrase(text) {
  const clean = text.replace(/\(.*?\)/g,'').trim();
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(clean);
    const langMap = {es:'es-ES',fr:'fr-FR',jp:'ja-JP',de:'de-DE',it:'it-IT',pt:'pt-BR',zh:'zh-CN',ar:'ar-SA'};
    u.lang = langMap[document.getElementById('phraseLanguage').value] || 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    showToast(`🔊 Playing: "${clean}"`, 'info');
  } else {
    showToast('🔊 Speech not supported in this browser', 'warning');
  }
}

/* ─────────────────────────────────────────────────────────
   30. FEATURE 11: TRAVEL DIARY
───────────────────────────────────────────────────────── */
let diaryEntries = JSON.parse(localStorage.getItem('wl_diary')||'[]');
let selectedMood = '😊';

document.querySelectorAll('.mood-btn').forEach(b => {
  b.addEventListener('click', function() {
    document.querySelectorAll('.mood-btn').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    selectedMood = this.dataset.mood;
  });
});

function saveDiaryEntry() {
  const city = document.getElementById('diaryCity')?.value?.trim();
  const date = document.getElementById('diaryDate')?.value;
  const text = document.getElementById('diaryText')?.value?.trim();
  if (!city || !text) { showToast('Please enter a city and journal entry', 'warning'); return; }
  diaryEntries.unshift({ id:Date.now(), city, date: date || new Date().toLocaleDateString(), mood:selectedMood, text });
  localStorage.setItem('wl_diary', JSON.stringify(diaryEntries));
  document.getElementById('diaryCity').value = '';
  document.getElementById('diaryDate').value = '';
  document.getElementById('diaryText').value = '';
  loadDiaryEntries();
  showToast('Diary entry saved! 📖');
}

function loadDiaryEntries() {
  const out = document.getElementById('diaryEntries');
  if (!out) return;
  if (!diaryEntries.length) {
    out.innerHTML='<p style="text-align:center;opacity:.5;padding:1rem">No entries yet — start writing your travel story!</p>'; return;
  }
  out.innerHTML = diaryEntries.map(e => `
    <div class="diary-entry">
      <div class="diary-entry-head">
        <div>
          <span class="diary-entry-city">${e.mood} ${e.city}</span>
          <div class="diary-entry-meta">📅 ${e.date}</div>
        </div>
        <button class="diary-entry-del" onclick="deleteDiaryEntry(${e.id})">🗑</button>
      </div>
      <div class="diary-entry-body">${e.text}</div>
    </div>`).join('');
}

function deleteDiaryEntry(id) {
  diaryEntries = diaryEntries.filter(e => e.id!==id);
  localStorage.setItem('wl_diary', JSON.stringify(diaryEntries));
  loadDiaryEntries();
}

/* ─────────────────────────────────────────────────────────
   31. SCROLL ANIMATIONS & COUNTERS
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
  // AOS
  if (window.AOS) AOS.init({ duration:700, easing:'ease-in-out', once:true, offset:80 });

  // Dark mode
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    if (localStorage.getItem('wl_dark')==='1') document.body.classList.add('dark-mode');
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('wl_dark', document.body.classList.contains('dark-mode')?'1':'0');
    });
  }

  // Date inputs
  const today = new Date().toISOString().split('T')[0];
  ['checkin','checkout'].forEach(id => { const el=document.getElementById(id); if(el) el.min=today; });
  document.getElementById('checkin')?.addEventListener('change', function() {
    const co = document.getElementById('checkout');
    if (co) co.min = this.value;
  });

  // Load saved data
  loadSavedTrips();

  // Hero video
  const vid = document.querySelector('.hero-video');
  if (vid) vid.play().catch(()=>{});

  // Keyboard: Escape to close modals
  document.addEventListener('keydown', e => {
    if (e.key==='Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
      closeMapModal(); closeDestinationMap();
    }
  });

  // Search input enter key
  document.getElementById('heroSearch')?.addEventListener('keypress', e => {
    if (e.key==='Enter') handleHeroSearch();
  });
});