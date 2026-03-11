// Initialize map
const map = L.map("map").setView([20, 0], 2);

// Custom dark tile layer
const darkTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; OpenStreetMap contributors'
});

const lightTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
});

// Add default tiles
darkTiles.addTo(map);

let trip = [];
let markers = [];
let polyline = null;
let savedTrips = [];
let searchTimeout;
let currentTheme = 'dark';

// Load saved trips on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTrips();
  updateStats();
  
  // Check for saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    toggleTheme();
  }
});

// Theme toggle
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  if (currentTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    map.removeLayer(darkTiles);
    lightTiles.addTo(map);
  } else {
    document.body.removeAttribute('data-theme');
    map.removeLayer(lightTiles);
    darkTiles.addTo(map);
  }
  
  localStorage.setItem('theme', currentTheme);
}

// Tab switching
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  if (tabName === 'saved') {
    loadSavedTrips();
  }
}

// Live search suggestions
document.getElementById('place').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  clearTimeout(searchTimeout);
  
  if (query.length < 3) {
    hideSuggestions();
    return;
  }
  
  searchTimeout = setTimeout(() => {
    searchPlaces(query);
  }, 300);
});

function searchPlaces(query) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`)
    .then(res => res.json())
    .then(data => {
      showSuggestions(data);
    })
    .catch(err => {
      console.error('Search error:', err);
      hideSuggestions();
    });
}

function showSuggestions(results) {
  const suggestionsDiv = document.getElementById('suggestions');
  
  if (!results || results.length === 0) {
    hideSuggestions();
    return;
  }
  
  suggestionsDiv.innerHTML = results.map(place => `
    <div class="suggestion-item" onclick="selectSuggestion('${place.display_name.replace(/'/g, "\\'")}', ${place.lat}, ${place.lon})">
      <div class="suggestion-name">${place.display_name.split(',')[0]}</div>
      <div class="suggestion-details">${place.display_name}</div>
    </div>
  `).join('');
  
  suggestionsDiv.classList.add('active');
}

function hideSuggestions() {
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.classList.remove('active');
  suggestionsDiv.innerHTML = '';
}

function selectSuggestion(name, lat, lon) {
  document.getElementById('place').value = name;
  hideSuggestions();
  addPlaceWithCoords(name, parseFloat(lat), parseFloat(lon));
}

// Add place (from input)
function addPlace() {
  const place = document.getElementById('place').value.trim();
  
  if (!place) {
    showNotification('Please enter a location', 'error');
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}&limit=1`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        showNotification('Location not found. Try being more specific.', 'error');
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const displayName = data[0].display_name;

      addPlaceWithCoords(displayName, lat, lon);
      document.getElementById('place').value = '';
      hideSuggestions();
    })
    .catch(err => {
      console.error('Error:', err);
      showNotification('Error adding location', 'error');
    });
}

// Add place with coordinates
function addPlaceWithCoords(name, lat, lon) {
  // Create custom marker icon
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-weight: bold;
          font-size: 12px;
          transform: rotate(45deg);
        ">${trip.length + 1}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const marker = L.marker([lat, lon], { icon: customIcon })
    .addTo(map)
    .bindPopup(`<strong>${name}</strong>`);
  
  markers.push(marker);
  trip.push({ name, lat, lon });
  
  updateUI();
  updatePolyline();
  
  // Fit bounds to show all markers
  if (markers.length > 1) {
    fitBounds();
  } else {
    map.setView([lat, lon], 10);
  }
  
  showNotification(`Added ${name.split(',')[0]}`, 'success');
}

// Update UI
function updateUI() {
  updateTripList();
  updateDistance();
  updateStats();
  
  // Toggle empty state
  const emptyState = document.getElementById('emptyState');
  if (trip.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }
}

// Update trip list
function updateTripList() {
  const list = document.getElementById('tripList');
  list.innerHTML = '';

  trip.forEach((p, i) => {
    const li = document.createElement('li');
    li.draggable = true;
    li.style.animationDelay = `${i * 0.05}s`;

    li.innerHTML = `
      <div class="trip-number">${i + 1}</div>
      <div class="trip-info">
        <div class="trip-name">${p.name.split(',')[0]}</div>
        <div class="trip-coords">${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}</div>
      </div>
      <button class="delete-btn" onclick="removePlace(${i})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    li.ondragstart = e => {
      e.dataTransfer.setData('index', i);
      li.classList.add('dragging');
    };
    
    li.ondragend = e => {
      li.classList.remove('dragging');
    };
    
    li.ondragover = e => {
      e.preventDefault();
    };
    
    li.ondrop = e => {
      e.preventDefault();
      reorder(e, i);
    };

    list.appendChild(li);
  });
}

// Reorder items
function reorder(e, newIndex) {
  const oldIndex = parseInt(e.dataTransfer.getData('index'));
  
  if (oldIndex === newIndex) return;
  
  const [item] = trip.splice(oldIndex, 1);
  const [marker] = markers.splice(oldIndex, 1);
  
  trip.splice(newIndex, 0, item);
  markers.splice(newIndex, 0, marker);
  
  updateUI();
  updatePolyline();
  updateMarkerNumbers();
}

// Update marker numbers after reorder
function updateMarkerNumbers() {
  markers.forEach((marker, i) => {
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            color: white;
            font-weight: bold;
            font-size: 12px;
            transform: rotate(45deg);
          ">${i + 1}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    
    marker.setIcon(customIcon);
  });
}

// Remove place
function removePlace(i) {
  map.removeLayer(markers[i]);
  markers.splice(i, 1);
  trip.splice(i, 1);
  
  updateUI();
  updatePolyline();
  updateMarkerNumbers();
  
  showNotification('Location removed', 'success');
}

// Clear all
function clearAll() {
  if (trip.length === 0) return;
  
  if (confirm('Clear all locations?')) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    trip = [];
    
    if (polyline) {
      map.removeLayer(polyline);
      polyline = null;
    }
    
    updateUI();
    showNotification('All locations cleared', 'success');
  }
}

// Update polyline
function updatePolyline() {
  if (polyline) {
    map.removeLayer(polyline);
  }
  
  if (trip.length < 2) return;
  
  const coords = trip.map(p => [p.lat, p.lon]);
  
  polyline = L.polyline(coords, {
    color: '#00d4ff',
    weight: 3,
    opacity: 0.7,
    smoothFactor: 1,
    dashArray: '10, 10',
    dashOffset: '0'
  }).addTo(map);
  
  // Animate dash
  let offset = 0;
  setInterval(() => {
    offset += 1;
    if (polyline) {
      polyline.setStyle({ dashOffset: offset });
    }
  }, 50);
}

// Update distance
function updateDistance() {
  let totalDistance = 0;
  
  for (let i = 1; i < trip.length; i++) {
    totalDistance += calculateDistance(trip[i - 1], trip[i]);
  }
  
  document.getElementById('distance').innerText = totalDistance.toFixed(2) + ' km';
  document.getElementById('totalDistance').innerText = totalDistance.toFixed(0);
}

// Calculate distance using Haversine formula
function calculateDistance(a, b) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * 
            Math.cos(lat1) * Math.cos(lat2);
  
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  
  return R * c;
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

// Fit bounds to show all markers
function fitBounds() {
  if (markers.length === 0) return;
  
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.1));
}

// Update stats
function updateStats() {
  document.getElementById('totalPlaces').innerText = trip.length;
  document.getElementById('totalTrips').innerText = savedTrips.length;
}

// Save trip
function saveTrip() {
  if (trip.length === 0) {
    showNotification('Add some locations first!', 'error');
    return;
  }
  
  const tripName = document.getElementById('tripName').value.trim() || 
                   `Trip to ${trip[0].name.split(',')[0]}`;
  
  const tripData = {
    name: tripName,
    locations: trip,
    createdAt: new Date().toISOString(),
    totalDistance: calculateTotalDistance()
  };
  
  // Save to backend
  fetch('http://127.0.0.1:5001/save-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData)
  })
  .then(res => res.json())
  .then(data => {
    showNotification(`Trip "${tripName}" saved successfully!`, 'success');
    
    // Also save locally
    savedTrips.push(tripData);
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    
    updateStats();
    document.getElementById('tripName').value = '';
  })
  .catch(err => {
    // Fallback to local storage if backend is not available
    console.error('Backend error, saving locally:', err);
    
    savedTrips.push(tripData);
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    
    showNotification(`Trip "${tripName}" saved locally!`, 'success');
    updateStats();
    document.getElementById('tripName').value = '';
  });
}

function calculateTotalDistance() {
  let total = 0;
  for (let i = 1; i < trip.length; i++) {
    total += calculateDistance(trip[i - 1], trip[i]);
  }
  return total;
}

// Load saved trips
function loadSavedTrips() {
  // Try loading from backend first
  fetch('http://127.0.0.1:5001/get-trips')
    .then(res => res.json())
    .then(data => {
      if (data.trips && data.trips.length > 0) {
        savedTrips = data.trips;
      } else {
        // Fallback to localStorage
        const localTrips = localStorage.getItem('savedTrips');
        savedTrips = localTrips ? JSON.parse(localTrips) : [];
      }
      displaySavedTrips();
      updateStats();
    })
    .catch(err => {
      // Fallback to localStorage
      console.error('Backend error, loading from localStorage:', err);
      const localTrips = localStorage.getItem('savedTrips');
      savedTrips = localTrips ? JSON.parse(localTrips) : [];
      displaySavedTrips();
      updateStats();
    });
}

// Display saved trips
function displaySavedTrips() {
  const container = document.getElementById('savedTrips');
  const emptyState = document.getElementById('savedEmptyState');
  
  if (savedTrips.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  
  container.innerHTML = savedTrips.map((trip, index) => {
    const date = new Date(trip.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `
      <div class="trip-card" style="animation-delay: ${index * 0.05}s">
        <div class="trip-card-header">
          <div>
            <div class="trip-card-title">${trip.name}</div>
            <div class="trip-card-date">${date}</div>
          </div>
          <div class="trip-card-actions">
            <button class="trip-card-btn" onclick="loadTrip(${index})" title="Load trip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="trip-card-btn delete" onclick="deleteTrip(${index})" title="Delete trip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="trip-card-locations">
          ${trip.locations.slice(0, 3).map((loc, i) => `
            <div class="location-item">
              <div class="location-number">${i + 1}</div>
              <div class="location-name">${loc.name.split(',')[0]}</div>
            </div>
          `).join('')}
          ${trip.locations.length > 3 ? `
            <div class="location-item" style="opacity: 0.6;">
              <div class="location-number">+</div>
              <div class="location-name">${trip.locations.length - 3} more locations</div>
            </div>
          ` : ''}
        </div>
        
        <div class="trip-card-stats">
          <div class="trip-stat">
            <div class="trip-stat-value">${trip.locations.length}</div>
            <div class="trip-stat-label">Stops</div>
          </div>
          <div class="trip-stat">
            <div class="trip-stat-value">${trip.totalDistance.toFixed(0)}</div>
            <div class="trip-stat-label">km</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Load a saved trip
function loadTrip(index) {
  const savedTrip = savedTrips[index];
  
  // Clear current trip
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  trip = [];
  
  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }
  
  // Load saved locations
  savedTrip.locations.forEach(loc => {
    addPlaceWithCoords(loc.name, loc.lat, loc.lon);
  });
  
  // Switch to planner tab
  showTab('planner');
  
  // Set trip name
  document.getElementById('tripName').value = savedTrip.name;
  
  showNotification(`Loaded "${savedTrip.name}"`, 'success');
}

// Delete a saved trip
function deleteTrip(index) {
  if (!confirm('Delete this trip?')) return;
  
  const tripName = savedTrips[index].name;
  
  savedTrips.splice(index, 1);
  localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
  
  displaySavedTrips();
  updateStats();
  
  showNotification(`Deleted "${tripName}"`, 'success');
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Trigger reflow
  notification.offsetHeight;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Handle Enter key in search
document.getElementById('place').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addPlace();
  }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box') && !e.target.closest('.suggestions')) {
    hideSuggestions();
  }
});