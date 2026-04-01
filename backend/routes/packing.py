"""
Packing Route - AI-powered smart packing list generator using Groq
"""
from flask import Blueprint, request, jsonify
from db import get_collection
from datetime import datetime
import requests
import os
import json

packing_bp = Blueprint('packing', __name__)

GROQ_KEY = os.environ.get('GROQ_KEY')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_fallback_packing_list(destination, trip_type, days, weather, travelers):
    """Generate fallback packing list when Groq API is unavailable"""
    return {
        "destination": destination,
        "tripType": trip_type,
        "weather": weather,
        "categories": [
            {
                "name": "Clothing",
                "icon": "👕",
                "items": [
                    {"name": "T-Shirts", "quantity": 3, "essential": True, "reason": "Daily wear"},
                    {"name": "Shorts", "quantity": 2, "essential": True, "reason": "Warm weather staple"},
                    {"name": "Comfortable shoes", "quantity": 2, "essential": True, "reason": "Walking and exploration"},
                    {"name": "Light jacket", "quantity": 1, "essential": True, "reason": "Evening wear or AC indoors"},
                    {"name": "Underwear", "quantity": days, "essential": True, "reason": "Daily essential"}
                ]
            },
            {
                "name": "Toiletries",
                "icon": "🧴",
                "items": [
                    {"name": "Toothbrush & toothpaste", "quantity": 1, "essential": True, "reason": "Daily hygiene"},
                    {"name": "Sunscreen SPF 30+", "quantity": 1, "essential": True, "reason": "Sun protection"},
                    {"name": "Deodorant", "quantity": 1, "essential": True, "reason": "Personal hygiene"},
                    {"name": "Basic toiletries", "quantity": 1, "essential": True, "reason": "Shower and bath"}
                ]
            },
            {
                "name": "Documents",
                "icon": "📄",
                "items": [
                    {"name": "Passport", "quantity": 1, "essential": True, "reason": "Travel identification"},
                    {"name": "Travel insurance", "quantity": 1, "essential": True, "reason": "Emergency coverage"},
                    {"name": "Hotel confirmations", "quantity": 1, "essential": True, "reason": "Booking proof"}
                ]
            },
            {
                "name": "Electronics",
                "icon": "📱",
                "items": [
                    {"name": "Phone", "quantity": 1, "essential": True, "reason": "Communication and navigation"},
                    {"name": "Phone charger", "quantity": 1, "essential": True, "reason": "Keep phone powered"},
                    {"name": "Universal adapter", "quantity": 1, "essential": True, "reason": "Charge devices"}
                ]
            }
        ],
        "totalItems": 25,
        "tips": [
            "Pack light - you can buy items you forgot",
            "Keep valuables in carry-on luggage",
            "Roll clothes instead of folding to save space"
        ],
        "weatherWarning": f"Prepare for {weather} weather in {destination}",
        "source": "fallback"
    }


@packing_bp.route('/', methods=['POST'])
def generate_packing_list():
    """Generate AI-powered packing list using Groq API"""
    try:
        body = request.get_json()
        
        destination = body.get('destination', 'general destination')
        days = body.get('days', 7)
        
        # Check if Groq key is available
        if not GROQ_KEY or GROQ_KEY == 'your_key_here':
            print("[WARNING] GROQ_KEY not configured, using fallback packing list")
            fallback = generate_fallback_packing_list(
                destination, 'general', days, 'mixed', 'solo'
            )
            # Save fallback to MongoDB
            _save_packing_list(fallback, destination, days, 'fallback')
            return jsonify(fallback)
        
        # Build Groq prompt - infer trip nature from destination alone
        prompt = f"""You are an expert travel packing consultant with deep knowledge of destinations worldwide.
Create a highly personalized and detailed packing list for a {days}-day trip to {destination}.

CRITICAL INSTRUCTIONS:
1. Research {destination} thoroughly:
   - Climate, weather patterns, and seasonal considerations
   - Cultural dress codes, customs, and etiquette
   - Geographic features (mountains, beaches, deserts, cities, etc.)
   - Popular activities and attractions
   - Local infrastructure, amenities, and available services
   - Required documents/visas for {destination}
   - Altitude, water quality, and health considerations
   - Local transportation methods

2. Infer the nature of the trip ONLY from {destination}:
   - Don't assume a specific trip type; let {destination} guide you
   - Consider what a typical traveler does in {destination}
   - Account for the destination's characteristics in your recommendations

3. Return ONLY valid JSON with this exact structure:
{{
    "destination": "{destination}",
    "categories": [
        {{
            "name": "Category Name",
            "icon": "emoji",
            "items": [
                {{
                    "name": "Item name",
                    "quantity": 1,
                    "essential": true,
                    "reason": "Why this is specifically needed for {destination}"
                }}
            ]
        }}
    ],
    "totalItems": number,
    "tips": ["tip 1 specific to {destination}", "tip 2 specific to {destination}", "tip 3 specific to {destination}"],
    "weatherWarning": "specific warning for {destination} if needed"
}}

Must include these categories with {destination}-specific items:
1. Clothing - appropriate for the climate and culture of {destination}
2. Toiletries - account for what's available in {destination}
3. Documents - any special requirements or recommendations for {destination}
4. Electronics - voltage/adapter/connectivity needs for {destination}
5. Health & Medicine - altitude, diseases, water quality of {destination}
6. Activities & Gear - specific to what people DO in {destination}
7. Miscellaneous - unique items or customs for {destination}

For EACH item:
- Explain WHY it's needed in {destination} specifically
- Be precise about quantities for a {days}-day trip
- Mark as essential ONLY if truly critical for {destination}
- Consider the destination's infrastructure and what's available locally

Tips must be 3 practical, actionable tips that are UNIQUE to {destination}, not generic travel advice.
Total items should be realistic and tailored to {destination} and the {days}-day duration."""

        # Call Groq API
        print(f"[API] Calling Groq for packing list: {destination}")
        
        headers = {
            "Authorization": f"Bearer {GROQ_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        data = json.loads(ai_response)
        data['source'] = 'groq'
        
        # Save to MongoDB
        _save_packing_list(data, destination, days, 'groq')
        
        return jsonify(data)
        
    except Exception as e:
        print(f"[ERROR] packing route: {str(e)}")
        destination = body.get('destination', 'general destination') if 'body' in locals() else 'general'
        trip_type = body.get('tripType', 'general') if 'body' in locals() else 'general'
        days = body.get('days', 7) if 'body' in locals() else 7
        weather = body.get('weather', 'mixed') if 'body' in locals() else 'mixed'
        travelers = body.get('travelers', 'solo') if 'body' in locals() else 'solo'
        
        fallback = generate_fallback_packing_list(
            destination, trip_type, days, weather, travelers
        )
        # Save fallback to MongoDB
        _save_packing_list(fallback, destination, days, 'fallback')
        
        return jsonify(fallback)


# ═══════════════════════════════════════════════════════════════════════════
# HELPER & SAVED PACKING LISTS ROUTES
# ═══════════════════════════════════════════════════════════════════════════

def _save_packing_list(packing_data, destination, days, source):
    """Save packing list to MongoDB"""
    try:
        packing_lists = get_collection('packing_lists')
        doc = {
            'destination': destination,
            'days': days,
            'packing_data': packing_data,
            'saved_at': datetime.utcnow(),
            'source': source
        }
        insert_result = packing_lists.insert_one(doc)
        print(f"✅ Packing list saved to MongoDB with ID: {insert_result.inserted_id}")
    except Exception as e:
        print(f"⚠️ [MONGODB] Failed to save packing list: {str(e)}")
        # Continue anyway - don't crash the API response


@packing_bp.route('/saved', methods=['GET'])
def get_saved_packing_lists():
    """Retrieve saved packing lists for a given destination"""
    try:
        destination = request.args.get('destination', '')
        
        packing_lists = get_collection('packing_lists')
        
        if destination:
            # Search for specific destination (case-insensitive)
            docs = list(packing_lists.find(
                {'destination': {'$regex': destination, '$options': 'i'}}
            ).sort('saved_at', -1).limit(5))
        else:
            # Return most recent 5 if no destination specified
            docs = list(packing_lists.find().sort('saved_at', -1).limit(5))
        
        # Convert ObjectId to string for JSON serialization
        for doc in docs:
            doc['_id'] = str(doc['_id'])
        
        print(f"✅ Retrieved {len(docs)} saved packing lists for '{destination}'")
        return jsonify({"count": len(docs), "packing_lists": docs}), 200
        
    except Exception as e:
        print(f"❌ Error retrieving saved packing lists: {str(e)}")
        return jsonify({"error": "Failed to retrieve packing lists"}), 500
