import os
import requests
import time
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

flighttracker_bp = Blueprint('flighttracker', __name__)

# OpenSky Network API config
OPENSKY_BASE = "https://opensky-network.org/api"
OPENSKY_USER = os.getenv('OPENSKY_USER', '')
OPENSKY_PASS = os.getenv('OPENSKY_PASS', '')

# Region bounding boxes (latitude, longitude)
REGIONS = {
    'usa': {'lamin': 24.0, 'lomin': -125.0, 'lamax': 49.0, 'lomax': -66.0},
    'europe': {'lamin': 35.0, 'lomin': -10.0, 'lamax': 70.0, 'lomax': 40.0},
    'eastcoast': {'lamin': 25.0, 'lomin': -85.0, 'lamax': 47.0, 'lomax': -65.0},
    'westcoast': {'lamin': 32.0, 'lomin': -125.0, 'lamax': 49.0, 'lomax': -115.0},
    'midwest': {'lamin': 36.0, 'lomin': -104.0, 'lamax': 49.0, 'lomax': -80.0},
}

# Major US Airports
AIRPORTS = {
    "JFK": {"name": "John F. Kennedy International", "city": "New York", "lat": 40.6413, "lon": -73.7781, "timezone": "EST"},
    "LAX": {"name": "Los Angeles International", "city": "Los Angeles", "lat": 33.9416, "lon": -118.4085, "timezone": "PST"},
    "ORD": {"name": "O'Hare International", "city": "Chicago", "lat": 41.9742, "lon": -87.9073, "timezone": "CST"},
    "ATL": {"name": "Hartsfield-Jackson Atlanta", "city": "Atlanta", "lat": 33.6407, "lon": -84.4277, "timezone": "EST"},
    "DFW": {"name": "Dallas Fort Worth International", "city": "Dallas", "lat": 32.8998, "lon": -97.0403, "timezone": "CST"},
    "DEN": {"name": "Denver International", "city": "Denver", "lat": 39.8561, "lon": -104.6737, "timezone": "MST"},
    "SFO": {"name": "San Francisco International", "city": "San Francisco", "lat": 37.6213, "lon": -122.3790, "timezone": "PST"},
    "SEA": {"name": "Seattle-Tacoma International", "city": "Seattle", "lat": 47.4502, "lon": -122.3088, "timezone": "PST"},
    "MIA": {"name": "Miami International", "city": "Miami", "lat": 25.7959, "lon": -80.2870, "timezone": "EST"},
    "BOS": {"name": "Boston Logan International", "city": "Boston", "lat": 42.3656, "lon": -71.0096, "timezone": "EST"},
    "LAS": {"name": "Harry Reid International", "city": "Las Vegas", "lat": 36.0840, "lon": -115.1537, "timezone": "PST"},
    "MCO": {"name": "Orlando International", "city": "Orlando", "lat": 28.4312, "lon": -81.3081, "timezone": "EST"},
    "PHX": {"name": "Phoenix Sky Harbor", "city": "Phoenix", "lat": 33.4352, "lon": -112.0101, "timezone": "MST"},
    "HNL": {"name": "Daniel K Inouye International", "city": "Honolulu", "lat": 21.3187, "lon": -157.9225, "timezone": "HST"},
}

def get_auth():
    """Return auth tuple if credentials available, else None"""
    if OPENSKY_USER and OPENSKY_PASS:
        return (OPENSKY_USER, OPENSKY_PASS)
    return None

@flighttracker_bp.route('/search', methods=['GET'])
def search_flight():
    """Search for a specific flight by number"""
    flight = request.args.get('flight', '').upper().strip()
    
    if not flight:
        return jsonify({'error': 'flight parameter required', 'found': False}), 400
    
    try:
        # Get flights from last 2 hours
        now = int(time.time())
        begin_time = now - 7200
        
        params = {
            'begin': begin_time,
            'end': now
        }
        
        url = f"{OPENSKY_BASE}/flights/all"
        auth = get_auth()
        
        response = requests.get(url, params=params, auth=auth, timeout=10)
        response.raise_for_status()
        
        flights = response.json()
        if not flights:
            return jsonify({'found': False})
        
        # Search for flight (callsign is like 'AAL100 ' with trailing spaces)
        for f in flights:
            callsign = (f.get('callsign') or '').strip()
            flight_num = f.get('icao24', '')
            
            # Match against flight number or callsign
            if flight in callsign or flight in flight_num:
                return jsonify({
                    'found': True,
                    'flightNumber': flight,
                    'callsign': callsign,
                    'origin': f.get('estDepartureAirport', 'Unknown'),
                    'destination': f.get('estArrivalAirport', 'Unknown'),
                    'departureTime': format_time(f.get('firstSeen')),
                    'arrivalTime': format_time(f.get('lastSeen')),
                    'status': get_flight_status(f)
                })
        
        return jsonify({'found': False})
        
    except Exception as e:
        print(f"[FLIGHTTRACKER SEARCH] Error: {e}")
        return jsonify({'error': str(e), 'found': False}), 500

@flighttracker_bp.route('/live', methods=['GET'])
def get_live_aircraft():
    """Get live aircraft in a region"""
    region = request.args.get('region', 'usa').lower()
    
    if region not in REGIONS:
        return jsonify({'error': f'region must be one of: {list(REGIONS.keys())}'}), 400
    
    try:
        bbox = REGIONS[region]
        
        url = f"{OPENSKY_BASE}/states/all"
        params = {
            'lamin': bbox['lamin'],
            'lomin': bbox['lomin'],
            'lamax': bbox['lamax'],
            'lomax': bbox['lomax']
        }
        
        auth = get_auth()
        response = requests.get(url, params=params, auth=auth, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        states = data.get('states', [])
        total = len(states)
        
        # Map to aircraft objects
        aircraft = []
        for state in states:
            # Check if we have valid location data
            if state[5] is None or state[6] is None:
                continue
            
            # Skip aircraft on ground
            if state[8]:  # on_ground
                continue
            
            aircraft.append({
                'icao': state[0],
                'callsign': (state[1] or '').strip(),
                'country': state[2],
                'longitude': state[5],
                'latitude': state[6],
                'altitude': round(state[7] or 0),
                'onGround': state[8],
                'speed': round((state[9] or 0) * 1.944),  # m/s to knots
                'heading': state[10] or 0,
                'verticalRate': state[11] or 0
            })
        
        # Limit to 50 aircraft
        aircraft = aircraft[:50]
        
        return jsonify({
            'aircraft': aircraft,
            'total': total,
            'region': region,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'OpenSky API timeout', 'aircraft': []}), 504
    except Exception as e:
        print(f"[FLIGHTTRACKER LIVE] Error: {e}")
        return jsonify({'error': str(e), 'aircraft': []}), 500

@flighttracker_bp.route('/airport', methods=['GET'])
def get_airport_info():
    """Get information about an airport"""
    code = request.args.get('code', '').upper().strip()
    
    if not code:
        return jsonify({'error': 'code parameter required'}), 400
    
    if code not in AIRPORTS:
        return jsonify({'error': f'airport {code} not found'}), 404
    
    return jsonify(AIRPORTS[code])

# Helper functions

def format_time(unix_timestamp):
    """Convert unix timestamp to readable time"""
    if not unix_timestamp:
        return 'Unknown'
    try:
        dt = datetime.utcfromtimestamp(unix_timestamp)
        return dt.strftime('%H:%M UTC')
    except:
        return 'Unknown'

def get_flight_status(flight_data):
    """Determine flight status from OpenSky data"""
    arrival = flight_data.get('estArrivalTime')
    departure = flight_data.get('estDepartureTime')
    now = int(time.time())
    
    if arrival and arrival < now:
        return 'Landed'
    elif departure and departure > now:
        return 'Scheduled'
    else:
        return 'En Route'
