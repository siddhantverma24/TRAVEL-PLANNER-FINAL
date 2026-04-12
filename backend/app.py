import sys
import os

# Ensure routes folder is in Python path
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db, get_collection
from datetime import datetime
import json
from dotenv import load_dotenv

# FIXED FOR DOCKER: Load environment variables from docker-compose .env file
# In Docker, this will load variables provided by docker-compose.yml (env_file: .env)
# In development, this enables loading from a local .env file if present
# No need to specify a path - load_dotenv() checks common locations
load_dotenv()

# Import API route blueprints
from routes.weather import weather_bp
from routes.currency import currency_bp
from routes.flights import flights_bp
from routes.hotels import hotels_bp
from routes.itinerary import itinerary_bp
from routes.maps import maps_bp
from routes.translate import translate_bp
from routes.visa import visa_bp
from routes.packing import packing_bp
from routes.phrases import phrases_bp
from routes.flighttracker import flighttracker_bp
from routes.quiz import quiz_bp
from routes.hero_ai import hero_ai_bp
from routes.ai_tools import ai_tools_bp

# FIXED FOR DOCKER: Don't serve static files from backend
# In Docker+Nginx setup, Nginx handles all frontend file serving
# Backend only serves API endpoints (no static_folder needed)
app = Flask(__name__)

# FIXED FOR DOCKER: Simplified CORS configuration for Docker deployment
# Allow requests from Nginx/frontend container communication
# In Docker, services communicate through the docker network with internal DNS
CORS(app, 
     resources={r"/api/*": {"origins": "*"}, r"/ai/*": {"origins": "*"}},
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"]
)

# ============= API ENDPOINTS =============

@app.route("/", methods=['GET'])
def api_root():
    """API status endpoint - root"""
    return jsonify({
        'status': 'online',
        'message': 'Travel Planner API is running',
        'version': '3.0.0',
        'features': ['weather', 'currency', 'flights', 'hotels', 'itinerary', 'translate', 'visa', 'ai']
    })

# Register API blueprints
app.register_blueprint(weather_bp, url_prefix='/api/weather')
app.register_blueprint(currency_bp, url_prefix='/api/currency')
app.register_blueprint(flights_bp, url_prefix='/api/flights')
app.register_blueprint(hotels_bp, url_prefix='/api/hotels')
app.register_blueprint(itinerary_bp, url_prefix='/api/itinerary')
app.register_blueprint(maps_bp, url_prefix='/api/maps')
app.register_blueprint(translate_bp, url_prefix='/api/translate')
app.register_blueprint(visa_bp, url_prefix='/api/visa')
app.register_blueprint(packing_bp, url_prefix='/api/packing')
app.register_blueprint(phrases_bp, url_prefix='/api/phrases')
app.register_blueprint(flighttracker_bp, url_prefix='/api/flighttracker')
app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
app.register_blueprint(hero_ai_bp, url_prefix='/api/hero-ai')
app.register_blueprint(ai_tools_bp, url_prefix='/ai')


@app.route('/favicon.ico')
def favicon():
    """Favicon - return 204 No Content"""
    return '', 204

@app.route("/api/health", methods=['GET'])
def health_check():
    """Health check with API status"""
    return jsonify({
        "status": "ok",
        "apis": {
            "weather": bool(os.environ.get('OPENWEATHER_KEY')),
            "currency": bool(os.environ.get('EXCHANGE_KEY')),
            "flights": bool(os.environ.get('AMADEUS_KEY')),
            "hotels": bool(os.environ.get('RAPIDAPI_KEY')),
            "maps": True,
            "itinerary": bool(os.environ.get('GROQ_KEY')),
            "translate": True,
            "visa": True
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error", "details": str(e)}), 500

# ---------------- SAVE TRIP ----------------
@app.route("/save-trip", methods=["POST"])
def save_trip():
    """Save a new trip with enhanced data"""
    try:
        data = request.json
        
        # Extract data
        trip_name = data.get("name", "Untitled Trip")
        locations = data.get("locations", [])
        total_distance = data.get("totalDistance", 0)
        
        if not locations:
            return jsonify({"error": "No locations provided"}), 400
        
        # conn = get_db_connection()  # Not needed yet
        # cursor = conn.cursor()

        # Insert trip with name and distance
        # cursor.execute(
        #     """INSERT INTO trips (trip_name, total_distance, created_at) 
        #        VALUES (%s, %s, %s)""",
        #     (trip_name, total_distance, datetime.now())
        # )
        trip_id = 0  # Fallback ID

        # Insert all locations
        # for order, loc in enumerate(locations, start=1):
        #     cursor.execute(
        #         """INSERT INTO locations 
        #            (trip_id, place_name, latitude, longitude, stop_order) 
        #            VALUES (%s, %s, %s, %s, %s)""",
        #         (trip_id, loc["name"], loc["lat"], loc["lon"], order)
        #     )

        # conn.commit()
        # cursor.close()
        # conn.close()

        return jsonify({
            "success": True,
            "message": "Trip saved successfully (database not connected)",
            "trip_id": trip_id
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- GET TRIPS ----------------
@app.route("/get-trips", methods=["GET"])
def get_trips():
    """Get all saved trips with complete information"""
    try:
        # conn = get_db_connection()  # Not needed yet
        # cursor = conn.cursor(dictionary=True)

        # Get all trips
        # cursor.execute("""
        #     SELECT id, trip_name, total_distance, created_at 
        #     FROM trips 
        #     ORDER BY created_at DESC
        # """)
        # trips = cursor.fetchall()

        result = []
        # for trip in trips:
        #     # Get locations for each trip
        #     cursor.execute(
        #         """SELECT place_name, latitude, longitude, stop_order 
        #            FROM locations 
        #            WHERE trip_id=%s 
        #            ORDER BY stop_order""",
        #         (trip["id"],)
        #     )
        #     locations = cursor.fetchall()
        #     
        #     # Format location data
        #     formatted_locations = [
        #         {
        #             "name": loc["place_name"],
        #             "lat": float(loc["latitude"]),
        #             "lon": float(loc["longitude"])
        #         }
        #         for loc in locations
        #     ]
        #     
        #     result.append({
        #         "id": str(trip["id"]),
        #         "name": trip["trip_name"],
        #         "totalDistance": float(trip["total_distance"]) if trip["total_distance"] else 0,
        #         "createdAt": trip["created_at"].isoformat(),
        #         "locations": formatted_locations
        #     })

        # cursor.close()
        # conn.close()
        
        return jsonify({
            "success": True,
            "trips": result,
            "count": len(result),
            "message": "Database not connected"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- DELETE TRIP ----------------
@app.route("/delete-trip/<int:trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    """Delete a trip and its locations"""
    try:
        # conn = get_db_connection()  # Not needed yet
        # cursor = conn.cursor()
        
        # Delete locations first (foreign key constraint)
        # cursor.execute("DELETE FROM locations WHERE trip_id=%s", (trip_id,))
        
        # Delete trip
        # cursor.execute("DELETE FROM trips WHERE id=%s", (trip_id,))
        
        # if cursor.rowcount == 0:
        #     conn.close()
        #     return jsonify({"error": "Trip not found"}), 404
        
        # conn.commit()
        # cursor.close()
        # conn.close()
        
        return jsonify({
            "success": True,
            "message": "Trip deleted successfully (database not connected)"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- GET STATISTICS ----------------
@app.route("/stats", methods=["GET"])
def get_stats():
    """Get overall statistics"""
    try:
        # conn = get_db_connection()  # Not needed yet
        # cursor = conn.cursor(dictionary=True)
        
        # Total trips
        # cursor.execute("SELECT COUNT(*) as count FROM trips")
        # total_trips = cursor.fetchone()["count"]
        total_trips = 0
        
        # Total locations
        # cursor.execute("SELECT COUNT(*) as count FROM locations")
        # total_locations = cursor.fetchone()["count"]
        total_locations = 0
        
        # Total distance
        # cursor.execute("SELECT SUM(total_distance) as total FROM trips")
        # result = cursor.fetchone()
        # total_distance = float(result["total"]) if result["total"] else 0
        total_distance = 0.0
        
        # Average locations per trip
        avg_locations = round(total_locations / total_trips, 1) if total_trips > 0 else 0
        
        # cursor.close()
        # conn.close()
        
        return jsonify({
            "total_trips": total_trips,
            "total_locations": total_locations,
            "total_distance": round(total_distance, 2),
            "average_locations_per_trip": avg_locations,
            "message": "Database not connected"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- TRAVEL SUGGESTIONS ----------------
@app.route("/travel-suggestions", methods=["POST"])
def travel_suggestions():
    """Get travel suggestions between source and destination"""
    data = request.json
    source = data.get("source", "")
    destination = data.get("destination", "")

    # Enhanced mock data with more variety
    suggestions = {
        "route": f"{source} → {destination}",
        "flights": [
            {"airline": "IndiGo", "price": "₹3,200", "duration": "2h 10m", "departure": "06:00", "class": "Economy"},
            {"airline": "Air India", "price": "₹3,800", "duration": "2h 05m", "departure": "09:30", "class": "Economy"},
            {"airline": "Vistara", "price": "₹4,500", "duration": "2h 00m", "departure": "14:15", "class": "Premium Economy"}
        ],
        "buses": [
            {"operator": "Volvo AC", "price": "₹1,200", "duration": "10h", "departure": "22:00", "type": "Sleeper AC"},
            {"operator": "IntrCity", "price": "₹950", "duration": "12h", "departure": "20:30", "type": "Semi-Sleeper"},
            {"operator": "RedBus Express", "price": "₹1,400", "duration": "9h 30m", "departure": "23:00", "type": "Luxury AC"}
        ],
        "trains": [
            {"name": "Rajdhani Express", "price": "₹1,500", "duration": "8h", "departure": "16:30", "class": "AC 2-Tier"},
            {"name": "Shatabdi", "price": "₹1,200", "duration": "7h", "departure": "06:00", "class": "AC Chair Car"},
            {"name": "Duronto Express", "price": "₹1,800", "duration": "7h 30m", "departure": "21:00", "class": "AC 3-Tier"}
        ]
    }

    return jsonify(suggestions)

# ---------------- SEARCH LOCATIONS ----------------
@app.route("/search-locations", methods=["GET"])
def search_locations():
    """Search for locations in saved trips"""
    try:
        query = request.args.get("q", "").lower()
        
        if len(query) < 2:
            return jsonify({"results": []})
        
        # conn = get_db_connection()  # Not needed yet
        # cursor = conn.cursor(dictionary=True)
        
        # cursor.execute(
        #     """SELECT DISTINCT place_name, latitude, longitude 
        #        FROM locations 
        #        WHERE LOWER(place_name) LIKE %s 
        #        LIMIT 10""",
        #     (f"%{query}%",)
        # )
        
        # results = cursor.fetchall()
        # cursor.close()
        # conn.close()
        results = []
        
        return jsonify({
            "results": [
                {
                    "name": r["place_name"],
                    "lat": float(r["latitude"]),
                    "lon": float(r["longitude"])
                }
                for r in results
            ],
            "message": "Database not connected"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # FIXED FOR DOCKER: Updated startup message to reflect Docker environment
    print("=" * 70)
    print("✓ Travel Planner Backend API - Docker Edition")
    print("=" * 70)
    print("Server running on: http://0.0.0.0:5000 (inside Docker container)")
    print("Access from host: http://localhost:5000 or http://localhost/api (via Nginx)")
    print("Docker Network: travel-planner-network")
    print("=" * 70)
    print("API Endpoints:")
    print("  GET    /                    - API status (root endpoint)")
    print("  GET    /api/health          - Health check with API availability")
    print("  POST   /save-trip           - Save a new trip")
    print("  GET    /get-trips           - Get all trips")
    print("  DELETE /delete-trip/<id>    - Delete a trip")
    print("  GET    /stats               - Get statistics")
    print("  GET    /api/weather/*       - Weather API")
    print("  GET    /api/currency/*      - Currency API")
    print("  GET    /api/flights/*       - Flights API")
    print("  GET    /api/hotels/*        - Hotels API")
    print("  POST   /api/itinerary/*     - Itinerary API")
    print("  GET    /api/maps/*          - Maps API")
    print("  POST   /api/translate/*     - Translate API")
    print("  GET    /api/visa/*          - Visa API")
    print("  POST   /api/hero-ai/*       - AI Itinerary Generation")
    print("=" * 70)
    print("NOTE: In Docker, Nginx (port 80) serves frontend files and proxies /api/* to backend.")
    print("      This backend serves ONLY API endpoints on port 5000.")
    print("=" * 70)
    
    # FIXED FOR DOCKER: Server configuration ready for Docker+Nginx
    # - host="0.0.0.0" listens on all interfaces (required for Docker)
    # - port=5000 matches docker-compose mapping
    # - debug=True enables auto-reload for development (set via FLASK_ENV env var)
    app.run(host="0.0.0.0", port=5000, debug=True)
