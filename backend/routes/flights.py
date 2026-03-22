"""
Flights Route - AviationStack API Integration
Features: Flight search and live flight tracker
"""
from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime
import random

flights_bp = Blueprint('flights', __name__)

# Rate limiting for free tier (AviationStack free = 100 calls/month)
_call_count = 0
MAX_FREE_CALLS = 90

def generate_fallback_flights(origin, destination, date, passengers):
    """Generate simulated flights when API limit reached"""
    airlines = ['AA', 'UA', 'DL', 'BA', 'AF', 'LH']
    airline_names = {
        'AA': 'American Airlines',
        'UA': 'United Airlines',
        'DL': 'Delta Airlines',
        'BA': 'British Airways',
        'AF': 'Air France',
        'LH': 'Lufthansa'
    }
    flights = []
    base_price = random.randint(150, 500)
    
    for i in range(6):
        code = random.choice(airlines)
        depart_h = 6 + i
        duration_h = random.randint(3, 8)
        arrive_h = depart_h + duration_h
        
        flights.append({
            "airline": airline_names[code],
            "airlineCode": code,
            "flightNumber": f"{code} {100 + i}",
            "from": origin,
            "to": destination,
            "depart": f"{depart_h:02d}:00",
            "arrive": f"{arrive_h:02d}:00",
            "duration": f"{duration_h}h {random.randint(0, 59)}m",
            "stops": "Non-stop" if random.random() > 0.4 else f"{random.randint(1, 2)} stop",
            "status": "scheduled",
            "price": base_price + random.randint(-50, 150),
            "terminal": f"Terminal {random.randint(1, 5)}",
            "gate": f"{chr(random.randint(65, 75))}{random.randint(1, 30)}"
        })
    
    return flights


@flights_bp.route('/', methods=['GET'])
def search_flights():
    """Search flights using AviationStack API"""
    global _call_count
    
    try:
        origin = request.args.get('from', '').upper()
        destination = request.args.get('to', '').upper()
        date = request.args.get('date', '')
        passengers = request.args.get('passengers', '1')
        
        if not all([origin, destination, date]):
            return jsonify({"error": "Missing parameters: from, to, date"}), 400
        
        aviationstack_key = os.environ.get('AVIATIONSTACK_KEY')
        
        # Check rate limit
        if _call_count >= MAX_FREE_CALLS:
            print(f"[WARNING] AviationStack API limit ({MAX_FREE_CALLS}) reached, using fallback")
            return jsonify({
                "flights": generate_fallback_flights(origin, destination, date, passengers),
                "source": "fallback",
                "warning": "API limit reached - showing simulated flights"
            })
        
        if not aviationstack_key or aviationstack_key == 'your_key_here':
            print("[WARNING] AVIATIONSTACK_KEY not configured, using fallback")
            return jsonify({
                "flights": generate_fallback_flights(origin, destination, date, passengers),
                "source": "fallback"
            })
        
        # Call AviationStack API
        print(f"[API] Calling AviationStack for {origin} to {destination} on {date}")
        _call_count += 1
        
        api_url = "http://api.aviationstack.com/v1/flights"
        params = {
            "access_key": aviationstack_key,
            "dep_iata": origin,
            "arr_iata": destination,
            "flight_date": date,
            "limit": 6
        }
        
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        flights = []
        
        # Handle unsuccessful API response
        if not data.get('data'):
            print("[INFO] No flights found from API, using fallback")
            return jsonify({
                "flights": generate_fallback_flights(origin, destination, date, passengers),
                "source": "fallback"
            })
        
        for flight in data.get('data', [])[:6]:
            try:
                # Extract flight info
                airline_name = flight.get('airline', {}).get('name', 'Unknown Airline')
                airline_code = flight.get('airline', {}).get('iata', 'XX')
                flight_iata = flight.get('flight', {}).get('iata', 'XXXX')
                dep_iata = flight.get('departure', {}).get('iata', origin)
                arr_iata = flight.get('arrival', {}).get('iata', destination)
                
                # Parse times
                dep_time_str = flight.get('departure', {}).get('scheduled', '')
                arr_time_str = flight.get('arrival', {}).get('scheduled', '')
                
                # Extract HH:MM from ISO format
                depart_time = dep_time_str.split('T')[1][:5] if dep_time_str else "N/A"
                arrive_time = arr_time_str.split('T')[1][:5] if arr_time_str else "N/A"
                
                # Calculate duration
                duration_str = "N/A"
                if dep_time_str and arr_time_str:
                    try:
                        dep = datetime.fromisoformat(dep_time_str.replace('Z', '+00:00'))
                        arr = datetime.fromisoformat(arr_time_str.replace('Z', '+00:00'))
                        diff = arr - dep
                        hours = int(diff.total_seconds() / 3600)
                        mins = int((diff.total_seconds() % 3600) / 60)
                        duration_str = f"{hours}h {mins}m"
                    except:
                        pass
                
                # Generate realistic price
                base_price = 100 + (len(origin) + len(destination)) * 15
                price = base_price + random.randint(50, 300)
                
                flights.append({
                    "airline": airline_name,
                    "airlineCode": airline_code,
                    "flightNumber": f"{airline_code} {flight_iata}",
                    "from": origin,
                    "to": destination,
                    "depart": depart_time,
                    "arrive": arrive_time,
                    "duration": duration_str,
                    "stops": "Non-stop",
                    "status": flight.get('flight_status', 'scheduled'),
                    "price": price,
                    "terminal": flight.get('departure', {}).get('terminal', ''),
                    "gate": flight.get('departure', {}).get('gate', '')
                })
            
            except Exception as e:
                print(f"[ERROR] Parsing flight: {str(e)}")
                continue
        
        if not flights:
            return jsonify({
                "flights": generate_fallback_flights(origin, destination, date, passengers),
                "source": "fallback"
            })
        
        return jsonify({"flights": flights, "source": "live"})
    
    except Exception as e:
        print(f"[ERROR] search_flights: {str(e)}")
        origin = request.args.get('from', 'ORD')
        destination = request.args.get('to', 'LAX')
        date = request.args.get('date', '')
        passengers = request.args.get('passengers', '1')
        
        return jsonify({
            "flights": generate_fallback_flights(origin, destination, date, passengers),
            "source": "fallback",
            "error": str(e)
        })


@flights_bp.route('/status', methods=['GET'])
def flight_status():
    """Track live flight status using AviationStack API"""
    global _call_count
    
    try:
        flight = request.args.get('flight', '').upper()
        
        if not flight:
            return jsonify({"error": "Missing parameter: flight"}), 400
        
        aviationstack_key = os.environ.get('AVIATIONSTACK_KEY')
        
        # Check rate limit
        if _call_count >= MAX_FREE_CALLS:
            print(f"[WARNING] AviationStack API limit reached")
            return jsonify({"error": "API limit reached"}), 429
        
        if not aviationstack_key or aviationstack_key == 'your_key_here':
            return jsonify({"error": "API not configured"}), 500
        
        print(f"[API] Tracking flight {flight}")
        _call_count += 1
        
        api_url = "http://api.aviationstack.com/v1/flights"
        params = {
            "access_key": aviationstack_key,
            "flight_iata": flight,
            "limit": 1
        }
        
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if not data.get('data') or len(data['data']) == 0:
            return jsonify({"error": "Flight not found"}), 404
        
        flight_data = data['data'][0]
        
        # Status mapping
        status_map = {
            "scheduled": ("Scheduled", "#3498db"),
            "active": ("In the Air", "#27ae60"),
            "landed": ("Landed", "#2ecc71"),
            "cancelled": ("Cancelled", "#e74c3c"),
            "incident": ("Incident", "#e74c3c"),
            "diverted": ("Diverted", "#f39c12"),
            "delayed": ("Delayed", "#f39c12")
        }
        
        flight_status_code = flight_data.get('flight_status', 'unknown')
        status_label, status_color = status_map.get(flight_status_code, ("Unknown", "#95a5a6"))
        
        # Parse times
        dep_scheduled = flight_data.get('departure', {}).get('scheduled', '')
        dep_actual = flight_data.get('departure', {}).get('actual', '')
        arr_scheduled = flight_data.get('arrival', {}).get('scheduled', '')
        arr_estimated = flight_data.get('arrival', {}).get('estimated', '')
        
        # Extract HH:MM
        dep_scheduled_time = dep_scheduled.split('T')[1][:5] if dep_scheduled else ""
        dep_actual_time = dep_actual.split('T')[1][:5] if dep_actual else dep_scheduled_time
        arr_scheduled_time = arr_scheduled.split('T')[1][:5] if arr_scheduled else ""
        arr_estimated_time = arr_estimated.split('T')[1][:5] if arr_estimated else arr_scheduled_time
        
        # Calculate delay
        delay = 0
        if dep_actual and dep_scheduled:
            try:
                dep_act = datetime.fromisoformat(dep_actual.replace('Z', '+00:00'))
                dep_sch = datetime.fromisoformat(dep_scheduled.replace('Z', '+00:00'))
                delay = int((dep_act - dep_sch).total_seconds() / 60)
            except:
                pass
        
        # Calculate progress (0-100)
        progress = 0
        try:
            if dep_actual or dep_scheduled:
                dep_time = datetime.fromisoformat((dep_actual or dep_scheduled).replace('Z', '+00:00'))
                arr_time = datetime.fromisoformat((arr_estimated or arr_scheduled).replace('Z', '+00:00'))
                now = datetime.utcnow().replace(tzinfo=dep_time.tzinfo)
                
                total = (arr_time - dep_time).total_seconds()
                elapsed = (now - dep_time).total_seconds()
                progress = max(0, min(100, int((elapsed / total) * 100)))
        except:
            pass
        
        # Duration
        duration_str = ""
        if dep_scheduled and arr_scheduled:
            try:
                dep = datetime.fromisoformat(dep_scheduled.replace('Z', '+00:00'))
                arr = datetime.fromisoformat(arr_scheduled.replace('Z', '+00:00'))
                diff = arr - dep
                hours = int(diff.total_seconds() / 3600)
                mins = int((diff.total_seconds() % 3600) / 60)
                duration_str = f"{hours}h {mins}m"
            except:
                pass
        
        return jsonify({
            "flightNumber": f"{flight_data.get('airline', {}).get('iata', 'XX')} {flight}",
            "airline": flight_data.get('airline', {}).get('name', 'Unknown'),
            "status": flight_status_code,
            "statusLabel": status_label,
            "statusColor": status_color,
            "from": {
                "airport": flight_data.get('departure', {}).get('airport', 'Unknown Airport'),
                "iata": flight_data.get('departure', {}).get('iata', ''),
                "city": flight_data.get('departure', {}).get('city', ''),
                "terminal": flight_data.get('departure', {}).get('terminal', ''),
                "gate": flight_data.get('departure', {}).get('gate', ''),
                "scheduled": dep_scheduled_time,
                "actual": dep_actual_time,
                "delay": delay if delay > 0 else 0
            },
            "to": {
                "airport": flight_data.get('arrival', {}).get('airport', 'Unknown Airport'),
                "iata": flight_data.get('arrival', {}).get('iata', ''),
                "city": flight_data.get('arrival', {}).get('city', ''),
                "terminal": flight_data.get('arrival', {}).get('terminal', ''),
                "gate": flight_data.get('arrival', {}).get('gate', ''),
                "scheduled": arr_scheduled_time,
                "estimated": arr_estimated_time
            },
            "aircraft": flight_data.get('aircraft', {}).get('model_name', 'Aircraft info unavailable'),
            "progress": progress,
            "duration": duration_str
        })
    
    except Exception as e:
        print(f"[ERROR] flight_status: {str(e)}")
        return jsonify({"error": str(e)}), 500
