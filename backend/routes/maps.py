"""
Maps/Geocoding Route - OpenStreetMap Nominatim API Integration
"""
from flask import Blueprint, request, jsonify
import requests
from cachetools import TTLCache

maps_bp = Blueprint('maps', __name__)
geo_cache = TTLCache(maxsize=100, ttl=3600)  # Cache for 1 hour

@maps_bp.route('/search', methods=['GET'])
def search_location():
    # LIVE API: OpenStreetMap Nominatim (FREE, no key needed)
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({"error": "Search query required"}), 400
        
        # Check cache
        cache_key = query.lower()
        if cache_key in geo_cache:
            return jsonify(geo_cache[cache_key])
        
        print(f"[API] Calling Nominatim for {query}")
        
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": query,
            "format": "json",
            "limit": 10
        }
        headers = {
            "User-Agent": "TravelPlanner/1.0"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        # Map response
        results = []
        for item in data:
            results.append({
                "name": item.get('name', ''),
                "type": item.get('type', ''),
                "lat": float(item.get('lat', 0)),
                "lon": float(item.get('lon', 0)),
                "address": item.get('display_name', ''),
                "boundingbox": item.get('boundingbox', [])
            })
        
        result = {
            "query": query,
            "results": results
        }
        
        # Cache result
        geo_cache[cache_key] = result
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] maps route: {str(e)}")
        return jsonify({"error": "Failed to search location"}), 500
    except Exception as e:
        print(f"[ERROR] maps route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@maps_bp.route('/airport', methods=['GET'])
def find_airport():
    # Find airport for a state/city
    try:
        state = request.args.get('state', '').strip()
        if not state:
            return jsonify({"error": "State parameter required"}), 400
        
        query = f"{state} airport"
        cache_key = query.lower()
        
        if cache_key in geo_cache:
            result = geo_cache[cache_key]
            if result.get('results'):
                return jsonify(result['results'][0])
            return jsonify({"error": "Airport not found"}), 404
        
        print(f"[API] Calling Nominatim for airport: {state}")
        
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": query,
            "format": "json",
            "limit": 1
        }
        headers = {
            "User-Agent": "TravelPlanner/1.0"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if not data:
            return jsonify({"error": "Airport not found"}), 404
        
        item = data[0]
        result = {
            "name": item.get('name', ''),
            "type": item.get('type', ''),
            "lat": float(item.get('lat', 0)),
            "lon": float(item.get('lon', 0)),
            "address": item.get('display_name', '')
        }
        
        geo_cache[cache_key] = {"results": [result]}
        return jsonify(result)
        
    except Exception as e:
        print(f"[ERROR] maps/airport route: {str(e)}")
        return jsonify({"error": str(e)}), 500
