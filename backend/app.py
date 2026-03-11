from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    """API status endpoint"""
    return jsonify({
        'status': 'online',
        'message': 'TravelFlow API is running',
        'version': '2.0.0',
        'database': 'MySQL'
    })

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
        
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert trip with name and distance
        cursor.execute(
            """INSERT INTO trips (trip_name, total_distance, created_at) 
               VALUES (%s, %s, %s)""",
            (trip_name, total_distance, datetime.now())
        )
        trip_id = cursor.lastrowid

        # Insert all locations
        for order, loc in enumerate(locations, start=1):
            cursor.execute(
                """INSERT INTO locations 
                   (trip_id, place_name, latitude, longitude, stop_order) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (trip_id, loc["name"], loc["lat"], loc["lon"], order)
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Trip saved successfully",
            "trip_id": trip_id
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- GET TRIPS ----------------
@app.route("/get-trips", methods=["GET"])
def get_trips():
    """Get all saved trips with complete information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all trips
        cursor.execute("""
            SELECT id, trip_name, total_distance, created_at 
            FROM trips 
            ORDER BY created_at DESC
        """)
        trips = cursor.fetchall()

        result = []
        for trip in trips:
            # Get locations for each trip
            cursor.execute(
                """SELECT place_name, latitude, longitude, stop_order 
                   FROM locations 
                   WHERE trip_id=%s 
                   ORDER BY stop_order""",
                (trip["id"],)
            )
            locations = cursor.fetchall()
            
            # Format location data
            formatted_locations = [
                {
                    "name": loc["place_name"],
                    "lat": float(loc["latitude"]),
                    "lon": float(loc["longitude"])
                }
                for loc in locations
            ]
            
            result.append({
                "id": str(trip["id"]),
                "name": trip["trip_name"],
                "totalDistance": float(trip["total_distance"]) if trip["total_distance"] else 0,
                "createdAt": trip["created_at"].isoformat(),
                "locations": formatted_locations
            })

        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "trips": result,
            "count": len(result)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- DELETE TRIP ----------------
@app.route("/delete-trip/<int:trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    """Delete a trip and its locations"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Delete locations first (foreign key constraint)
        cursor.execute("DELETE FROM locations WHERE trip_id=%s", (trip_id,))
        
        # Delete trip
        cursor.execute("DELETE FROM trips WHERE id=%s", (trip_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Trip not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Trip deleted successfully"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- GET STATISTICS ----------------
@app.route("/stats", methods=["GET"])
def get_stats():
    """Get overall statistics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Total trips
        cursor.execute("SELECT COUNT(*) as count FROM trips")
        total_trips = cursor.fetchone()["count"]
        
        # Total locations
        cursor.execute("SELECT COUNT(*) as count FROM locations")
        total_locations = cursor.fetchone()["count"]
        
        # Total distance
        cursor.execute("SELECT SUM(total_distance) as total FROM trips")
        result = cursor.fetchone()
        total_distance = float(result["total"]) if result["total"] else 0
        
        # Average locations per trip
        avg_locations = round(total_locations / total_trips, 1) if total_trips > 0 else 0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "total_trips": total_trips,
            "total_locations": total_locations,
            "total_distance": round(total_distance, 2),
            "average_locations_per_trip": avg_locations
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
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            """SELECT DISTINCT place_name, latitude, longitude 
               FROM locations 
               WHERE LOWER(place_name) LIKE %s 
               LIMIT 10""",
            (f"%{query}%",)
        )
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            "results": [
                {
                    "name": r["place_name"],
                    "lat": float(r["latitude"]),
                    "lon": float(r["longitude"])
                }
                for r in results
            ]
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 TravelFlow Backend Server - MySQL Edition")
    print("=" * 60)
    print("Server running on: http://127.0.0.1:5001")
    print("Database: MySQL (travel_planner)")
    print("=" * 60)
    print("API Endpoints:")
    print("  GET    /                    - API status")
    print("  POST   /save-trip           - Save a new trip")
    print("  GET    /get-trips           - Get all trips")
    print("  DELETE /delete-trip/<id>    - Delete a trip")
    print("  GET    /stats               - Get statistics")
    print("  POST   /travel-suggestions  - Get travel options")
    print("  GET    /search-locations    - Search saved locations")
    print("=" * 60)
    
    app.run(port=5001, debug=True)