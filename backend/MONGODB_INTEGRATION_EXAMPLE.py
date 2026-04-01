"""
EXAMPLE: MongoDB Integration in Itinerary Route

This file demonstrates how to use get_collection() from db.py to save and 
retrieve itineraries from MongoDB. Copy and adapt to your actual itinerary.py
"""

# ═══════════════════════════════════════════════════════════════════════════
# IMPORTS (Add these to your routes/itinerary.py)
# ═══════════════════════════════════════════════════════════════════════════

from flask import Blueprint, request, jsonify
from bson import ObjectId  # For MongoDB Object IDs
from db import get_collection  # Import the MongoDB helper
import os
import json
import requests
from datetime import datetime, timedelta

itinerary_bp = Blueprint('itinerary', __name__)


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE 1: SAVE ITINERARY TO MONGODB
# ═══════════════════════════════════════════════════════════════════════════

@itinerary_bp.route('/', methods=['POST'])
def generate_itinerary():
    """Generate an itinerary and save it to MongoDB"""
    try:
        data = request.json
        destination = data.get('destination', '').strip()
        days = int(data.get('days', 5))
        
        # Validate input
        if not destination:
            return jsonify({"error": "Destination required"}), 400
        
        # ... Generate itinerary with AI (your existing code) ...
        itinerary_data = {
            "destination": destination,
            "days": days,
            # ... other fields from AI generation ...
        }
        
        # GET THE COLLECTION (MongoDB)
        itineraries = get_collection('itineraries')
        
        # ADD METADATA
        itinerary_data['created_at'] = datetime.utcnow()
        itinerary_data['updated_at'] = datetime.utcnow()
        itinerary_data['user_id'] = data.get('user_id', 'anonymous')  # Track user if available
        
        # INSERT INTO MONGODB
        result = itineraries.insert_one(itinerary_data)
        
        # Return the saved document with its MongoDB ID
        itinerary_data['_id'] = str(result.inserted_id)  # Convert ObjectId to string for JSON
        
        print(f"✅ Itinerary saved with ID: {result.inserted_id}")
        return jsonify(itinerary_data), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE 2: RETRIEVE ITINERARY BY ID
# ═══════════════════════════════════════════════════════════════════════════

@itinerary_bp.route('/<itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id):
    """Retrieve a saved itinerary from MongoDB"""
    try:
        # VALIDATE MONGODB OBJECT ID
        if not ObjectId.is_valid(itinerary_id):
            return jsonify({"error": "Invalid itinerary ID"}), 400
        
        # GET COLLECTION
        itineraries = get_collection('itineraries')
        
        # FIND DOCUMENT BY ID
        itinerary = itineraries.find_one({'_id': ObjectId(itinerary_id)})
        
        if not itinerary:
            return jsonify({"error": "Itinerary not found"}), 404
        
        # Convert ObjectId to string for JSON serialization
        itinerary['_id'] = str(itinerary['_id'])
        
        print(f"✅ Retrieved itinerary: {itinerary_id}")
        return jsonify(itinerary), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE 3: LIST ALL ITINERARIES FOR A USER
# ═══════════════════════════════════════════════════════════════════════════

@itinerary_bp.route('/user/<user_id>', methods=['GET'])
def get_user_itineraries(user_id):
    """Get all itineraries created by a specific user"""
    try:
        # GET COLLECTION
        itineraries = get_collection('itineraries')
        
        # FIND ALL DOCUMENTS WHERE user_id MATCHES
        user_itineraries = list(itineraries.find({'user_id': user_id}))
        
        # Convert ObjectIds to strings
        for itinerary in user_itineraries:
            itinerary['_id'] = str(itinerary['_id'])
        
        print(f"✅ Found {len(user_itineraries)} itineraries for user: {user_id}")
        return jsonify({"count": len(user_itineraries), "itineraries": user_itineraries}), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE 4: UPDATE AN ITINERARY
# ═══════════════════════════════════════════════════════════════════════════

@itinerary_bp.route('/<itinerary_id>', methods=['PUT'])
def update_itinerary(itinerary_id):
    """Update an existing itinerary"""
    try:
        if not ObjectId.is_valid(itinerary_id):
            return jsonify({"error": "Invalid itinerary ID"}), 400
        
        data = request.json
        
        # GET COLLECTION
        itineraries = get_collection('itineraries')
        
        # UPDATE THE DOCUMENT
        update_data = {
            **data,  # Merge input data
            'updated_at': datetime.utcnow()
        }
        
        result = itineraries.update_one(
            {'_id': ObjectId(itinerary_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Itinerary not found"}), 404
        
        # Retrieve updated document
        updated = itineraries.find_one({'_id': ObjectId(itinerary_id)})
        updated['_id'] = str(updated['_id'])
        
        print(f"✅ Updated itinerary: {itinerary_id}")
        return jsonify(updated), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE 5: DELETE AN ITINERARY
# ═══════════════════════════════════════════════════════════════════════════

@itinerary_bp.route('/<itinerary_id>', methods=['DELETE'])
def delete_itinerary(itinerary_id):
    """Delete an itinerary from MongoDB"""
    try:
        if not ObjectId.is_valid(itinerary_id):
            return jsonify({"error": "Invalid itinerary ID"}), 400
        
        # GET COLLECTION
        itineraries = get_collection('itineraries')
        
        # DELETE THE DOCUMENT
        result = itineraries.delete_one({'_id': ObjectId(itinerary_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Itinerary not found"}), 404
        
        print(f"✅ Deleted itinerary: {itinerary_id}")
        return jsonify({"message": "Itinerary deleted successfully"}), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE 6: ADVANCED QUERIES WITH MONGODB
# ═══════════════════════════════════════════════════════════════════════════

@itinerary_bp.route('/search', methods=['POST'])
def search_itineraries():
    """Advanced search with filters"""
    try:
        data = request.json
        destination = data.get('destination')
        min_days = data.get('min_days', 0)
        max_days = data.get('max_days', 999)
        budget_level = data.get('budget_level')  # 'budget', 'midrange', 'luxury'
        
        # BUILD MONGODB QUERY
        query = {}
        if destination:
            query['destination'] = {'$regex': destination, '$options': 'i'}  # Case-insensitive search
        
        query['days'] = {'$gte': min_days, '$lte': max_days}
        
        if budget_level:
            query['budget_level'] = budget_level
        
        # GET COLLECTION
        itineraries = get_collection('itineraries')
        
        # EXECUTE QUERY
        results = list(itineraries.find(query).sort('created_at', -1).limit(10))
        
        # Convert ObjectIds to strings
        for itinerary in results:
            itinerary['_id'] = str(itinerary['_id'])
        
        print(f"✅ Found {len(results)} matching itineraries")
        return jsonify({"count": len(results), "results": results}), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# KEY MONGODB PATTERNS
# ═══════════════════════════════════════════════════════════════════════════

"""
COMMON MongoDB OPERATIONS:

1. INSERT
   collection.insert_one(document)
   collection.insert_many([doc1, doc2, ...])

2. FIND
   collection.find_one({'_id': ObjectId(id)})
   collection.find({'status': 'active'})
   collection.find({'destination': {'$regex': 'Paris', '$options': 'i'}})  # Case-insensitive

3. UPDATE
   collection.update_one({'_id': id}, {'$set': {...}})
   collection.replace_one({'_id': id}, new_document)

4. DELETE
   collection.delete_one({'_id': id})
   collection.delete_many({'status': 'inactive'})

5. AGGREGATION (like SQL GROUP BY)
   collection.aggregate([
       {'$match': {'destination': 'Paris'}},
       {'$group': {'_id': '$budget_level', 'count': {'$sum': 1}}}
   ])

6. COUNTING
   collection.count_documents({'status': 'active'})

7. SORTING
   collection.find().sort('created_at', -1)  # -1 = descending, 1 = ascending

8. PAGINATION
   collection.find().skip(10).limit(5)

MongoDB Query Operators:
   $eq, $ne, $gt, $gte, $lt, $lte
   $and, $or, $not
   $in, $nin
   $regex (for text search)
   $exists (check field exists)
"""

# ═══════════════════════════════════════════════════════════════════════════
# MONGODB DATA MODEL FOR ITINERARIES
# ═══════════════════════════════════════════════════════════════════════════

"""
Example document structure in MongoDB:

{
  "_id": ObjectId("..."),
  "destination": "Paris",
  "days": 5,
  "budget_level": "midrange",
  "traveler_type": "solo",
  "interests": ["museums", "food", "architecture"],
  "user_id": "user123",
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z"),
  "days_schedule": [
    {
      "day": 1,
      "title": "Arrival & First Impressions",
      "activities": [
        {
          "time": "09:00",
          "activity": "Arrival at airport",
          "cost": 0
        }
      ]
    }
  ],
  "total_estimated_cost": 600,
  "cost_breakdown": {
    "accommodation": 300,
    "food_and_dining": 180,
    "activities": 100,
    "transportation": 20
  }
}
"""
